import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'
import { CreateBookmarkDto } from '../src/bookmark/dto'
import { EditBookmarkDto } from '../src/bookmark/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'sean@gmail.com',
      password: '123',
    }
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400)
      })
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400)
      })
      it('should signin', () => {
        return (
          pactum
            .spec()
            .post('/auth/signin')
            .withBody(dto)
            .expectStatus(200)
            // .inspect() // 可以用來看回傳的資料
            .stores('userAt', 'access_token') // 自定義userAt這個變數去存body裡面的access_token的值
        )
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Sean',
          email: 'seanlin@gmail.com',
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(200)
          .expectBody([])
      })
    })
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=2dgNs9mjjEE&ab_channel=%E5%8F%B0%E5%8C%97%E5%9F%BA%E7%9D%A3%E5%BE%92%E6%B0%B8%E5%92%8C%E7%A6%AE%E6%8B%9C%E5%A0%82',
      }
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id') // 把創建的bookmarkId存起來
      })
    })
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      })
    })
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'I feel the light /OPEN 字幕分享版',
        description: '永和禮拜堂 OPEN 樂團的第一首創作',
      }

      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      })
    })
    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(204)
      })

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' }) // $S代表上面儲存的"stores"
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })
})
