import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    })
  }

  cleanDb() {
    // 這個function是為了讓測試時先刪bookmark再刪user。另一種方式是去schema在bookmark的關聯關係設onDelete: Cascade，這邊不這樣做只是不想再多一個migration
    return this.$transaction([
      // $transaction確保順序不會亂掉，因為bookmark關聯於user所以bookmark要先刪
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ])
  }
}
