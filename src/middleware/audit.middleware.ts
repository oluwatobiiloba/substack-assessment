import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/audit-log.model';
import { logger } from '../utils/logger';
import { Send } from 'express-serve-static-core';
import mongoose from 'mongoose';

export interface AuditableRequest extends Request {
  auditContext?: {
    action: 'create' | 'update' | 'delete';
    resource: string;
    resourceId?: string;
    changes?: any;
    oldValues?: any;
  };
}

export const auditLog = () => {
  return (req: AuditableRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = (async function (this: Response, body?: any) {
        const auditContext = req.auditContext;

        if (auditContext && res.statusCode >= 200 && res.statusCode < 300) {
            const userId = (req as any).user?.id;

            if (!userId) {
                logger.warn('Audit log attempted without user ID');
                return originalSend.call(this, body);
            }

            try {
                const auditEntry = {
                    action: auditContext.action,
                    resource: auditContext.resource,
                    resourceId: auditContext.resourceId ? new mongoose.Types.ObjectId(auditContext.resourceId) : undefined,
                    userId: new mongoose.Types.ObjectId(userId),
                    changes: auditContext.action === 'update'
                        ? { before: auditContext.oldValues, after: auditContext.changes }
                        : auditContext.changes
                };

                if (!auditEntry.resourceId) {
                    delete auditEntry.resourceId;
                }

                await AuditLog.create(auditEntry);
                logger.info(`Audit log created for ${auditContext.action} on ${auditContext.resource}`,
                    { resourceId: auditContext.resourceId, userId });
            } catch (error) {
                logger.error('Error creating audit log:', error);
            }
        }
        return originalSend.call(this, body);
    }) as unknown as Send;
    
    next();
  };
};