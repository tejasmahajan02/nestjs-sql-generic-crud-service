import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { CursorPaginationMetaDto } from "./cursor-pagination-meta.dto";

export class CursorPaginationDto<T> {
    @IsArray()
    @ApiProperty({ isArray: true })
    readonly data: T[];

    @ApiProperty({ type: () => CursorPaginationMetaDto })
    readonly meta: CursorPaginationMetaDto;

    constructor(data: T[], meta: CursorPaginationMetaDto) {
        this.data = data;
        this.meta = meta;
    }
}