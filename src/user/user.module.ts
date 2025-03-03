import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './../typeorm/entities/User';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
