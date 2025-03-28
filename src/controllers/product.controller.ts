import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto, ProductParamsDto, ProductResponseDto } from '../dtos/product.dto';
import { PaginationQueryDto } from '../dtos/common.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpException } from '../middleware/error.middleware';
import { AuditableRequest } from '../middleware/audit.middleware';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  private async validateParams(params: any, dto: any): Promise<void> {
    const validationParams = plainToInstance(dto, params);
    const errors = await validate(validationParams);
    if(errors.length) throw errors
  }

  createProduct = async (req: AuditableRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User not authenticated');
      }

      await this.validateParams(req.body, CreateProductDto);

      const product = await this.productService.createProduct(req.body, req);
      res.status(201).json(this.transformToDto(product));
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: AuditableRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.validateParams(req.params, UpdateProductDto);
      const { id } = req.params;

      await this.validateParams( req.body, UpdateProductDto);

      const product = await this.productService.updateProduct(id, req.body, req);
      res.status(200).json(this.transformToDto(product));
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: AuditableRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.validateParams(req.params, ProductParamsDto);
      const { id } = req.params;

      await this.productService.deleteProduct(id, req);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.validateParams(req.params, ProductParamsDto);
      const { id } = req.params;

      const product = await this.productService.getProduct(id);
      res.status(200).json(this.transformToDto(product));
    } catch (error) {
      console.log(error)
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      await this.validateParams(req.query, PaginationQueryDto);

      const {page, limit} =  req.query as unknown as PaginationQueryDto;
      const { data, meta } = await this.productService.getProducts(page, limit);
      
      res.status(200).json({
        data: data.map(this.transformToDto),
        meta
      });
    } catch (error) {
      next(error);
    }
  };


    private transformToDto(product: any): ProductResponseDto {
      const { _id, __v, ...rest } = product.toObject();
      return { id: _id.toString(), ...rest };
    }
}