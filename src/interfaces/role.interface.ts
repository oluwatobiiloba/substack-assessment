export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  CLERK = 'clerk',
  USER = 'user'
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'products' | 'users' | 'audit-logs';
}

//Hardcoded for dev purposes. Can be moved  to the database
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    { action: 'create', resource: 'products' },
    { action: 'read', resource: 'products' },
    { action: 'update', resource: 'products' },
    { action: 'delete', resource: 'products' },
  ],
  [Role.ADMIN]: [
    { action: 'create', resource: 'products' },
    { action: 'read', resource: 'products' },
    { action: 'update', resource: 'products' },
    { action: 'delete', resource: 'products' },
  ],
  [Role.CLERK]: [
    { action: 'read', resource: 'products' },
    { action: 'update', resource: 'products' },
  ],
  [Role.USER]: [
    { action: 'read', resource: 'products' },
  ],
};