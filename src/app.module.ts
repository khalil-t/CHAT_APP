import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';
import { MessageModule } from './modules/message/message.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationMembersModule } from './modules/conversation_members/conversation_members.module';
import jwtConfig from './common/config/jwt.config';
//import { RealtimeModule } from './modules/realtime/realtime.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
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
    UsersModule,
    MessageModule,
    ConversationsModule,
    ContactsModule,
    ConversationMembersModule,
  ],
})
export class AppModule {}
