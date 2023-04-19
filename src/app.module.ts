import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { BookmarkModule } from './bookmark/bookmark.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserController } from './user/user.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // nestjs內建的方法，可以取代dotenv的角色
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
