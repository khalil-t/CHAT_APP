import { Exclude } from 'class-transformer';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Conversations } from 'src/modules/conversations/entities/conversations.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'conversation_id',
    type: 'uuid',
    nullable: true,
  })
  conversationId: string | null;

  @Column({
    name: 'sender_id',
    type: 'uuid',
    nullable: false,
  })
  senderId: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @CreateDateColumn({
    name: 'sent_at',
    type: 'timestamp',
  })
  sentAt: Date;

  @Column({
    name: 'read_at',
    type: 'timestamp',
    nullable: true,
  })
  readAt: Date | null;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(
    () => Conversations,
    (conversation) => conversation.messages,
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversations;
}