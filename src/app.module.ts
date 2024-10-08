import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshToken, User } from './user/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { accessTokenConfig, refreshTokenConfig } from './global/config';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { Role } from './user/models/role.model';
import { Permission } from './user/models/permission.model';
import { UniqueExistConstraint } from './user/decorators/unique.validation.decorator';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [accessTokenConfig, refreshTokenConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: parseInt(config.get('POSTGRES_PORT')),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DATABASE'),
        entities: [User, Role, Permission, RefreshToken],
        synchronize: true,
        ssl: true, //if no ssl no need to use it.
      }),
    }),
    UserModule,
  ],
  controllers: [],
  providers: [UniqueExistConstraint],
})
export class AppModule {}
