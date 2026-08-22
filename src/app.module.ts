import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsModule } from './contacts/contacts.module';
import { ConversationMembersService } from './conversation_members/conversation_members.service';
import { ConversationMembersModule } from './conversation_members/conversation_members.module';
import { ConversationMembersService } from './conversation_members/conversation_members.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        
        synchronize: config.get<string>('TYPEORM_SYNC') === 'true',
      }),
    }),

    AuthModule,

    UserModule,

    MessageModule,

    ConversationsModule,

    ContactsModule,

    ConversationMembersModule,
  ],
  controllers: [ContactsController],
  providers: [ConversationMembersService],
})
export class AppModule {}
