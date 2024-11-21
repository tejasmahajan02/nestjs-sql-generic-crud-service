import { Injectable } from '@nestjs/common';
import { GenericCrudService } from 'src/common/services/generic-crud.service';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService extends GenericCrudService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {
        super(userRepository);
    }
}
