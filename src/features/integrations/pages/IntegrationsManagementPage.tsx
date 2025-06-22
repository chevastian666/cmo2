/**
 * Integrations Management Page
 * Central hub for managing all external integrations
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import { Button} from '@/components/ui/button';
import { Badge} from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import { Settings, Webhook, MessageSquare, Ticket, BarChart3, Server, Database, Plus, Play, Pause, Trash2, Activity} from 'lucide-react';

import { webhooksService, WebhookConfig} from '../../../services/integrations/webhooks.service';
import { chatService, ChatConfig} from '../../../services/integrations/chat.service';
import { ticketingService, TicketingConfig} from '../../../services/integrations/ticketing.service';
import { restAPIService, APIEndpoint} from '../../../services/integrations/rest-api.service';

import { biExportService, BIConnection} from '../../../services/integrations/bi-export.service';

interface IntegrationStats {
  webhooks: {
    total: number;
    active: number;
    successRate: number;
  };
  chat: {
    total: number;
    active: number;
    lastMessage?: Date;
  };
  ticketing: {
    total: number;
    active: number;
    ticketsCreated: number;
  };
  api: {
    totalEndpoints: number;
    enabledEndpoints: number;
    totalRequests: number;
  };
  bi: {
    total_connections: number;
    active_connections: number;
    total_records_exported: number;
  };
}

const IntegrationsManagementPage: React.FC = () => {
  const [stats, setStats] = useState<IntegrationStats>({
    webhooks: { total: 0, active: 0, successRate: 0 },
    chat: { total: 0, active: 0 },
    ticketing: { total: 0, active: 0, ticketsCreated: 0 },
    api: { totalEndpoints: 0, enabledEndpoints: 0, totalRequests: 0 },
    bi: { total_connections: 0, active_connections: 0, total_records_exported: 0 }
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([]);
  const [ticketingConfigs, setTicketingConfigs] = useState<TicketingConfig[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [biConnections, setBiConnections] = useState<BIConnection[]>([]);
   

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load configurations
    setWebhooks(webhooksService.getAllWebhooks());
    setChatConfigs(chatService.getAllChatConfigs());
    setTicketingConfigs(ticketingService.getAllTicketingConfigs());
    setApiEndpoints(restAPIService.getAllEndpoints());
    setBiConnections(biExportService.getAllConnections());

    // Load statistics
    const webhookStats = webhooksService.getDeliveryStats();
    const apiStats = restAPIService.getAPIStats();
    const biStats = biExportService.getExportStats();

    setStats({
      webhooks: {
        total: webhooksService.getAllWebhooks().length,
        active: webhooksService.getActiveWebhooks().length,
        successRate: webhookStats.successRate
      },
      chat: {
        total: chatService.getAllChatConfigs().length,
        active: chatService.getActiveChatConfigs().length
      },
      ticketing: {
        total: ticketingService.getAllTicketingConfigs().length,
        active: ticketingService.getActiveTicketingConfigs().length,
        ticketsCreated: ticketingService.getCreatedTickets().length
      },
      api: {
        totalEndpoints: apiStats.totalEndpoints,
        enabledEndpoints: apiStats.enabledEndpoints,
        totalRequests: apiStats.totalRequests
      },
      bi: {
        total_connections: biStats.total_connections,
        active_connections: biStats.active_connections,
        total_records_exported: biStats.total_records_exported
      }
    });
  };

  const toggleWebhook = (id: string) => {
    const webhook = webhooksService.getWebhook(id);
    if (webhook) {
      webhooksService.updateWebhook(id, { active: !webhook.active });
      loadData();
    }
  };

  const toggleChatConfig = (id: string) => {
    const config = chatService.getChatConfig(id);
    if (config) {
      chatService.updateChatConfig(id, { active: !config.active });
      loadData();
    }
  };

  const toggleTicketingConfig = (id: string) => {
    const config = ticketingService.getTicketingConfig(id);
    if (config) {
      ticketingService.updateTicketingConfig(id, { active: !config.active });
      loadData();
    }
  };

  const toggleApiEndpoint = (id: string) => {
    const endpoint = restAPIService.getEndpoint(id);
    if (endpoint) {
      restAPIService.updateEndpoint(id, { enabled: !endpoint.enabled });
      loadData();
    }
  };

  const toggleBiConnection = (id: string) => {
    const connection = biExportService.getConnection(id);
    if (connection) {
      biExportService.updateConnection(id, { active: !connection.active });
      loadData();
    }
  };

  const testWebhook = async (id: string) => {
    try {
      await webhooksService.testWebhook(id);
      alert('Webhook test sent successfully!');
    } catch (error) {
      alert(`Webhook test failed: ${error}`);
    }
  };

  const testChatConfig = async (id: string) => {
    try {
      const config = chatService.getChatConfig(id);
      if (config) {
        await chatService.testConnection(config);
        alert('Chat integration test sent successfully!');
      }
    } catch (error) {
      alert(`Chat test failed: ${error}`);
    }
  };

  const testTicketingConfig = async (id: string) => {
    try {
      const config = ticketingService.getTicketingConfig(id);
      if (config) {
        const result = await ticketingService.testConnection(config);
        alert(result ? 'Ticketing connection successful!' : 'Ticketing connection failed!');
      }
    } catch (error) {
      alert(`Ticketing test failed: ${error}`);
    }
  };

  const testBiConnection = async (id: string) => {
    try {
      const connection = biExportService.getConnection(id);
      if (connection) {
        const result = await biExportService.testConnection(connection);
        alert(result.success ? 'BI connection successful!' : `BI connection failed: ${result.error}`);
      }
    } catch (error) {
      alert(`BI test failed: ${error}`);
    }
  };

  const getStatusColor = (active: boolean): string => {
    return active ? 'bg-green-500' : 'bg-gray-500';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Integraciones</h1>
          <p className="text-gray-400 mt-2">
            Administra todas las integraciones externas del sistema CMO
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <Activity className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Webhooks</p>
                <p className="text-2xl font-bold text-white">{stats.webhooks.active}/{stats.webhooks.total}</p>
                <p className="text-xs text-green-400">{stats.webhooks.successRate.toFixed(1)}% éxito</p>
              </div>
              <Webhook className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chat</p>
                <p className="text-2xl font-bold text-white">{stats.chat.active}/{stats.chat.total}</p>
                <p className="text-xs text-blue-400">Slack/Discord</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Ticketing</p>
                <p className="text-2xl font-bold text-white">{stats.ticketing.active}/{stats.ticketing.total}</p>
                <p className="text-xs text-purple-400">{stats.ticketing.ticketsCreated} tickets</p>
              </div>
              <Ticket className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">API REST</p>
                <p className="text-2xl font-bold text-white">{stats.api.enabledEndpoints}/{stats.api.totalEndpoints}</p>
                <p className="text-xs text-orange-400">{stats.api.totalRequests} requests</p>
              </div>
              <Server className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">BI Export</p>
                <p className="text-2xl font-bold text-white">{stats.bi.active_connections}/{stats.bi.total_connections}</p>
                <p className="text-xs text-pink-400">{stats.bi.total_records_exported} records</p>
              </div>
              <BarChart3 className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Tabs */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="ticketing">Ticketing</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL</TabsTrigger>
          <TabsTrigger value="bi">BI Export</TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuraciones de Webhooks</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(webhook.active)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{webhook.name}</h3>
                        <p className="text-sm text-gray-400">{webhook.url}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{webhook.events.length} eventos</Badge>
                          <span className="text-xs text-gray-500">
                            {webhook.successCount} éxitos, {webhook.errorCount} errores
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testWebhook(webhook.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWebhook(webhook.id)}
                      >
                        {webhook.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => webhooksService.deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay webhooks configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integraciones de Chat</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Integración
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatConfigs.map(config => (
                  <div key={config.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(config.active)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{config.name}</h3>
                        <p className="text-sm text-gray-400">{config.type.toUpperCase()}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{config.alert_types.length} tipos de alerta</Badge>
                          {config.channel && (
                            <span className="text-xs text-gray-500">#{config.channel}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testChatConfig(config.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleChatConfig(config.id)}
                      >
                        {config.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => chatService.deleteChatConfig(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {chatConfigs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay integraciones de chat configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticketing Tab */}
        <TabsContent value="ticketing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sistemas de Ticketing</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Conexión
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticketingConfigs.map(config => (
                  <div key={config.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(config.active)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{config.name}</h3>
                        <p className="text-sm text-gray-400">{config.type.toUpperCase()} - {config.base_url}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{config.alert_types.length} tipos de alerta</Badge>
                          {config.auto_create_tickets && (
                            <Badge variant="outline">Auto-creación</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testTicketingConfig(config.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTicketingConfig(config.id)}
                      >
                        {config.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => ticketingService.deleteTicketingConfig(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {ticketingConfigs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay sistemas de ticketing configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API REST Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Endpoints API REST</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Ver Swagger
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Endpoint
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(endpoint.enabled)}`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'destructive'}>
                            {endpoint.method}
                          </Badge>
                          <h3 className="font-medium text-white">{endpoint.path}</h3>
                        </div>
                        <p className="text-sm text-gray-400">{endpoint.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {endpoint.authentication !== 'none' && (
                            <Badge variant="outline">{endpoint.authentication}</Badge>
                          )}
                          {endpoint.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiEndpoint(endpoint.id)}
                      >
                        {endpoint.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restAPIService.deleteEndpoint(endpoint.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {apiEndpoints.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay endpoints configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GraphQL Tab */}
        <TabsContent value="graphql">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">GraphQL API</h3>
                      <p className="text-sm text-gray-400">/graphql</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">Queries</Badge>
                        <Badge variant="secondary">Mutations</Badge>
                        <Badge variant="secondary">Subscriptions</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline">
                        Ver Schema
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-white mb-2">Queries</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• alerts</li>
                        <li>• transits</li>
                        <li>• precintos</li>
                        <li>• statistics</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-white mb-2">Mutations</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• acknowledgeAlert</li>
                        <li>• resolveAlert</li>
                        <li>• updateTransitStatus</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-white mb-2">Subscriptions</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• alertCreated</li>
                        <li>• transitUpdated</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BI Export Tab */}
        <TabsContent value="bi">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conexiones BI</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Conexión
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biConnections.map(connection => (
                  <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.active)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{connection.name}</h3>
                        <p className="text-sm text-gray-400">{connection.type.toUpperCase()}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{connection.syncCount} syncs</Badge>
                          {connection.lastSync && (
                            <span className="text-xs text-gray-500">
                              Último: {formatDate(connection.lastSync)}
                            </span>
                          )}
                          {connection.errorCount > 0 && (
                            <Badge variant="destructive">{connection.errorCount} errores</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testBiConnection(connection.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBiConnection(connection.id)}
                      >
                        {connection.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => biExportService.deleteConnection(connection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {biConnections.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay conexiones BI configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsManagementPage;