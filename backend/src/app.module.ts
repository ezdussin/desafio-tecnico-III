import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [PrismaModule, PatientsModule, ExamsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
