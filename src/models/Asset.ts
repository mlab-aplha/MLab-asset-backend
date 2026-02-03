export interface Asset {
  id?: string;
  name: string;
  description?: string;
  category: string;  
  serialNumber: string;
  brand?: string;
  model?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue?: number;
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
  location: string;
  assignedTo?: string; 
  assignedDate?: string;
  maintenanceHistory?: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface MaintenanceRecord {
  date: string;
  description: string;
  cost?: number;
  performedBy: string;
  nextMaintenanceDate?: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  department?: string;
  createdAt: string;
  updatedAt: string;
}
