import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateTarifaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreTarifa: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsNumber()
  @Min(1)
  diasDuracion: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;
}
