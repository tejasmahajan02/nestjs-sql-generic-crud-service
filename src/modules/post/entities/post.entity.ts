import { BaseEntity } from 'src/common/entities/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('post')
export class PostEntity extends BaseEntity {
  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.posts)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
