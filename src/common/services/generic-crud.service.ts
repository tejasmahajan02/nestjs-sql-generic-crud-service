import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { paginate, paginateRaw } from 'nestjs-typeorm-paginate';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindManyOptions,
  In,
  SelectQueryBuilder,
  UpdateResult,
  DeleteResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PageMetaDto } from '../dto/page-meta.dto';
import { PageOptionsDto } from '../dto/page-options.dto';
import { PageDto } from '../dto/page.dto';
import { SortOrder } from '../enum/sort-order.enum';
import { CursorPaginationOptionsDto } from '../dto/cursor-pagination-options.dto';
import { CursorPaginationDto } from '../dto/cursor-pagination.dto';
import { CursorPaginationMetaDto } from '../dto/cursor-pagination-meta.dto';

@Injectable()
export class GenericCrudService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async createMany(createManyDto: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(createManyDto);
    return await this.repository.save(entities);
  }

  async findOne(
    conditions: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: conditions,
      relations: relations || [],
    });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  // Generic method to find entities by a specific field and an array of values
  async findAllBy<K extends keyof T>(field: K, values: T[K][]): Promise<T[]> {
    return await this.repository.find({
      where: {
        [field]: In(values),
      } as FindOptionsWhere<T>,
    });
  }

  async queryAll(
    queryBuilder?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  ): Promise<T[]> {
    const qb = this.repository.createQueryBuilder();
    return await queryBuilder(qb).getMany();
  }

  async isExist(
    conditions: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<T | null> {
    const entity = await this.findOne(conditions, relations);
    if (entity) throw new ConflictException('Already exist.');
    return entity;
  }

  async validate(
    conditions: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<T | null> {
    const entity = await this.findOne(conditions, relations);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(
    id: any,
    entity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, entity);
  }

  async delete(id: any): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }

  async deleteAll(where?: FindOptionsWhere<T>): Promise<DeleteResult> {
    return await this.repository.delete(where || {});
  }

  // Soft delete entities by criteria
  // async softDelete(criteria: FindOptionsWhere<T>): Promise<UpdateResult> {
  //   return await this.repository.softDelete(criteria);
  // }

  // Advanced soft delete
  async softDelete(id: any): Promise<UpdateResult> {
    return await this.repository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: new Date(), isDeleted: true } as any) // Casting to `any`
      .where('uuid = :id', { id })
      .execute();
  }

  // Restore soft-deleted entities by criteria
  // async restore(criteria: FindOptionsWhere<T>): Promise<UpdateResult> {
  //   return await this.repository.restore(criteria);
  // }

  async restore(id: any): Promise<UpdateResult> {
    return await this.repository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: null, isDeleted: false } as any) // Casting to `any`
      .where('uuid = :id', { id })
      .execute();
  }

  // Perform raw SQL query
  async performQuery(query: string, parameters?: any[]): Promise<any> {
    return await this.repository.query(query, parameters);
  }

  async paginate(
    queryBuilder: SelectQueryBuilder<T>,
    pageOptionsDto: Partial<PageOptionsDto>,
  ): Promise<PageDto<T>> {
    const { items, meta } = await paginate(queryBuilder, {
      page: pageOptionsDto.page,
      limit: pageOptionsDto.take,
    });

    return new PageDto(items, new PageMetaDto(meta));
  }

  async paginateRaw(
    queryBuilder: SelectQueryBuilder<T>,
    pageOptionsDto: Partial<PageOptionsDto>,
  ): Promise<PageDto<T>> {
    const { items, meta } = await paginateRaw(queryBuilder, {
      page: pageOptionsDto.page,
      limit: pageOptionsDto.take,
    });

    return new PageDto(items, new PageMetaDto(meta));
  }

  protected applyWhereOrAndWhere(
    qb: SelectQueryBuilder<T>,
    condition: string,
    params: Record<string, any>,
  ) {
    if (!qb.expressionMap.wheres.length) {
      qb.where(condition, params);
    } else {
      qb.andWhere(condition, params);
    }

    return qb;
  }

  /**
   * Cursor/Checkpoint-Based Pagination
   *
   * Fetches a page of records using a timestamp or ID cursor. This is useful for efficient, stateless pagination.
   *
   * @param {Object} params - Pagination parameters
   * @param {number} params.take - Number of records to fetch (page size)
   * @param {number} [params.cursor] - The cursor/anchor point (usually a timestamp in UNIX format).
   *   - If provided, fetches records **after** this point.
   *   - If omitted, fetches the most recent `take` records.
   *
   * @returns {Promise<{
   *   data: T[];
   *   nextCursor?: string;
   * }>} - The fetched records and the `nextCursor` to be used for the next page.
   *
   * @template T
   *
   * @description
   * - `cursor`: Acts as a checkpoint for pagination.
   * - `nextCursor`: Returned from the result to indicate the point from which the next set of records should be fetched.
   * - If `cursor` is omitted, the latest records are fetched.
   *
   * @example
   * // Initial load (latest)
   * const { data, nextCursor } = await cursorPaginate({ take: 10 });
   *
   * // Subsequent load (older records)
   * const { data, nextCursor } = await cursorPaginate({ take: 10, cursor: nextCursor });
   */
  async cursorPaginate({
    take,
    cursor,
  }: CursorPaginationOptionsDto): Promise<CursorPaginationDto<T>> {
    const qb = this.repository
      .createQueryBuilder()
      // .cache(true) // This will cache the result in memory for default 1000ms (1s).
      .orderBy('"createdAt"', SortOrder.DESC)
      .addOrderBy('uuid', SortOrder.DESC) // This avoids pagination bugs caused by duplicate createdAt values
      .take(take + 1); // Fetch one extra to determine hasNextPage

    if (cursor) {
      const condition = `"createdAt" < :fromTimestamp`;
      const params = { fromTimestamp: new Date(cursor) };

      if (!qb.expressionMap.wheres.length) {
        qb.where(condition, params);
      } else {
        qb.andWhere(condition, params);
      }
    }

    const results = await qb.getMany();
    const hasNextPage = results.length > take;

    const nodes = hasNextPage ? results.slice(0, -1) : results;
    const nextCursor = hasNextPage
      ? nodes[nodes.length - 1]?.['createdAt'].getTime()
      : null;

    return new CursorPaginationDto(
      nodes,
      new CursorPaginationMetaDto({ nextCursor, take }),
    );
  }
}
