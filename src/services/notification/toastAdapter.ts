import { toast} from '@/hooks/use-toast';

interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastNotificationAdapter {
  success(title: string, description?: string, options?: NotificationOptions) {
    toast({
      title,
      description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        altText: options.action.label,
        onClick: options.action.onClick,
        children: options.action.label
      } : undefined,
    });
  }

  error(title: string, description?: string, options?: NotificationOptions) {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: options?.duration || 6000,
      action: options?.action ? {
        altText: options.action.label,
        onClick: options.action.onClick,
        children: options.action.label
      } : undefined,
    });
  }

  warning(title: string, description?: string, options?: NotificationOptions) {
    toast({
      title,
      description,
      duration: options?.duration || 5000,
      action: options?.action ? {
        altText: options.action.label,
        onClick: options.action.onClick,
        children: options.action.label
      } : undefined,
    });
  }

  info(title: string, description?: string, options?: NotificationOptions) {
    toast({
      title,
      description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        altText: options.action.label,
        onClick: options.action.onClick,
        children: options.action.label
      } : undefined,
    });
  }

  // Compatibility methods for existing notification service
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: NotificationOptions) {
    switch (type) {
      case 'success':
        this.success(message, undefined, options);
        break;
      case 'error':
        this.error(message, undefined, options);
        break;
      case 'warning':
        this.warning(message, undefined, options);
        break;
      default:
        this.info(message, undefined, options);
    }
  }

  dismiss(toastId?: string) {
    // shadcn/ui toast doesn't expose individual dismiss by ID
    // Users can click the X button to dismiss
    toast({
      title: '',
      description: '',
      duration: 1,
    });
  }
}

export const toastAdapter = new ToastNotificationAdapter();