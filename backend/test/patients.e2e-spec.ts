import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.exam.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('/pacientes (POST) - Success', async () => {
    const payload = {
      nome: 'E2E Patient',
      documento: '11111111111',
      dataNascimento: '1990-01-01'
    };

    const response = await request(app.getHttpServer())
      .post('/pacientes')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe(payload.nome);
  });

  it('/pacientes (POST) - Duplicate Document (409)', async () => {
    const payload = {
      nome: 'Duplicate Patient',
      documento: '11111111111',
      dataNascimento: '1995-05-05'
    };

    await request(app.getHttpServer())
      .post('/pacientes')
      .send(payload)
      .expect(409);
  });

  it('/pacientes (GET) - Pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/pacientes?page=1&pageSize=10')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
