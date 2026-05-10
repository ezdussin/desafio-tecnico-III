import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { DicomModality } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createExamDto: CreateExamDto) {
    const { idempotencyKey, patientId, modalidade, dataExame } = createExamDto;

    return await this.prisma.$transaction(async (tx) => {
      const existingExam = await tx.exam.findUnique({
        where: { idempotencyKey },
      });

      if (existingExam) {
        return { data: existingExam, isExisting: true };
      }

      const patientExists = await tx.patient.findUnique({
        where: { id: patientId },
      });

      if (!patientExists) {
        throw new BadRequestException('Paciente não encontrado.');
      }

      const examDate = new Date(dataExame);
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0); // Start of today

      if (examDate < yesterday) {
        throw new BadRequestException('Data do exame não pode ser no passado.');
      }

      try {
        const newExam = await tx.exam.create({
          data: {
            idempotencyKey,
            patientId,
            modalidade: modalidade as DicomModality,
            dataExame: examDate
          },
        });

        return { data: newExam, isExisting: false };
      } catch (error: any) {
        if (error.code === 'P2002') {
          const doubleCheckExam = await tx.exam.findUnique({
            where: { idempotencyKey },
          });
          if (doubleCheckExam) {
            return { data: doubleCheckExam, isExisting: true };
          }
        }
        throw error;
      }
    });
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { patient: true },
      }),
      this.prisma.exam.count(),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
