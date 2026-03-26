// Database types matching Supabase schema
// In production, generate these with: supabase gen types typescript

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectStatus = 'active' | 'archived' | 'completed';
export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string | null;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Supabase Database type for typed client
// Matches the format required by @supabase/supabase-js 2.100+ (PostgREST v12)
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
        Relationships: [];
      };
      org_members: {
        Row: OrgMember;
        Insert: Omit<OrgMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<OrgMember, 'id' | 'joined_at'>>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
        Relationships: [];
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Enums: {
      org_role: OrgRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
    Functions: {
      check_project_limit: {
        Args: { p_org_id: string };
        Returns: boolean;
      };
    };
  };
}
