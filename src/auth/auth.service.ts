import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto'
import * as argon from 'argon2'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password)
    // save the new user to db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    })
    delete user.hash
    // return the new user
    return user
  }

  signin() {
    return 'signin test'
  }
}
