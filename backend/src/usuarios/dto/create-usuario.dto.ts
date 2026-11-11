import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ci: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombreCompleto: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}
