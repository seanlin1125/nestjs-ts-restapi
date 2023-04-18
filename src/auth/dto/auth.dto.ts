import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
export class AuthDto {
  // 因為用了class-validator所以這邊把interface改成class
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
