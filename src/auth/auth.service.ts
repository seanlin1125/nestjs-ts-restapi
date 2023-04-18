import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto'
import * as argon from 'argon2'
import { Prisma } from '@prisma/client'
// import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // P2002是prisma的錯誤代碼，代表重複
          throw new ForbiddenException('Credentials taken') // ForbiddenException是nest內建的
        }
      }
      throw error
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    // if user doesn't exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect')
    }
    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password)
    // if password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect')
    }
    // send back the user
    delete user.hash
    return user
  }
}
