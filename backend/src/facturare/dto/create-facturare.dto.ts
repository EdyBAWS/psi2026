import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFacturaItemDto {
  @IsString()
  descriere: string;

  @IsNumber()
  cantitate: number;

  @IsNumber()
  pretUnitar: number;

  @IsOptional()
  @IsNumber()
  idPiesa?: number;

  @IsOptional()
  @IsNumber()
  idManopera?: number;
}

export class CreateFacturareDto {
  @IsNumber()
  numar: number;

  @IsOptional()
  @IsString()
  serie?: string;

  // idClient = beneficiarul (proprietarul masinii) - intotdeauna prezent
  @IsNumber()
  idClient: number;

  // idAsigurator = platitorul (doar pentru dosare RCA/CASCO - Varianta A)
  @IsOptional()
  @IsNumber()
  idAsigurator?: number;

  @IsOptional()
  @IsNumber()
  idComanda?: number;

  @IsDateString()
  scadenta: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaItemDto)
  iteme: CreateFacturaItemDto[];
}
