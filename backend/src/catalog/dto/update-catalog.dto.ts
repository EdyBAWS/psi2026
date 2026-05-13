import { PartialType } from '@nestjs/mapped-types';
import { CreateManoperaDto, CreatePiesaDto, CreateKitDto } from './create-catalog.dto';

export class UpdatePiesaDto extends PartialType(CreatePiesaDto) {}
export class UpdateManoperaDto extends PartialType(CreateManoperaDto) {}
export class UpdateKitDto extends PartialType(CreateKitDto) {}
