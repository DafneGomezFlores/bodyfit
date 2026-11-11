import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePaseDiarioDto {
  @IsString()
  @MaxLength(150)
  nombreVisita: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsString()
  metodoPago?: string;
}