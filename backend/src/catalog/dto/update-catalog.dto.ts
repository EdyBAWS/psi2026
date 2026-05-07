import { PartialType } from '@nestjs/mapped-types';
import { CreateManoperaDto, CreatePiesaDto } from './create-catalog.dto';

export class UpdatePiesaDto extends PartialType(CreatePiesaDto) {}
export class UpdateManoperaDto extends PartialType(CreateManoperaDto) {}
