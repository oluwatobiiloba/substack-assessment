import { Product, IProduct } from '../models/product.model';
import { CreateProductDto, ProductResponseDto, UpdateProductDto } from '../dtos/product.dto';
import { HttpException } from '../middleware/error.middleware';
import { AuditableRequest } from '../middleware/audit.middleware';
import { logger } from '../utils/logger';
import { Document } from 'mongoose';

export class ProductService {
  async createProduct(createProductDto: CreateProductDto, req: AuditableRequest): Promise<IProduct> {
    try {
      const existingProduct = await Product.findOne({ sku: createProductDto.sku });
      if (existingProduct) {
        throw new HttpException(400, 'Product with this SKU already exists');
      }

      const product = new Product(createProductDto);
      const savedProduct = await product.save();

      req.auditContext = {
        action: 'create',
        resource: 'products',
        resourceId: (savedProduct as Document).id,
        changes: createProductDto
      };

      logger.info('Product created', { productId: savedProduct._id });
      return savedProduct;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, req: AuditableRequest): Promise<IProduct> {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new HttpException(404, 'Product not found');
      }

      const oldValues = product.toObject();
      Object.assign(product, updateProductDto);
      const updatedProduct = await product.save();

      req.auditContext = {
        action: 'update',
        resource: 'products',
        resourceId: (product as Document).id,
        changes: updateProductDto,
        oldValues
      };

      logger.info('Product updated', { productId: id });
      return updatedProduct;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string, req: AuditableRequest): Promise<void> {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new HttpException(404, 'Product not found');
      }

      const productData = product.toObject();
      await product.deleteOne();

      req.auditContext = {
        action: 'delete',
        resource: 'products',
        resourceId: (product as Document).id,
        changes: productData
      };

      logger.info('Product deleted', { productId: id });
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new HttpException(404, 'Product not found');
    }
    return product;
  }

  async getAllProducts(page: number = 1, limit: number = 10): Promise<{ products: IProduct[]; total: number }> {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments()
    ]);
    return { products, total };
  }

  async getProducts(page: number = 1, limit: number = 10): Promise<{ data: IProduct[]; meta: { page: number; limit: number; total: number } }> {
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip(skip)
      .limit(limit);

    return {
      data: products,
      meta: {
        page,
        limit,
        total
      }
    };
  }

}