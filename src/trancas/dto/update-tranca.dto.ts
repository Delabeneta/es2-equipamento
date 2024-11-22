/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTrancaDto } from './create-tranca.dto';

export class UpdateTrancaDto extends PartialType(CreateTrancaDto) {}
