import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { UserRole } from 'src/common/enums/user.enum';
import { Message } from 'src/message/entities/message.entity';

@Entity({ name: 'conversations' })
export class Conversations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 255, default: 'New chat' })
  title: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({
      type:'enum',
      enum: UserRole,
      default: UserRole.USER
  })
  role:UserRole 


  @Column()
  joined_at :Date


  @OneToMany(() => Message, Message => Message.id)
  Message:Message;

}