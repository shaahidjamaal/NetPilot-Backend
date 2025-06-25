import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    profile: {
      firstName: 'Test',
      lastName: 'User',
    },
    save: jest.fn(),
    toObject: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
  };

  // Mock constructor function
  const MockUserModel = jest.fn().mockImplementation((userData) => ({
    ...userData,
    save: jest.fn().mockResolvedValue({
      ...mockUser,
      toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          firstName: 'Test',
          lastName: 'User',
        },
      }),
    }),
  }));

  // Add static methods to the constructor
  Object.assign(MockUserModel, mockUserModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      MockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined(); // Password should be removed
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
      };

      MockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      MockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toBe(mockUser);
      expect(MockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('plainPassword', 'hashedPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });

    it('should reject incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });
});
