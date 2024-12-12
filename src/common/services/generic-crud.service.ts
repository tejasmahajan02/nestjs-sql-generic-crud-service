import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere, FindManyOptions, In, SelectQueryBuilder, UpdateResult, DeleteResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class GenericCrudService<T> {
  constructor(protected readonly repository: Repository<T>) { }

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
    relations?: string[]
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: conditions,
      relations: relations || []
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
    queryBuilder?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>
  ): Promise<T[]> {
    const qb = this.repository.createQueryBuilder();
    return await queryBuilder(qb).getMany();
  }

  async isExist(
    conditions: FindOptionsWhere<T>,
    relations?: string[]
  ): Promise<T | null> {
    const entity = await this.findOne(conditions, relations);
    if (entity) throw new ConflictException('Already exist.');
    return entity;
  }

  async validate(
    conditions: FindOptionsWhere<T>,
    relations?: string[]
  ): Promise<T | null> {
    const entity = await this.findOne(conditions, relations);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(id: any, entity: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
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
      .set({ deletedAt: new Date(), isDeleted: true } as any)  // Casting to `any`
      .where("uuid = :id", { id })
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
      .set({ deletedAt: null, isDeleted: false } as any)  // Casting to `any`
      .where("uuid = :id", { id })
      .execute();
  }

  // Perform raw SQL query
  async performQuery(query: string, parameters?: any[]): Promise<any> {
    return await this.repository.query(query, parameters);
  }
}
