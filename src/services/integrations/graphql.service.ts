/**
 * GraphQL Service for Flexible Queries
 * GraphQL endpoint with schema and resolvers
 * By Cheva
 */

export interface GraphQLSchema {
  types: GraphQLType[];
  queries: GraphQLQuery[];
  mutations: GraphQLMutation[];
  subscriptions: GraphQLSubscription[];
}

export interface GraphQLType {
  name: string;
  description: string;
  fields: GraphQLField[];
  kind: 'OBJECT' | 'INPUT' | 'ENUM' | 'INTERFACE' | 'UNION' | 'SCALAR';
}

export interface GraphQLField {
  name: string;
  type: string;
  description: string;
  args?: GraphQLArgument[];
  nullable: boolean;
  list: boolean;
}

export interface GraphQLArgument {
  name: string;
  type: string;
  description: string;
  defaultValue?: any;
  required: boolean;
}

export interface GraphQLQuery {
  name: string;
  description: string;
  type: string;
  args: GraphQLArgument[];
  resolver: string; // Function name to resolve the query
}

export interface GraphQLMutation {
  name: string;
  description: string;
  type: string;
  args: GraphQLArgument[];
  resolver: string;
}

export interface GraphQLSubscription {
  name: string;
  description: string;
  type: string;
  args: GraphQLArgument[];
  resolver: string;
}

export interface GraphQLConfig {
  endpoint: string;
  introspection: boolean;
  playground: boolean;
  authentication: {
    enabled: boolean;
    type: 'api_key' | 'bearer' | 'basic';
    key?: string;
    header?: string;
  };
  rateLimit: {
    enabled: boolean;
    maxDepth: number;
    maxComplexity: number;
    requests: number;
    window: number;
  };
  subscriptions: {
    enabled: boolean;
    path: string;
  };
}

export interface GraphQLQueryResult {
  data?: any;
  errors?: GraphQLError[];
  extensions?: any;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: any;
}

class GraphQLService {
  private config: GraphQLConfig;
  private schema: GraphQLSchema;
  private resolvers = new Map<string, Function>();
  private subscriptions = new Map<string, Set<Function>>();

  constructor() {
    this.config = {
      endpoint: '/graphql',
      introspection: true,
      playground: true,
      authentication: {
        enabled: true,
        type: 'api_key',
        key: 'cmo-graphql-key-2024',
        header: 'Authorization'
      },
      rateLimit: {
        enabled: true,
        maxDepth: 10,
        maxComplexity: 100,
        requests: 50,
        window: 3600 // 1 hour
      },
      subscriptions: {
        enabled: true,
        path: '/subscriptions'
      }
    };

    this.schema = this.initializeSchema();
    this.initializeResolvers();
  }

