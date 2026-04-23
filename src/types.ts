export enum HospitalStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TripStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  EN_ROUTE = 'en_route',
  COMPLETED = 'completed',
}

export enum SubscriptionTier {
  BASIC = 'Basic',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise',
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber: string;
  email: string;
  subscriptionPlanId: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry: Date;
  status: HospitalStatus;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  totalTrips: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  createdAt: Date;
  tripHistory?: string[];
}

export interface Trip {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  customerId: string;
  customerName?: string;
  driverName: string;
  driverPhone: string;
  patientName: string;
  pickupLocation: string;
  dropLocation: string;
  status: TripStatus;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  customerId: string;
  customerName?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}
