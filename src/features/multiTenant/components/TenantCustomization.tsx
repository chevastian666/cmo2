/**
 * Tenant Customization Component
 * Allows tenants to customize their instance
 * By Cheva
 */

import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Save, 
  RotateCcw,
  Globe,
  Mail,
  Layout,
  Code,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { toast } from '@/hooks/use-toast';
import { useTenantStore } from '@/store/tenantStore';
import type { TenantCustomization as TCustomization } from '../types';

export const TenantCustomization: React.FC = () => {
  const { currentTenant, updateTenantCustomization, checkFeature } = useTenantStore();
  const [customization, setCustomization] = useState<TCustomization>(
    currentTenant?.customization || {} as TCustomization
  );
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const canWhiteLabel = checkFeature('whiteLabeling');

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTenantCustomization(customization);
      toast({
        title: 'Customization saved',
        description: 'Your branding changes have been applied successfully.'
      });
      
      // Apply theme changes immediately
      applyTheme(customization.branding);
    } catch (error) {
      toast({
        title: 'Error saving customization',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (currentTenant) {
      setCustomization(currentTenant.customization);
      applyTheme(currentTenant.customization.branding);
    }
  };

  const applyTheme = (branding: TCustomization['branding']) => {
    const root = document.documentElement;
    
    // Apply color variables
    if (branding.primaryColor) {
      root.style.setProperty('--primary', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--secondary', branding.secondaryColor);
    }
    if (branding.accentColor) {
      root.style.setProperty('--accent', branding.accentColor);
    }
    
    // Apply dark mode
    if (branding.darkMode !== undefined) {
      root.classList.toggle('dark', branding.darkMode);
    }
    
    // Apply custom CSS
    if (branding.customCss) {
      let styleEl = document.getElementById('tenant-custom-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'tenant-custom-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = branding.customCss;
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In production, upload to storage service
    // For now, convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomization(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          logo: reader.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  if (!canWhiteLabel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customization</CardTitle>
          <CardDescription>
            White-labeling features are available in Professional and Enterprise plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Upgrade your plan to customize your CMO instance with your brand colors, logo, and more.
            </p>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customization</h2>
          <p className="text-gray-400">Personalize your CMO instance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Customize colors, logos, and visual appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {customization.branding?.logo ? (
                    <img 
                      src={customization.branding.logo} 
                      alt="Logo" 
                      className="h-16 w-auto object-contain bg-gray-800 rounded p-2"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-800 rounded flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="max-w-xs"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: SVG or PNG, max 1MB
                </p>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <ColorPicker
                    value={customization.branding?.primaryColor || '#1e40af'}
                    onChange={(color) => setCustomization(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        primaryColor: color
                      }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <ColorPicker
                    value={customization.branding?.secondaryColor || '#3b82f6'}
                    onChange={(color) => setCustomization(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        secondaryColor: color
                      }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <ColorPicker
                    value={customization.branding?.accentColor || '#60a5fa'}
                    onChange={(color) => setCustomization(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        accentColor: color
                      }
                    }))}
                  />
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">
                    Use dark theme by default
                  </p>
                </div>
                <Switch
                  checked={customization.branding?.darkMode ?? true}
                  onCheckedChange={(checked) => setCustomization(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      darkMode: checked
                    }
                  }))}
                />
              </div>

              {/* Custom CSS */}
              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  placeholder="/* Add custom styles here */"
                  value={customization.branding?.customCss || ''}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      customCss: e.target.value
                    }
                  }))}
                  className="font-mono text-sm"
                  rows={8}
                />
                <p className="text-xs text-gray-500">
                  Advanced: Add custom CSS to further customize appearance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Customize email templates and sender information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={customization.emails?.fromName || ''}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      emails: {
                        ...prev.emails,
                        fromName: e.target.value
                      }
                    }))}
                    placeholder="CMO System"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    value={customization.emails?.fromEmail || ''}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      emails: {
                        ...prev.emails,
                        fromEmail: e.target.value
                      }
                    }))}
                    placeholder="noreply@cmo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Footer</Label>
                <Textarea
                  value={customization.emails?.footer || ''}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    emails: {
                      ...prev.emails,
                      footer: e.target.value
                    }
                  }))}
                  placeholder="© 2024 Your Company. All rights reserved."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Configuration</CardTitle>
              <CardDescription>
                Customize available widgets and default layouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Dashboard customization options coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Custom domain and advanced configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Domain</Label>
                <Input
                  value={currentTenant?.domain || ''}
                  placeholder="app.yourdomain.com"
                  disabled
                />
                <p className="text-xs text-gray-500">
                  Contact support to configure a custom domain
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};