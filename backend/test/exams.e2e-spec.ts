import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';
import { randomUUID } from 'crypto';

describe('ExamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let patientId: string;

  // UUID v4 keys for idempotency tests
  const KEY_INITIAL = randomUUID();
  const KEY_INVALID_PATIENT = randomUUID();
  const KEY_CONCURRENT = randomUUID();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Cleanup database
    await prisma.exam.deleteMany();
    await prisma.patient.deleteMany();

    // Create a patient for the tests
    const patient = await prisma.patient.create({
      data: {
        nome: 'Patient for Exam',
        documento: '22222222222',
        dataNascimento: new Date('1985-10-10')
      }
    });
    patientId = patient.id;
  });

  afterAll(async () => {
    await prisma.exam.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('/exames (POST) - Success (201)', async () => {
    const payload = {
      idempotencyKey: KEY_INITIAL,
      patientId: patientId,
      modalidade: 'CT',
      dataExame: new Date().toISOString()
    };

    const response = await request(app.getHttpServer())
      .post('/exames')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.idempotencyKey).toBe(payload.idempotencyKey);
  });

  it('/exames (POST) - Idempotency: repeat returns 200 OK', async () => {
    const payload = {
      idempotencyKey: KEY_INITIAL,
      patientId: patientId,
      modalidade: 'CT',
      dataExame: new Date().toISOString()
    };

    const response = await request(app.getHttpServer())
      .post('/exames')
      .send(payload)
      .expect(200);

    expect(response.body.idempotencyKey).toBe(payload.idempotencyKey);
  });

  it('/exames (POST) - Non-existent patient returns 400', async () => {
    const payload = {
      idempotencyKey: KEY_INVALID_PATIENT,
      patientId: '00000000-0000-0000-0000-000000000000',
      modalidade: 'MR',
      dataExame: new Date().toISOString()
    };

    await request(app.getHttpServer())
      .post('/exames')
      .send(payload)
      .expect(400);
  });

  it('/exames (POST) - Concurrency: only one exam persisted', async () => {
    const payload = {
      idempotencyKey: KEY_CONCURRENT,
      patientId: patientId,
      modalidade: 'US',
      dataExame: new Date().toISOString()
    };

    // Send 3 requests simultaneously
    const results = await Promise.all([
      request(app.getHttpServer()).post('/exames').send(payload),
      request(app.getHttpServer()).post('/exames').send(payload),
      request(app.getHttpServer()).post('/exames').send(payload)
    ]);

    const statuses = results.map(r => r.status);
    expect(statuses).toContain(201);
    expect(statuses.every(s => s === 201 || s === 200)).toBe(true);

    const count = await prisma.exam.count({ where: { idempotencyKey: KEY_CONCURRENT } });
    expect(count).toBe(1);
  });

  it('/exames (GET) - Paginated list returns correct structure', async () => {
    const response = await request(app.getHttpServer())
      .get('/exames?page=1&pageSize=10')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('totalPages');
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0]).toHaveProperty('patient');
    }
  });

  it('/exames (POST) - Invalid modality returns 400', async () => {
    const payload = {
      idempotencyKey: randomUUID(),
      patientId: patientId,
      modalidade: 'INVALID_MODALITY',
      dataExame: new Date().toISOString()
    };

    await request(app.getHttpServer())
      .post('/exames')
      .send(payload)
      .expect(400);
  });
});
