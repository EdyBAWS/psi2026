import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModalitateIncasare } from '@prisma/client';

export class AlocareIncasareDto {
  @IsNumber()
  idFactura: number;

  @IsNumber()
  @Min(0.01)
  sumaAlocata: number;
}

export class CreateIncasareDto {
  // Beneficiarul (proprietarul masinii) - optional pentru incasari de la asigurator
  @IsOptional()
  @IsNumber()
  idClient?: number;

  // Platitorul asigurator (Varianta A - plata directa de la asigurator)
  @IsOptional()
  @IsNumber()
  idAsigurator?: number;

  @IsNumber()
  @Min(0.01)
  sumaIncasata: number;

  @IsEnum(ModalitateIncasare)
  modalitate: ModalitateIncasare;

  @IsOptional()
  @IsString()
  referinta?: string;

  @IsDateString()
  data: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlocareIncasareDto)
  alocari: AlocareIncasareDto[];
}
