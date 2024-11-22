/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTotemDto } from './create-totem.dto';

export class UpdateFuncionarioDto extends PartialType(CreateTotemDto) {}
