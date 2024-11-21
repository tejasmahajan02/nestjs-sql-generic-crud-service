import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere, FindManyOptions, In } from 'typeorm';
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

  async findOne(conditions: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOneBy(conditions);
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

  async isExist(conditions: FindOptionsWhere<T>): Promise<T | null> {
    const entity = await this.findOne(conditions);
    if (entity) throw new ConflictException('Already exist.');
    return entity;
  }

  async validate(conditions: FindOptionsWhere<T>): Promise<T | null> {
    const entity = await this.findOne(conditions);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(id: any, entity: QueryDeepPartialEntity<T>): Promise<T | object> {
    return await this.repository.update(id, entity);
  }

  async deleteOne(id: any): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAll(where?: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(where || {});
  }  
  
  // Default soft delete
  // async softDelete(id: any): Promise<void> {
  //   await this.repository.softDelete(id);
  // }

  // Advanced soft delete
  async softDelete(id: any): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: new Date(), isDeleted: true } as any)  // Casting to `any`
      .where("uuid = :id", { id })
      .execute();
  }

}
