import { PartialType } from '@nestjs/mapped-types';
import { CreateEntitatiDto } from './create-entitati.dto';

export class UpdateEntitatiDto extends PartialType(CreateEntitatiDto) {}
