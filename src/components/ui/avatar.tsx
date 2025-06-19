import React from 'react';
import { cn } from '@/utils/utils';

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className, children, src, alt }) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center overflow-hidden rounded-full", className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
};

interface AvatarFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children }) => {
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-gray-700", className)}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
};