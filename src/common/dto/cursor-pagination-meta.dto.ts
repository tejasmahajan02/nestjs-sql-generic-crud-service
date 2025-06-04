import { ApiPropertyOptional } from '@nestjs/swagger';

type CursorPaginationMeta = {
  nextCursor?: number;
  take?: number;
};

export class CursorPaginationMetaDto implements CursorPaginationMeta {
  @ApiPropertyOptional()
  nextCursor?: number;

  @ApiPropertyOptional()
  take?: number;

  constructor(meta: CursorPaginationMeta) {
    Object.assign(this, meta);
  }
}
