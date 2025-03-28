import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto, LoginUserDto } from '../dtos/user.dto';
import { HttpException } from '../middleware/error.middleware';
import { Role } from '../interfaces/role.interface';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private async validateParams(params: any, dto: any): Promise<void> {
    const validationParams = plainToInstance(dto, params);
    const errors = await validate(validationParams);
    if(errors.length) throw errors
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.validateParams(req.body, RegisterUserDto);

      // Ensure role is always USER
      const userData = plainToInstance(RegisterUserDto, { ...req.body, role: Role.USER });

      const result = await this.authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.validateParams(req.body, LoginUserDto);

      const loginData = plainToInstance(LoginUserDto, req.body);
      const result = await this.authService.login(loginData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}