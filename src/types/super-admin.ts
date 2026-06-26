
export type EntityStatus = "active" | "suspended" | "pending";
export type EntityPlan = "Starter" | "Business" | "Enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: EntityStatus;
  plan: EntityPlan;
  owners: string;
  createdAt: string;
  userCount: number;
  revenue: number;
  business_type?: string;
}

export type UserRole = "super_admin" | "tenant_admin" | "staff" | "customer";
export type UserStatus = "active" | "blocked" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  tenant: string;
  tenantId?: string;
  lastLogin: string;
  createdAt: string;
}

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "responded" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "user";
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface Ticket {
  id: string;
  tenant: string;
  tenantId: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string | null;
  assigneeId?: string;
  lastUpdate: string;
  createdAt: string;
  messages: TicketMessage[];
}

export interface PlatformTransaction {
  id: string;
  tenantName: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: "success" | "pending" | "failed" | "flagged";
  type: "subscription" | "commission" | "withdrawal";
  timestamp: string;
  reference: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "critical";
  category: string;
  message: string;
  userId?: string;
  tenantId?: string;
}
