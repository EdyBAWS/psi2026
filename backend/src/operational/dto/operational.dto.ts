import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { StatusGeneral, StatusReparatie } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

// --- VEHICULE ---
export class CreateVehiculDto {
  @IsString() numarInmatriculare: string;
  @IsString() marca: string;
  @IsString() model: string;
  @IsOptional() @IsString() vin?: string;
  @IsNumber() idClient: number;
  @IsOptional() @IsEnum(StatusGeneral) status?: StatusGeneral;
}
export class UpdateVehiculDto extends PartialType(CreateVehiculDto) {}

// --- DOSARE DAUNĂ ---
export class CreateDosarDaunaDto {
  @IsString() numarDosar: string;
  @IsNumber() idClient: number;
  @IsNumber() idVehicul: number;
  @IsOptional() @IsNumber() idAsigurator?: number;
  @IsOptional() @IsEnum(StatusGeneral) status?: StatusGeneral;
}
export class UpdateDosarDaunaDto extends PartialType(CreateDosarDaunaDto) {}

// --- COMENZI REPARAȚIE ---
export class CreateComandaDto {
  @IsString() numarComanda: string;
  @IsOptional() @IsDateString() dataPreconizata?: string;
  @IsOptional() @IsNumber() idDosar?: number;
  @IsOptional() @IsNumber() idClient?: number;
  @IsOptional() @IsNumber() idVehicul?: number;
  @IsOptional() @IsNumber() idAngajat?: number;
  @IsOptional() @IsEnum(StatusReparatie) status?: StatusReparatie;
}
export class UpdateComandaDto extends PartialType(CreateComandaDto) {}