  // Configuration
  updateConfig(updates: Partial<GraphQLConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  getConfig(): GraphQLConfig {
    return this.config;
  }

  // Schema management
  getSchema(): GraphQLSchema {
    return this.schema;
  }

  updateSchema(schema: Partial<GraphQLSchema>): void {
    this.schema = { ...this.schema, ...schema };
    this.saveSchema();
  }

  // SDL (Schema Definition Language) generation
  generateSDL(): string {
    let sdl = '';

    // Generate types
    this.schema.types.forEach(type => {
      sdl += this.generateTypeSDL(type) + '\n\n';
    });

    // Generate Query type
    if (this.schema.queries.length > 0) {
      sdl += 'type Query {\n';
      this.schema.queries.forEach(query => {
        sdl += `  ${this.generateFieldSDL(query)}\n`;
      });
      sdl += '}\n\n';
    }

    // Generate Mutation type
    if (this.schema.mutations.length > 0) {
      sdl += 'type Mutation {\n';
      this.schema.mutations.forEach(mutation => {
        sdl += `  ${this.generateFieldSDL(mutation)}\n`;
      });
      sdl += '}\n\n';
    }

    // Generate Subscription type
    if (this.schema.subscriptions.length > 0) {
      sdl += 'type Subscription {\n';
      this.schema.subscriptions.forEach(subscription => {
        sdl += `  ${this.generateFieldSDL(subscription)}\n`;
      });
      sdl += '}\n\n';
    }

    return sdl;
  }

  // Query execution
  async executeQuery(query: string, variables: any = {}, context: any = {}): Promise<GraphQLQueryResult> {
    try {
      // Parse and validate query
      const parsedQuery = this.parseQuery(query);
      
      // Check authentication
      if (this.config.authentication.enabled) {
        const authResult = this.checkAuthentication(context);
        if (!authResult.valid) {
          return {
            errors: [{ message: authResult.error || 'Authentication failed' }]
          };
        }
      }

      // Check rate limiting and complexity
      if (this.config.rateLimit.enabled) {
        const complexityCheck = this.checkComplexity(parsedQuery);
        if (!complexityCheck.valid) {
          return {
            errors: [{ message: complexityCheck.error || 'Query too complex' }]
          };
        }
      }

      // Execute query
      const result = await this.resolveQuery(parsedQuery, variables, context);
      return { data: result };

    } catch (error) {
      return {
        errors: [{
          message: (error as Error).message,
          extensions: { code: 'EXECUTION_ERROR' }
        }]
      };
    }
  }

  // Introspection
  async introspectSchema(): Promise<any> {
    return {
      __schema: {
        types: this.schema.types.map(type => ({
          name: type.name,
          description: type.description,
          kind: type.kind,
          fields: type.fields.map(field => ({
            name: field.name,
            description: field.description,
            type: {
              name: field.type,
              kind: this.getTypeKind(field.type)
            },
            args: field.args || []
          }))
        })),
        queryType: { name: 'Query' },
        mutationType: this.schema.mutations.length > 0 ? { name: 'Mutation' } : null,
        subscriptionType: this.schema.subscriptions.length > 0 ? { name: 'Subscription' } : null
      }
    };
  }

  // Subscription management
  subscribe(operationName: string, callback: Function): () => void {
    if (!this.subscriptions.has(operationName)) {
      this.subscriptions.set(operationName, new Set());
    }
    
    this.subscriptions.get(operationName)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscriptions.get(operationName)?.delete(callback);
    };
  }

