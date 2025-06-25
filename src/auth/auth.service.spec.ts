import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    profile: {
      firstName: 'Test',
      lastName: 'User',
    },
    isActive: true,
    toObject: () => ({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      profile: {
        firstName: 'Test',
        lastName: 'User',
      },
    }),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByUsernameOrEmail: jest.fn(),
    validatePassword: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUsersService.create.mockResolvedValue(mockUser.toObject());
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
      };

      mockUsersService.create.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined(); // Password should be removed
    });

    it('should return null for invalid credentials', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(inactiveUser);

      await expect(service.validateUser('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
