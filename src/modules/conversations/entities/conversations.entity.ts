import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from 'src/common/enums/user.enum';
import { Message } from 'src/modules/message/entities/message.entity';
import { Conversation_Members } from 'src/modules/conversation_members/entities/conversation_members.entity';

@Entity({ name: 'conversations' })
export class Conversations {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  userId: number;

  @Column({ type: 'varchar', length: 255, default: 'New chat' })
  title: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column()
  joined_at: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(() => Conversation_Members, (member) => member.conversation)
  members: Conversation_Members[];
}
