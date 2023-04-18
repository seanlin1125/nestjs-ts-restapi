import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // 上面這段等同於：
  // class AuthController {
  // authService: AuthService
  // constructor(authService: AuthService) {
  //   this.authService = authService
  // }
  @Post('signup') // /auth/signup
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto)
  }

  @Post('signin') // /auth/signin
  signin() {
    return this.authService.signin
  }
}
