import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { status } from '../../../common/enums/status.enum';

@Entity('contacts')
export class Contact {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'contact_user_id' })
  contactUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contact_user_id' })
  contactUser: User;

  @Column({ nullable: true })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
