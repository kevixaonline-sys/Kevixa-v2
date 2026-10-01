export type UserRole = 'factory' | 'brand';

export interface FactoryAddress {
  streetPlot?: string;
  industrialArea?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface EmailNotificationPreferences {
  enabled: boolean;
  newRfqAlerts: boolean;
  quoteUpdateAlerts: boolean;
  notificationEmail?: string;
  frequency?: 'immediate' | 'daily_digest';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyName: string;
  tagline?: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  contactPerson?: string;
  address?: FactoryAddress;
  avatarUrl?: string;
  cdscoLicense?: string;
  cdscoValidity?: string;
  cdscoLicenseDocUrl?: string;
  cdscoLicenseFileName?: string;
  cdscoVerifiedBadge?: boolean;
  minOrderQuantity?: number;
  subscriptionStatus?: string; // 'Free Tier'
  verified: boolean;
  categoryFocus?: string[];
  emailNotifications?: EmailNotificationPreferences;
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: number;
}

export type RFQUrgency = 'rush' | 'standard' | 'high_volume';

export type RFQStepperStatus = 'Draft' | 'Submitted' | 'Negotiating' | 'Approved';

export interface QuickNote {
  id: string;
  text: string;
  author: string;
  role?: string;
  category?: 'General' | 'Budget' | 'QC / Formulation' | 'Negotiation' | 'Timeline';
  createdAt: number;
  timestamp: string;
}

export interface RFQHistoryEntry {
  id: string;
  fromStatus?: RFQStepperStatus | string;
  toStatus: RFQStepperStatus;
  changedBy: string;
  role?: string;
  timestamp: string;
  relativeTime?: string;
  createdAt: number;
  note?: string;
  durationInPrevStatus?: string;
}

export type RFQAlertType = 'new_quote' | 'status_change';

export interface RFQItem {
  id: string;
  brandId: string;
  brandName: string;
  brandInitials: string;
  brandLocation: string;
  brandTag: string; // e.g. "Verified Brand", "Ayush License", "D2C Series A"
  timeAgo: string;
  urgency: RFQUrgency;
  productName: string;
  quantity: number;
  packageType: string;
  formulationType: string;
  certifications: string[];
  targetUnitPrice: number;
  estimatedTotal: number;
  targetLeadTime: string;
  leadTimeBadgeNote?: string;
  status: 'active' | 'quoted' | 'declined' | 'contracted';
  stepperStatus?: RFQStepperStatus;
  notes?: string;
  internalNotes?: QuickNote[];
  statusHistory?: RFQHistoryEntry[];
  hasAlert?: boolean;
  alertType?: RFQAlertType;
  alertTitle?: string;
  alertMessage?: string;
  alertTime?: string;
  alertTimestamp?: number;
  alertDismissed?: boolean;
  createdAt: number;
  quotesCount: number;
  leadUnlocked?: boolean;
  leadPrice?: number; // Phase 2: ₹500
  directContact?: {
    phone: string;
    email: string;
    contactPerson: string;
  };
}

export interface RFQQuote {
  id: string;
  rfqId: string;
  factoryId: string;
  factoryName: string;
  quotedUnitPrice: number;
  quotedTotal: number;
  leadTimeWeeks: number;
  minimumBatchUnits: number;
  paymentTerms: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  rfqId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface FactoryRatingBreakdown {
  communication: number;
  leadTime: number;
  quality: number;
  overall: number;
  totalReviews: number;
}

export interface FactoryReview {
  id: string;
  factoryId: string;
  factoryName: string;
  brandId: string;
  brandName: string;
  rfqId?: string;
  productName?: string;
  batchUnits?: number;
  communicationRating: number; // 1 to 5
  leadTimeRating: number;      // 1 to 5
  qualityRating: number;       // 1 to 5
  averageRating: number;       // (communication + leadTime + quality) / 3
  comment: string;
  createdAt: number;
  dateFormatted?: string;
  verifiedProduction?: boolean;
}

export interface FactoryListing {
  id: string;
  name: string;
  location: string;
  licenseNumber: string;
  validity: string;
  cleanroomGrade: string;
  capacityStatus: 'open' | 'limited' | 'full';
  minOrderQuantity: number;
  specializations: string[];
  certifications?: string[];
  tags?: string[];
  rating: number;
  reviewsCount: number;
  ratingBreakdown?: {
    communication: number;
    leadTime: number;
    quality: number;
  };
  logoUrl?: string;
  tagline?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: FactoryAddress;
  emailNotifications?: EmailNotificationPreferences;
}
