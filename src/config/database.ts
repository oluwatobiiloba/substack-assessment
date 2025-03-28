import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { Product } from '../models/product.model';
import { AuditLog } from '../models/audit-log.model';
import { User } from '../models/user.model';

export async function connectDatabase(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');

    await Promise.all([
      // Product indexes
      Product.collection.createIndex({ name: 1 }),
      Product.collection.createIndex({ sku: 1 }, { unique: true }),
      Product.collection.createIndex({ name: 1, price: 1 }),
      
      // User indexes
      User.collection.createIndex({ email: 1 }, { unique: true }),
      User.collection.createIndex({ role: 1 }),
      
      // Audit log indexes
      AuditLog.collection.createIndex({ action: 1 }),
      AuditLog.collection.createIndex({ resource: 1 }),
      AuditLog.collection.createIndex({ resourceId: 1 }),
      AuditLog.collection.createIndex({ userId: 1 }),
      AuditLog.collection.createIndex({ timestamp: -1 }),
      AuditLog.collection.createIndex({ resource: 1, timestamp: -1 })
    ]);

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}