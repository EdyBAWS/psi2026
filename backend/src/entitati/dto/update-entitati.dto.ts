import { PartialType } from '@nestjs/mapped-types';
import { CreateAsiguratorDto } from './create-entitati.dto';

// Folosim noua denumire a clasei
export class UpdateEntitatiDto extends PartialType(CreateAsiguratorDto) {}
