import { ApiProperty } from "@nestjs/swagger";
import { IPaginationMeta } from "nestjs-typeorm-paginate";

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(meta : IPaginationMeta) {
    
    this.page = meta.currentPage;
    this.take = meta.itemsPerPage;
    this.itemCount = meta.totalItems;
    this.totalPages = meta.totalPages;

    this.hasPreviousPage = meta.currentPage > 1;
    this.hasNextPage = meta.currentPage < meta.totalPages;
  }
}