import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createPatientDto: CreatePatientDto) {
    try {
      const document = createPatientDto.documento.replace(/\D/g, '');

      const birthDate = new Date(createPatientDto.dataNascimento);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Allow today

      if (birthDate > today) {
        throw new BadRequestException('Data de nascimento não pode ser no futuro.');
      }

      const patient = await this.prisma.patient.create({
        data: {
          nome: createPatientDto.nome,
          documento: document,
          dataNascimento: birthDate,
        },
      });
      return patient;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Documento já cadastrado.');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count(),
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
