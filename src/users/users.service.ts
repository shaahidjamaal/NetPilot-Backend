import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });

      if (existingUser) {
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.username === createUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }

      // Hash password with 12 rounds (minimum security requirement)
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user with hashed password
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        profile: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      };

      const createdUser = new this.userModel(userData);
      const savedUser = await createdUser.save();

      // Remove password from returned object
      const userObject = savedUser.toObject();
      const { password, ...userWithoutPassword } = userObject;

      return userWithoutPassword;
    } catch (error) {
      if (error.code === 11000) {
        // Handle MongoDB duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} already exists`);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail },
      ],
    }).exec();
  }

  async findById(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
    }).exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
