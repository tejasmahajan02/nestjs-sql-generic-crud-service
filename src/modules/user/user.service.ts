import { Injectable, NotFoundException } from '@nestjs/common';
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

    // You can add additional methods specific to UserEntity if needed
    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('User not found.');
        return user;
    }
}
