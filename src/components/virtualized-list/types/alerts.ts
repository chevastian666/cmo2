export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  precintoId: string;
  vehicleId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface AlertFilters {
  severity?: Alert['severity'][];
  status?: Alert['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number; // km
  };
  assignedTo?: string[];
  precintoIds?: string[];
  vehicleIds?: string[];
}