import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreatePermisoDto {
  @IsInt()
  membresiaId: number;

  @IsInt()
  @IsPositive()
  diasSolicitados: number;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsDateString()
  fechaAnterior: string;

  @IsDateString()
  fechaNueva: string;
}
