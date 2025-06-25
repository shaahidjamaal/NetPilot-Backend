import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, JwtPayload } from '../common/interfaces/auth-response.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.create(registerDto);
      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.usernameOrEmail, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    const userId = (user as any)._id?.toString() || (user as any).id;
    await this.usersService.updateLastLogin(userId);

    return this.generateAuthResponse(user);
  }

  async validateUser(usernameOrEmail: string, inputPassword: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.usersService.validatePassword(inputPassword, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Remove password from user object before returning
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersService.updateLastLogin(userId);
  }

  generateAuthResponse(user: any): AuthResponse {
    const userId = user._id?.toString() || user.id;
    const payload: JwtPayload = {
      sub: userId,
      username: user.username,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        profile: user.profile || {},
      },
    };
  }
}
