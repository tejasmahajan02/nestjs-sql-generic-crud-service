import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { SortOrder } from "../enum/sort-order.enum";

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 50,
    maximum: 2000,
    default: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(50)
  @Max(2000)
  @IsOptional()
  take?: number = 50;

  @IsOptional()
  skip: number;

  constructor() {
    this.skip = (this.page - 1) * this.take;
  }
}