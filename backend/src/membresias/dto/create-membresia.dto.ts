import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMembresiaDto {
  @IsInt()
  usuarioId: number;

  @IsOptional()
  @IsInt()
  promocionId?: number;

  @IsNumber()
  @IsPositive()
  montoPagado: number;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  metodoPago?: string;
}
