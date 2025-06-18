/**
 * Multi-tenant Types
 * By Cheva
 */

export interface Tenant {
  id: string;
  slug: string; // URL-friendly identifier (e.g., 'acme-corp')
  name: string;
  displayName: string;
  domain?: string; // Custom domain if applicable
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  plan: TenantPlan;
  settings: TenantSettings;
  customization: TenantCustomization;
  billing: TenantBilling;
  usage: TenantUsage;
  createdAt: Date;
  updatedAt: Date;
  trialEndsAt?: Date;
  suspendedAt?: Date;
}

export interface TenantPlan {
  id: string;
  name: 'starter' | 'professional' | 'enterprise' | 'custom';
  limits: {
    users: number;
    precintos: number;
    transitosPerMonth: number;
    alertsPerMonth: number;
    apiCallsPerDay: number;
    webhooks: number;
    dataRetentionDays: number;
    customReports: boolean;
    apiAccess: boolean;
    whiteLabeling: boolean;
    sla: boolean;
  };
  features: string[];
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
}

export interface TenantSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  security: {
    twoFactorAuth: 'optional' | 'required' | 'disabled';
    sessionTimeout: number; // minutes
    ipWhitelist: string[];
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expirationDays: number;
    };
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

export interface TenantCustomization {
  branding: {
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
    customCss?: string;
  };
  emails: {
    fromName: string;
    fromEmail: string;
    footer?: string;
    templates?: {
      [key: string]: string;
    };
  };
  dashboards: {
    defaultLayout: string;
    availableWidgets: string[];
    customWidgets?: CustomWidget[];
  };
  fields: {
    precintos?: CustomField[];
    transitos?: CustomField[];
    alertas?: CustomField[];
  };
  workflows?: CustomWorkflow[];
}

export interface TenantBilling {
  customerId: string; // Stripe/payment provider ID
  subscription: {
    id: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'invoice';
    last4?: string;
    brand?: string;
  };
  invoices: Invoice[];
  credits: number;
  taxInfo?: {
    vatNumber?: string;
    companyName: string;
    address: Address;
  };
}

export interface TenantUsage {
  current: {
    users: number;
    precintos: number;
    transitos: number;
    alerts: number;
    apiCalls: number;
    storage: number; // GB
  };
  history: UsageHistory[];
  overage: {
    [key: string]: {
      amount: number;
      cost: number;
    };
  };
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
  visibility: 'always' | 'edit' | 'view';
  position: number;
}

export interface CustomWidget {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'metric' | 'custom';
  config: Record<string, any>;
  dataSource: string;
  refreshInterval?: number;
}

export interface CustomWorkflow {
  id: string;
  name: string;
  trigger: {
    event: string;
    conditions: Condition[];
  };
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type: 'email' | 'webhook' | 'update_field' | 'create_alert' | 'assign_user';
  config: Record<string, any>;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  pdf?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface UsageHistory {
  date: Date;
  metrics: {
    [key: string]: number;
  };
  cost: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer';
  permissions: string[];
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
    language?: string;
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboardLayout?: string;
  };
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'invited';
}

export interface TenantInvite {
  id: string;
  tenantId: string;
  email: string;
  role: TenantUser['role'];
  invitedBy: string;
  invitedAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
  token: string;
}

export interface TenantContext {
  tenant: Tenant;
  user: TenantUser;
  permissions: string[];
  features: string[];
  limits: TenantPlan['limits'];
  customization: TenantCustomization;
}