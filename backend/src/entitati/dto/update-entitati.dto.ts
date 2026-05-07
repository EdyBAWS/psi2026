import { PartialType } from '@nestjs/mapped-types';
import {
  CreateAngajatDto,
  CreateAsiguratorDto,
  CreateClientDto,
} from './create-entitati.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
export class UpdateAngajatDto extends PartialType(CreateAngajatDto) {}
export class UpdateAsiguratorDto extends PartialType(CreateAsiguratorDto) {}
