import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';

export class CursorPaginationOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take?: number = 10;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cursor?: string;
}