  publish(operationName: string, data: any): void {
    const subscribers = this.subscriptions.get(operationName);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Subscription callback error for ${operationName}:`, error);
        }
      });
    }
  }

  // Resolver management
  addResolver(name: string, resolver: Function): void {
    this.resolvers.set(name, resolver);
  }

  getResolver(name: string): Function | null {
    return this.resolvers.get(name) || null;
  }

  // Private methods
  private initializeSchema(): GraphQLSchema {
    return {
      types: [
        {
          name: 'Alert',
          description: 'Alerta del sistema CMO',
          kind: 'OBJECT',
          fields: [
            { name: 'id', type: 'ID', description: 'Identificador único', nullable: false, list: false },
            { name: 'title', type: 'String', description: 'Título de la alerta', nullable: false, list: false },
            { name: 'message', type: 'String', description: 'Mensaje de la alerta', nullable: false, list: false },
            { name: 'priority', type: 'AlertPriority', description: 'Prioridad de la alerta', nullable: false, list: false },
            { name: 'status', type: 'AlertStatus', description: 'Estado de la alerta', nullable: false, list: false },
            { name: 'timestamp', type: 'DateTime', description: 'Fecha y hora de creación', nullable: false, list: false },
            { name: 'source', type: 'String', description: 'Fuente de la alerta', nullable: true, list: false },
            { name: 'metadata', type: 'JSON', description: 'Metadatos adicionales', nullable: true, list: false }
          ]
        },
        {
          name: 'Transit',
          description: 'Tránsito de mercancías',
          kind: 'OBJECT',
          fields: [
            { name: 'id', type: 'ID', description: 'Identificador único', nullable: false, list: false },
            { name: 'origin', type: 'String', description: 'Origen del tránsito', nullable: false, list: false },
            { name: 'destination', type: 'String', description: 'Destino del tránsito', nullable: false, list: false },
            { name: 'status', type: 'TransitStatus', description: 'Estado del tránsito', nullable: false, list: false },
            { name: 'departure', type: 'DateTime', description: 'Fecha y hora de salida', nullable: true, list: false },
            { name: 'arrival', type: 'DateTime', description: 'Fecha y hora de llegada', nullable: true, list: false },
            { name: 'precintos', type: 'Precinto', description: 'Precintos asociados', nullable: true, list: true }
          ]
        },
        {
          name: 'Precinto',
          description: 'Precinto electrónico',
          kind: 'OBJECT',
          fields: [
            { name: 'id', type: 'ID', description: 'Identificador único', nullable: false, list: false },
            { name: 'serial', type: 'String', description: 'Número de serie', nullable: false, list: false },
            { name: 'status', type: 'PrecintoStatus', description: 'Estado del precinto', nullable: false, list: false },
            { name: 'location', type: 'String', description: 'Ubicación actual', nullable: true, list: false },
            { name: 'lastUpdate', type: 'DateTime', description: 'Última actualización', nullable: false, list: false },
            { name: 'transit', type: 'Transit', description: 'Tránsito asociado', nullable: true, list: false }
          ]
        },
        {
          name: 'AlertPriority',
          description: 'Prioridades de alerta disponibles',
          kind: 'ENUM',
          fields: [
            { name: 'LOW', type: 'String', description: 'Prioridad baja', nullable: false, list: false },
            { name: 'MEDIUM', type: 'String', description: 'Prioridad media', nullable: false, list: false },
            { name: 'HIGH', type: 'String', description: 'Prioridad alta', nullable: false, list: false },
            { name: 'CRITICAL', type: 'String', description: 'Prioridad crítica', nullable: false, list: false }
          ]
        },
        {
          name: 'AlertStatus',
          description: 'Estados de alerta disponibles',
          kind: 'ENUM',
          fields: [
            { name: 'ACTIVE', type: 'String', description: 'Alerta activa', nullable: false, list: false },
            { name: 'ACKNOWLEDGED', type: 'String', description: 'Alerta confirmada', nullable: false, list: false },
            { name: 'RESOLVED', type: 'String', description: 'Alerta resuelta', nullable: false, list: false }
          ]
        },
        {
          name: 'TransitStatus',
          description: 'Estados de tránsito disponibles',
          kind: 'ENUM',
          fields: [
            { name: 'PENDING', type: 'String', description: 'Pendiente', nullable: false, list: false },
            { name: 'IN_PROGRESS', type: 'String', description: 'En progreso', nullable: false, list: false },
            { name: 'COMPLETED', type: 'String', description: 'Completado', nullable: false, list: false },
            { name: 'DELAYED', type: 'String', description: 'Retrasado', nullable: false, list: false },
            { name: 'CANCELLED', type: 'String', description: 'Cancelado', nullable: false, list: false }
          ]
        },
        {
          name: 'PrecintoStatus',
          description: 'Estados de precinto disponibles',
          kind: 'ENUM',
          fields: [
            { name: 'ACTIVE', type: 'String', description: 'Activo', nullable: false, list: false },
            { name: 'INACTIVE', type: 'String', description: 'Inactivo', nullable: false, list: false },
            { name: 'VIOLATED', type: 'String', description: 'Violado', nullable: false, list: false },
            { name: 'DAMAGED', type: 'String', description: 'Dañado', nullable: false, list: false }
          ]
        }
      ],
      queries: [
        {
          name: 'alerts',
          description: 'Obtener lista de alertas con filtros opcionales',
          type: '[Alert]',
          args: [
            { name: 'status', type: 'AlertStatus', description: 'Filtrar por estado', required: false },
            { name: 'priority', type: 'AlertPriority', description: 'Filtrar por prioridad', required: false },
            { name: 'limit', type: 'Int', description: 'Límite de resultados', required: false, defaultValue: 10 },
            { name: 'offset', type: 'Int', description: 'Offset para paginación', required: false, defaultValue: 0 }
          ],
          resolver: 'resolveAlerts'
        },
        {
          name: 'alert',
          description: 'Obtener una alerta por ID',
          type: 'Alert',
          args: [
            { name: 'id', type: 'ID!', description: 'ID de la alerta', required: true }
          ],
          resolver: 'resolveAlert'
        },
        {
          name: 'transits',
          description: 'Obtener lista de tránsitos',
          type: '[Transit]',
          args: [
            { name: 'status', type: 'TransitStatus', description: 'Filtrar por estado', required: false },
            { name: 'origin', type: 'String', description: 'Filtrar por origen', required: false },
            { name: 'destination', type: 'String', description: 'Filtrar por destino', required: false }
          ],
          resolver: 'resolveTransits'
        },
        {
          name: 'precintos',
          description: 'Obtener lista de precintos',
          type: '[Precinto]',
          args: [
            { name: 'status', type: 'PrecintoStatus', description: 'Filtrar por estado', required: false },
            { name: 'transitId', type: 'ID', description: 'Filtrar por tránsito', required: false }
          ],
          resolver: 'resolvePrecintos'
        },
        {
          name: 'statistics',
          description: 'Obtener estadísticas del sistema',
          type: 'JSON',
          args: [],
          resolver: 'resolveStatistics'
        }
      ],
      mutations: [
        {
          name: 'acknowledgeAlert',
          description: 'Confirmar una alerta',
          type: 'Alert',
          args: [
            { name: 'id', type: 'ID!', description: 'ID de la alerta', required: true },
            { name: 'notes', type: 'String', description: 'Notas adicionales', required: false }
          ],
          resolver: 'acknowledgeAlert'
        },
        {
          name: 'resolveAlert',
          description: 'Resolver una alerta',
          type: 'Alert',
          args: [
            { name: 'id', type: 'ID!', description: 'ID de la alerta', required: true },
            { name: 'resolution', type: 'String', description: 'Descripción de la resolución', required: false }
          ],
          resolver: 'resolveAlertMutation'
        },
        {
          name: 'updateTransitStatus',
          description: 'Actualizar estado de tránsito',
          type: 'Transit',
          args: [
            { name: 'id', type: 'ID!', description: 'ID del tránsito', required: true },
            { name: 'status', type: 'TransitStatus!', description: 'Nuevo estado', required: true }
          ],
          resolver: 'updateTransitStatus'
        }
      ],
      subscriptions: [
        {
          name: 'alertCreated',
          description: 'Suscribirse a nuevas alertas',
          type: 'Alert',
          args: [
            { name: 'priority', type: 'AlertPriority', description: 'Filtrar por prioridad', required: false }
          ],
          resolver: 'subscribeAlertCreated'
        },
        {
          name: 'transitUpdated',
          description: 'Suscribirse a actualizaciones de tránsito',
          type: 'Transit',
          args: [
            { name: 'id', type: 'ID', description: 'ID del tránsito específico', required: false }
          ],
          resolver: 'subscribeTransitUpdated'
        }
      ]
    };
  }

  private initializeResolvers(): void {
    // Query resolvers
    this.addResolver('resolveAlerts', this.mockResolveAlerts.bind(this));
    this.addResolver('resolveAlert', this.mockResolveAlert.bind(this));
    this.addResolver('resolveTransits', this.mockResolveTransits.bind(this));
    this.addResolver('resolvePrecintos', this.mockResolvePrecintos.bind(this));
    this.addResolver('resolveStatistics', this.mockResolveStatistics.bind(this));

    // Mutation resolvers
    this.addResolver('acknowledgeAlert', this.mockAcknowledgeAlert.bind(this));
    this.addResolver('resolveAlertMutation', this.mockResolveAlertMutation.bind(this));
    this.addResolver('updateTransitStatus', this.mockUpdateTransitStatus.bind(this));

    // Subscription resolvers
    this.addResolver('subscribeAlertCreated', this.mockSubscribeAlertCreated.bind(this));
    this.addResolver('subscribeTransitUpdated', this.mockSubscribeTransitUpdated.bind(this));
  }

  // Mock resolvers
  private async mockResolveAlerts(args: any): Promise<any[]> {
    const alerts = [];
    const limit = Math.min(args.limit || 10, 100);
    
    for (let i = 0; i < limit; i++) {
      alerts.push({
        id: `alert_${i + 1}`,
        title: `Alerta ${i + 1}`,
        message: `Descripción de la alerta ${i + 1}`,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        status: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: 'CMO',
        metadata: { generated: true }
      });
    }
    
    return alerts;
  }

  private async mockResolveAlert(args: any): Promise<any> {
    return {
      id: args.id,
      title: `Alerta ${args.id}`,
      message: `Descripción detallada de la alerta ${args.id}`,
      priority: 'HIGH',
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      source: 'CMO',
      metadata: { detailed: true }
    };
  }

  private async mockResolveTransits(args: any): Promise<any[]> {
    const transits = [];
    const limit = 10;
    
    for (let i = 0; i < limit; i++) {
      transits.push({
        id: `transit_${i + 1}`,
        origin: ['Montevideo', 'Buenos Aires', 'São Paulo'][Math.floor(Math.random() * 3)],
        destination: ['Montevideo', 'Buenos Aires', 'São Paulo'][Math.floor(Math.random() * 3)],
        status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
        departure: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        arrival: new Date(Date.now() + Math.random() * 86400000).toISOString(),
        precintos: [
          {
            id: `precinto_${i + 1}_1`,
            serial: `PRE${String(i + 1).padStart(6, '0')}`,
            status: 'ACTIVE',
            location: `Ubicación ${i + 1}`,
            lastUpdate: new Date().toISOString()
          }
        ]
      });
    }
    
    return transits;
  }

  private async mockResolvePrecintos(args: any): Promise<any[]> {
    const precintos = [];
    const limit = 20;
    
    for (let i = 0; i < limit; i++) {
      precintos.push({
        id: `precinto_${i + 1}`,
        serial: `PRE${String(i + 1).padStart(6, '0')}`,
        status: ['ACTIVE', 'INACTIVE', 'VIOLATED'][Math.floor(Math.random() * 3)],
        location: `Ubicación ${i + 1}`,
        lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        transit: {
          id: `transit_${Math.floor(i / 2) + 1}`,
          origin: 'Montevideo',
          destination: 'Buenos Aires'
        }
      });
    }
    
    return precintos;
  }

  private async mockResolveStatistics(): Promise<any> {
    return {
      alerts: {
        total: 150,
        active: 23,
        acknowledged: 45,
        resolved: 82
      },
      transits: {
        total: 75,
        pending: 10,
        inProgress: 15,
        completed: 45,
        delayed: 5
      },
      precintos: {
        total: 200,
        active: 180,
        inactive: 15,
        violated: 5
      },
      lastUpdated: new Date().toISOString()
    };
  }

  private async mockAcknowledgeAlert(args: any): Promise<any> {
    return {
      id: args.id,
      title: `Alerta ${args.id}`,
      message: 'Alerta confirmada',
      priority: 'HIGH',
      status: 'ACKNOWLEDGED',
      timestamp: new Date().toISOString(),
      source: 'CMO'
    };
  }

  private async mockResolveAlertMutation(args: any): Promise<any> {
    return {
      id: args.id,
      title: `Alerta ${args.id}`,
      message: 'Alerta resuelta',
      priority: 'HIGH',
      status: 'RESOLVED',
      timestamp: new Date().toISOString(),
      source: 'CMO'
    };
  }

  private async mockUpdateTransitStatus(args: any): Promise<any> {
    return {
      id: args.id,
      origin: 'Montevideo',
      destination: 'Buenos Aires',
      status: args.status,
      departure: new Date(Date.now() - 86400000).toISOString(),
      arrival: new Date(Date.now() + 86400000).toISOString()
    };
  }

  private mockSubscribeAlertCreated(args: any): () => void {
    return this.subscribe('alertCreated', (data: any) => {
      if (!args.priority || data.priority === args.priority) {
        return data;
      }
    });
  }

  private mockSubscribeTransitUpdated(args: any): () => void {
    return this.subscribe('transitUpdated', (data: any) => {
      if (!args.id || data.id === args.id) {
        return data;
      }
    });
  }

  private generateTypeSDL(type: GraphQLType): string {
    let sdl = `"""${type.description}"""\n`;
    
    switch (type.kind) {
      case 'ENUM':
        sdl += `enum ${type.name} {\n`;
        type.fields.forEach(field => {
          sdl += `  """${field.description}"""\n`;
          sdl += `  ${field.name}\n`;
        });
        sdl += '}';
        break;
      
      default:
        sdl += `type ${type.name} {\n`;
        type.fields.forEach(field => {
          sdl += `  """${field.description}"""\n`;
          sdl += `  ${field.name}: ${this.formatType(field)}\n`;
        });
        sdl += '}';
    }
    
    return sdl;
  }

  private generateFieldSDL(field: any): string {
    const args = field.args && field.args.length > 0 
      ? `(${field.args.map((arg: any) => `${arg.name}: ${arg.type}`).join(', ')})`
      : '';
    
    return `"""${field.description}"""\n  ${field.name}${args}: ${field.type}`;
  }

  private formatType(field: GraphQLField): string {
    let type = field.type;
    
    if (field.list) {
      type = `[${type}]`;
    }
    
    if (!field.nullable) {
      type += '!';
    }
    
    return type;
  }

  private parseQuery(query: string): any {
    // Simplified query parsing - in real implementation, use a proper GraphQL parser
    return {
      query,
      complexity: this.calculateComplexity(query),
      depth: this.calculateDepth(query)
    };
  }

  private calculateComplexity(query: string): number {
    // Simplified complexity calculation
    const fieldCount = (query.match(/\w+/g) || []).length;
    return Math.max(1, fieldCount / 10);
  }

  private calculateDepth(query: string): number {
    // Simplified depth calculation
    const braceCount = (query.match(/{/g) || []).length;
    return Math.max(1, braceCount);
  }

  private checkAuthentication(context: any): { valid: boolean; error?: string } {
    if (!this.config.authentication.enabled) {
      return { valid: true };
    }

    const authHeader = context.headers?.[this.config.authentication.header?.toLowerCase() || 'authorization'];
    
    switch (this.config.authentication.type) {
      case 'api_key':
        if (!authHeader || authHeader !== this.config.authentication.key) {
          return { valid: false, error: 'Invalid API key' };
        }
        break;
      case 'bearer':
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return { valid: false, error: 'Invalid bearer token' };
        }
        break;
    }
    
    return { valid: true };
  }

  private checkComplexity(parsedQuery: any): { valid: boolean; error?: string } {
    if (parsedQuery.complexity > this.config.rateLimit.maxComplexity) {
      return { valid: false, error: 'Query complexity exceeds limit' };
    }
    
    if (parsedQuery.depth > this.config.rateLimit.maxDepth) {
      return { valid: false, error: 'Query depth exceeds limit' };
    }
    
    return { valid: true };
  }

  private async resolveQuery(parsedQuery: any, variables: any, context: any): Promise<any> {
    // Simplified query resolution - in real implementation, use proper GraphQL execution
    const queryName = this.extractQueryName(parsedQuery.query);
    const resolver = this.getResolver(queryName);
    
    if (!resolver) {
      throw new Error(`No resolver found for query: ${queryName}`);
    }
    
    return await resolver(variables, context);
  }

  private extractQueryName(query: string): string {
    // Simplified query name extraction
    const match = query.match(/query\s*{\s*(\w+)/);
    return match ? match[1] : 'unknown';
  }

  private getTypeKind(typeName: string): string {
    const type = this.schema.types.find(t => t.name === typeName);
    return type?.kind || 'SCALAR';
  }

  // Persistence
  private saveConfig(): void {
    try {
      localStorage.setItem('cmo_graphql_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save GraphQL config:', error);
    }
  }

  private saveSchema(): void {
    try {
      localStorage.setItem('cmo_graphql_schema', JSON.stringify(this.schema));
    } catch (error) {
      console.error('Failed to save GraphQL schema:', error);
    }
  }

  loadConfig(): void {
    try {
      const stored = localStorage.getItem('cmo_graphql_config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load GraphQL config:', error);
    }
  }

  loadSchema(): void {
    try {
      const stored = localStorage.getItem('cmo_graphql_schema');
      if (stored) {
        this.schema = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load GraphQL schema:', error);
    }
  }
}

// Singleton instance
export const graphQLService = new GraphQLService();

// Initialize on import
graphQLService.loadConfig();
graphQLService.loadSchema();