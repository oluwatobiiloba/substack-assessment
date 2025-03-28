import request from 'supertest';
import { app } from '../../src/app';
import { Product } from '../../src/models/product.model';
import { AuditLog } from '../../src/models/audit-log.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Role } from '../../src/interfaces/role.interface';
import { User } from '../../src/models/user.model';

describe('Product API Integration Tests', () => {
  let ownerToken: string = "";
  let clerkToken: string;
  let testProductId: string;
  let ownerId: string;
  let clerkId: string;

  const createTestProduct = {
    name: 'Integration Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    sku: 'INT-TEST-001'
  };

  beforeAll(async () => {
    // Register Owner
    const ownerRegisterationResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: "owner@test.com",
        password: "password",
        firstName: "Owner",
        lastName: "Test",
      });

    ownerId =  ownerRegisterationResponse.body.id

    await User.updateOne({_id: ownerId},{role: Role.OWNER})

    //Register Clerk
    const clerkRegisterationResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: "clerk@test.com",
        password: "password",
        firstName: "Clerk",
        lastName: "Test",
      });
  
    clerkId = clerkRegisterationResponse.body.id
    await User.updateOne({_id: clerkId},{role: Role.CLERK})

    const ownerLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: "owner@test.com",
        password: "password"
      });
  
    ownerToken = ownerLoginResponse.body.token;
  
    const clerkLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: "clerk@test.com",
        password: "password"
      });

    clerkToken = clerkLoginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({
      _id: { $in: [clerkId, ownerId] }
    })
  });


  beforeEach(async () => {
    await Product.deleteMany({});
    await AuditLog.deleteMany({});

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(createTestProduct);

    testProductId = response.body.id;
  });

  afterEach(async () => {
    await Product.deleteMany({});
    await AuditLog.deleteMany({});
  });

  describe('POST /api/v1/products', () => {
    const newProduct = {
      name: 'New Test Product',
      description: 'New Test Description',
      price: 200,
      stock: 20,
      sku: 'INT-TEST-002'
    };

    it('should create a product when authenticated as owner', async () => {
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);

      const auditLog = await AuditLog.findOne({
        action: 'create',
        resourceId: response.body.id,
        userId: ownerId
      });
      expect(auditLog).toBeTruthy();
      expect(auditLog?.changes).toEqual(newProduct);
    });

    it('should not allow product creation for clerk role', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newProduct);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products for clerk role', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${clerkToken}`);

        console.log(response.body, clerkToken)
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should return products with pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=2')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update product when authenticated as owner', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 150
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);

      // Verify audit log update
      const auditLog = await AuditLog.findOne({
        action: 'update',
        resourceId: testProductId,
        userId: ownerId
      });
      expect(auditLog).toBeTruthy();
      expect(auditLog?.changes).toHaveProperty('before');
      expect(auditLog?.changes).toHaveProperty('after');
      expect(auditLog?.changes.after).toEqual(updateData);
    });

    it('should allow updates from clerk role', async () => {
      const updateData = {
        stock: 20
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(updateData.stock);

      // Verify clerk audit log
      const auditLog = await AuditLog.findOne({
        action: 'update',
        resourceId: testProductId,
        userId: clerkId
      });
      expect(auditLog).toBeTruthy();
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should not allow deletion for clerk role', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${clerkToken}`);

      expect(response.status).toBe(403);
    });

    it('should delete product when authenticated as owner', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      // Verify product deletion
      const product = await Product.findById(testProductId);
      expect(product).toBeNull();

      // Verify audit log deletion
      const auditLog = await AuditLog.findOne({
        action: 'delete',
        resourceId: testProductId,
        userId: ownerId
      });
      expect(auditLog).toBeTruthy();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/products');

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(101).fill(null).map(() => 
        request(app)
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${ownerToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses[responses.length - 1];

      expect(rateLimitedResponse.status).toBe(429);
      expect(rateLimitedResponse.body).toHaveProperty('message');
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });
});