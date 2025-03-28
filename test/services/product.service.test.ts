import { ProductService } from '../../src/services/product.service';
import { Product } from '../../src/models/product.model';
import { AuditLog } from '../../src/models/audit-log.model';
import { CreateProductDto, UpdateProductDto } from '../../src/dtos/product.dto';
import { HttpException } from '../../src/middleware/error.middleware';
import mongoose from 'mongoose';
import { Request } from 'express';
import { AuditableRequest } from '../../src/middleware/audit.middleware';

describe('ProductService', () => {
  let productService: ProductService;
  const userId = new mongoose.Types.ObjectId().toString();

  const mockAuditableRequest = (): AuditableRequest => {
    return {
      user: { id: userId },
      auditContext: undefined
    } as AuditableRequest;
  };

  beforeEach(() => {
    productService = new ProductService();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      sku: 'TEST-123'
    };

    it('should create a product successfully', async () => {
      const req = mockAuditableRequest();
      const product = await productService.createProduct(createProductDto, req);
      expect(product.name).toBe(createProductDto.name);
      expect(product.sku).toBe(createProductDto.sku);

      expect(req.auditContext).toBeTruthy();
      expect(req.auditContext?.changes).toEqual(createProductDto);
    });

    it('should throw error if SKU already exists', async () => {
      const req = mockAuditableRequest();
      await productService.createProduct(createProductDto, req);
      await expect(
        productService.createProduct(createProductDto, req)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateProduct', () => {
    let existingProduct: any;
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 150
    };

    beforeEach(async () => {
      const req = mockAuditableRequest();
      existingProduct = await productService.createProduct({
        name: 'Original Product',
        description: 'Original Description',
        price: 100,
        stock: 10,
        sku: 'TEST-456'
      }, req);
    });

    it('should update a product successfully', async () => {
      const req = mockAuditableRequest();
      const updatedProduct = await productService.updateProduct(
        existingProduct._id.toString(),
        updateProductDto,
        req
      );
      expect(updatedProduct.name).toBe(updateProductDto.name);
      expect(updatedProduct.price).toBe(updateProductDto.price);

      expect(req.auditContext).toBeTruthy();
      expect(req.auditContext).toHaveProperty('changes');
      expect(req.auditContext).toHaveProperty('oldValues');
      expect(req.auditContext?.changes).toEqual(updateProductDto);
    });

    it('should throw error if product not found', async () => {
      const req = mockAuditableRequest();
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(
        productService.updateProduct(nonExistentId, updateProductDto, req)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteProduct', () => {
    let existingProduct: any;

    beforeEach(async () => {
      const req = mockAuditableRequest();
      existingProduct = await productService.createProduct({
        name: 'Product to Delete',
        description: 'Will be deleted',
        price: 100,
        stock: 10,
        sku: 'TEST-789'
      }, req);
    });

    it('should delete a product successfully', async () => {
      const req = mockAuditableRequest();
      await productService.deleteProduct(existingProduct._id.toString(), req);
      const product = await Product.findById(existingProduct._id);
      expect(product).toBeNull();

      expect(req.auditContext).toBeTruthy();
      expect(req.auditContext?.changes).toEqual(existingProduct.toObject());
    });

    it('should throw error if product not found', async () => {
      const req = mockAuditableRequest();
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(
        productService.deleteProduct(nonExistentId, req)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getAllProducts', () => {
    beforeEach(async () => {
      const products = [
        { name: 'Product 1', description: 'Desc 1', price: 100, stock: 10, sku: 'SKU-1' },
        { name: 'Product 2', description: 'Desc 2', price: 200, stock: 20, sku: 'SKU-2' },
        { name: 'Product 3', description: 'Desc 3', price: 300, stock: 30, sku: 'SKU-3' }
      ];

      const req = mockAuditableRequest();
      for (const product of products) {
        await productService.createProduct(product, req);
      }
    });

    it('should return paginated products', async () => {
      const { products, total } = await productService.getAllProducts(1, 2);
      expect(products).toHaveLength(2);
      expect(total).toBe(3);
    });

    it('should return all products with default pagination', async () => {
      const { products, total } = await productService.getAllProducts();
      expect(products).toHaveLength(3);
      expect(total).toBe(3);
    });
  });
});