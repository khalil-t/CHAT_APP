import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Conversations } from 'src/modules/conversations/entities/conversations.entity';

@Entity({ name: 'conversation_members' })
export class Conversation_Members {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'joined_at' })
  joined_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Conversations, (conversation) => conversation.members)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversations;
}
