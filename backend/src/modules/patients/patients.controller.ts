import { Controller, Get, Post, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('pacientes')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.patientsService.findAll(page, pageSize);
  }
}
