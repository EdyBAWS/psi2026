import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturareDto } from './create-facturare.dto';

export class UpdateFacturareDto extends PartialType(CreateFacturareDto) {}
