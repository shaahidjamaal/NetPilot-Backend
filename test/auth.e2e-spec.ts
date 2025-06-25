import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import databaseConfig from '../src/config/database.config';
import jwtConfig from '../src/config/jwt.config';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig],
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/netpilot-test'),
        ThrottlerModule.forRoot([
          {
            name: 'short',
            ttl: 1000,
            limit: 10,
          },
        ]),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user with valid data', () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(registerDto.email);
          expect(res.body.user.username).toBe(registerDto.username);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should reject registration with invalid email', () => {
      const registerDto = {
        email: 'invalid-email',
        username: 'testuser2',
        password: 'Test123!@#',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with weak password', () => {
      const registerDto = {
        email: 'test2@example.com',
        username: 'testuser3',
        password: 'weak',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with duplicate email', () => {
      const registerDto = {
        email: 'test@example.com', // Same email as first test
        username: 'testuser4',
        password: 'Test123!@#',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409); // Conflict
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      const loginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'Test123!@#',
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject login with invalid credentials', () => {
      const loginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get access token
      const loginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto);

      accessToken = response.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
