import { BaseEntity } from 'src/common/entities/base.entity';
import { PostEntity } from 'src/modules/post/entities/post.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany((type) => PostEntity, (post) => post.user)
  posts: PostEntity[];
}
