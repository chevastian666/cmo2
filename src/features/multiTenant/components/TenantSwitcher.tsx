/**
 * Tenant Switcher Component
 * Allows users to switch between tenants they have access to
 * By Cheva
 */

import React, { useState } from 'react';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTenantStore } from '@/store/tenantStore';
import { cn } from '@/utils/utils';
import { motion } from 'framer-motion';

export const TenantSwitcher: React.FC = () => {
  const { currentTenant, tenants, switchTenant, canSwitchTenants, isLoading } = useTenantStore();
  const [open, setOpen] = useState(false);

  if (!currentTenant) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      suspended: 'destructive',
      inactive: 'outline'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} className="ml-2">
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (planName: string) => {
    const colors = {
      starter: 'bg-gray-500',
      professional: 'bg-blue-500',
      enterprise: 'bg-purple-500',
      custom: 'bg-orange-500'
    };

    return (
      <span className={cn(
        'px-2 py-0.5 text-xs rounded-full text-white',
        colors[planName as keyof typeof colors] || 'bg-gray-500'
      )}>
        {planName}
      </span>
    );
  };

  if (!canSwitchTenants) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentTenant.customization?.branding?.logo} />
          <AvatarFallback>
            <Building2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentTenant.displayName}</p>
          <p className="text-xs text-gray-400">{getPlanBadge(currentTenant.plan.name)}</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto"
          disabled={isLoading}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentTenant.customization?.branding?.logo} />
              <AvatarFallback>
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">{currentTenant.displayName}</p>
              <p className="text-xs text-gray-400">{currentTenant.plan.name}</p>
            </div>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => switchTenant(tenant.id)}
            disabled={tenant.status === 'suspended' || tenant.status === 'inactive'}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={tenant.customization?.branding?.logo} />
                  <AvatarFallback>
                    <Building2 className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{tenant.displayName}</p>
                  <p className="text-xs text-gray-400">{tenant.plan.name}</p>
                </div>
              </div>
              
              {currentTenant.id === tenant.id && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              
              {(tenant.status === 'suspended' || tenant.status === 'inactive') && 
                getStatusBadge(tenant.status)
              }
            </div>
          </DropdownMenuItem>
        ))}
        
        {tenants.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            No organizations available
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};