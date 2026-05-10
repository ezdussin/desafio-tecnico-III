import { Controller, Get, Post, Body, Query, ParseIntPipe, DefaultValuePipe, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) { }

  @Post()
  async create(@Body() createExamDto: CreateExamDto, @Res() res: Response) {
    const result = await this.examsService.create(createExamDto);

    if (result.isExisting) {
      return res.status(HttpStatus.OK).json(result.data);
    }

    return res.status(HttpStatus.CREATED).json(result.data);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.examsService.findAll(page, pageSize);
  }
}
