/**
 * Multi-tenant Database Models
 * By Cheva
 */

import { DataTypes } from 'sequelize';
import { mainDb } from '../utils/database.js';
import bcrypt from 'bcryptjs';

// Tenant Model
export const Tenant = mainDb.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  slug: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      is: /^[a-z0-9-]+$/
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'trial', 'inactive'),
    defaultValue: 'trial'
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      timezone: 'UTC',
      language: 'es',
      dateFormat: 'DD/MM/YYYY',
      currency: 'USD'
    }
  },
  customization: {
    type: DataTypes.JSONB,
    defaultValue: {
      branding: {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#60a5fa',
        darkMode: true
      }
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  trialEndsAt: {
    type: DataTypes.DATE
  },
  suspendedAt: {
    type: DataTypes.DATE
  }
}, {
  hooks: {
    beforeCreate: (tenant) => {
      // Ensure slug is lowercase
      tenant.slug = tenant.slug.toLowerCase();
      
      // Set trial end date (14 days)
      if (tenant.status === 'trial' && !tenant.trialEndsAt) {
        tenant.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }
    }
  }
});

// Tenant Plan Model
export const TenantPlan = mainDb.define('TenantPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise', 'custom'),
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  limits: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  price: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Tenant User Model (extends base user with tenant relationship)
export const TenantUser = mainDb.define('TenantUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'manager', 'operator', 'viewer'),
    defaultValue: 'operator'
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  profile: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'invited'),
    defaultValue: 'active'
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'email']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash') && !user.passwordHash.startsWith('$2')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  }
});

// Instance method for password verification
TenantUser.prototype.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Tenant Usage Model
export const TenantUsage = mainDb.define('TenantUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      users: 0,
      precintos: 0,
      transitos: 0,
      alerts: 0,
      apiCalls: 0,
      storage: 0,
      webhooks: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'date']
    }
  ]
});

// Tenant Billing Model
export const TenantBilling = mainDb.define('TenantBilling', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.STRING,
    unique: true
  },
  subscriptionId: {
    type: DataTypes.STRING,
    unique: true
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'past_due', 'canceled', 'trialing'),
    defaultValue: 'trialing'
  },
  currentPeriodStart: {
    type: DataTypes.DATE
  },
  currentPeriodEnd: {
    type: DataTypes.DATE
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentMethod: {
    type: DataTypes.JSONB
  },
  taxInfo: {
    type: DataTypes.JSONB
  },
  credits: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
});

// Tenant Invite Model
export const TenantInvite = mainDb.define('TenantInvite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'manager', 'operator', 'viewer'),
    defaultValue: 'operator'
  },
  invitedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  acceptedAt: {
    type: DataTypes.DATE
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'email'],
      where: {
        acceptedAt: null
      }
    }
  ]
});

// Custom Fields Model
export const TenantCustomField = mainDb.define('TenantCustomField', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  entity: {
    type: DataTypes.ENUM('precinto', 'transito', 'alerta'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'number', 'date', 'select', 'multiselect', 'boolean', 'file'),
    allowNull: false
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  options: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  validation: {
    type: DataTypes.JSONB
  },
  visibility: {
    type: DataTypes.ENUM('always', 'edit', 'view'),
    defaultValue: 'always'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'entity', 'name']
    }
  ]
});

// Activity Log Model (for audit trail)
export const TenantActivityLog = mainDb.define('TenantActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING
  },
  entityId: {
    type: DataTypes.STRING
  },
  changes: {
    type: DataTypes.JSONB
  },
  metadata: {
    type: DataTypes.JSONB
  },
  ipAddress: {
    type: DataTypes.INET
  },
  userAgent: {
    type: DataTypes.TEXT
  }
}, {
  indexes: [
    {
      fields: ['tenantId', 'createdAt']
    },
    {
      fields: ['tenantId', 'userId', 'createdAt']
    },
    {
      fields: ['tenantId', 'entity', 'entityId']
    }
  ]
});

// Set up associations
Tenant.belongsTo(TenantPlan, { foreignKey: 'planId' });
TenantPlan.hasMany(Tenant, { foreignKey: 'planId' });

Tenant.hasMany(TenantUser, { foreignKey: 'tenantId' });
TenantUser.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(TenantUsage, { foreignKey: 'tenantId' });
TenantUsage.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasOne(TenantBilling, { foreignKey: 'tenantId' });
TenantBilling.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(TenantInvite, { foreignKey: 'tenantId' });
TenantInvite.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(TenantCustomField, { foreignKey: 'tenantId' });
TenantCustomField.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(TenantActivityLog, { foreignKey: 'tenantId' });
TenantActivityLog.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Helper function to get tenant-scoped model instances
export function getTenantScoped(model, tenantId) {
  return {
    ...model,
    findAll: (options = {}) => model.findAll({
      ...options,
      where: { ...options.where, tenantId }
    }),
    findOne: (options = {}) => model.findOne({
      ...options,
      where: { ...options.where, tenantId }
    }),
    findByPk: async (id, options = {}) => {
      const instance = await model.findByPk(id, options);
      if (instance && instance.tenantId !== tenantId) {
        throw new Error('Access denied');
      }
      return instance;
    },
    create: (data, options = {}) => model.create({
      ...data,
      tenantId
    }, options),
    count: (options = {}) => model.count({
      ...options,
      where: { ...options.where, tenantId }
    })
  };
}