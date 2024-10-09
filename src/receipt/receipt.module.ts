import { Module } from '@nestjs/common';
import { ReceiptService } from './services/receipt/receipt.service';
import { ReceiptController } from './controllers/receipt/receipt.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, User } from '../user/models';
import { Role } from '../user/models/role.model';
import { Permission } from '../user/models/permission.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, RefreshToken]),
    JwtModule.register({}),
    PassportModule.register({
      session: false,
    }),
  ],
  providers: [ReceiptService],
  controllers: [ReceiptController],
})
export class ReceiptModule {}
