import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
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

  // post request 預設回傳201
  @Post('signup') // /auth/signup
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto)
  }

  @HttpCode(HttpStatus.OK) // 這樣就可以把 post預設的201改成200，因為這邊只是登入沒有創建資料
  @Post('signin') // /auth/signin
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto)
  }
}
