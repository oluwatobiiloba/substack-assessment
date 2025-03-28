import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { RegisterUserDto, LoginUserDto, UserResponseDto } from '../dtos/user.dto';
import { HttpException } from '../middleware/error.middleware';
import { Role } from '../interfaces/role.interface';

export class AuthService {
  async register(userData: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new HttpException(409, 'Email already exists');
    }

    // Double-check role enforcement at service level
    userData.role = Role.USER;

    const user = await User.create(userData);
    return this.transformToDto(user);
  }

  async login(loginData: LoginUserDto): Promise<{ token: string; user: UserResponseDto }> {
    const user = await User.findOne({ email: loginData.email }).select('+password');
    if (!user) {
      throw new HttpException(401, 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new HttpException(401, 'Invalid credentials');
    }

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: this.transformToDto(user)
    };
  }

  private generateToken(userId: string, role: Role): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const expirationMinutes = parseInt(process.env.JWT_EXPIRATION_MINUTES || '30', 10);
    
    return jwt.sign(
      { id: userId, role },
      jwtSecret,
      { expiresIn: expirationMinutes * 60 } // Convert minutes to seconds
    );
  }

  private transformToDto(user: any): UserResponseDto {
    const { _id, password, __v, ...rest } = user.toObject();
    return { id: _id.toString(), ...rest };
  }
}