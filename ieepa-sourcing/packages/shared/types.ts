// ============================================================
// Shared TypeScript types — generated from DB schema
// Used by both apps/web and apps/worker
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type ClaimStatus =
  | 'new'
  | 'reviewing'
  | 'quoted'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost';

export type OutreachStatus =
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'replied';

export type MonitorSource =
  | 'federal_register'
  | 'cit_cases'
  | 'news'
  | 'sec_edgar';

// ── Database row types ───────────────────────────────────────

export interface Contact {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  source: string | null;
  referral_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  enriched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  contact_id: string | null;
  status: ClaimStatus;
  assigned_to: string | null;

  // Step 1
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  role: string | null;

  // Step 2
  total_tariff_amount: number | null;
  payment_date_start: string | null;
  payment_date_end: string | null;
  hts_codes: string[] | null;
  ports_of_entry: string[] | null;
  entries_count: number | null;
  country_of_origin: string | null;
  nda_agreed: boolean;

  // Step 3
  file_paths: string[] | null;
  storage_bucket: string;

  // Internal
  internal_notes: string | null;
  activity_log: ActivityLogEntry[];

  // Attribution
  referral_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;

  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  timestamp: string;
  action: string;
  actor: string;
  detail?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  sequence_name: string;
  email_number: number;
  subject: string;
  body_html: string;
  body_text: string;
  delay_days: number;
  created_at: string;
  updated_at: string;
}

export interface OutreachLog {
  id: string;
  contact_id: string | null;
  claim_id: string | null;
  template_id: string | null;
  sequence_name: string;
  email_number: number;
  to_email: string;
  subject: string;
  status: OutreachStatus;
  provider_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  bounce_reason: string | null;
  created_at: string;
}

export interface MonitorAlert {
  id: string;
  source: MonitorSource;
  title: string;
  summary: string | null;
  url: string | null;
  raw_data: Record<string, unknown> | null;
  notified: boolean;
  created_at: string;
}

// ── Form / API payload types ──────────────────────────────────

export interface ClaimSubmissionPayload {
  // Step 1
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  role?: string;

  // Step 2
  total_tariff_amount?: number;
  payment_date_start?: string;
  payment_date_end?: string;
  hts_codes?: string[];
  ports_of_entry?: string[];
  entries_count?: number;
  country_of_origin?: string;
  nda_agreed: boolean;

  // Attribution
  referral_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

// ── Outreach job types (BullMQ) ───────────────────────────────

export interface OutreachJobData {
  contactId: string;
  claimId?: string;
  sequenceName: string;
  emailNumber: number;
  toEmail: string;
  toName: string;
  companyName: string;
  templateId: string;
  scheduledFor?: string; // ISO timestamp
}

export interface EnrichmentJobData {
  contactId: string;
  companyName: string;
  domain?: string;
  linkedinUrl?: string;
}

// ── Monitor types ─────────────────────────────────────────────

export interface FederalRegisterDocument {
  document_number: string;
  title: string;
  abstract: string | null;
  html_url: string;
  publication_date: string;
  agencies: Array<{ name: string }>;
}

export interface CITCase {
  id: string;
  case_name: string;
  docket_number: string;
  date_filed: string;
  absolute_url: string;
  parties?: Array<{ name: string; type: string }>;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
}

export interface EdgarFiling {
  cik: string;
  company_name: string;
  form_type: string;
  date_filed: string;
  accession_number: string;
  excerpt: string;
}

// ── Supabase Database type helper ─────────────────────────────

export interface Database {
  public: {
    Tables: {
      contacts: { Row: Contact; Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Contact> };
      claims: { Row: Claim; Insert: Omit<Claim, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Claim> };
      contact_messages: { Row: ContactMessage; Insert: Omit<ContactMessage, 'id' | 'created_at'>; Update: Partial<ContactMessage> };
      email_templates: { Row: EmailTemplate; Insert: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>; Update: Partial<EmailTemplate> };
      outreach_log: { Row: OutreachLog; Insert: Omit<OutreachLog, 'id' | 'created_at'>; Update: Partial<OutreachLog> };
      monitor_alerts: { Row: MonitorAlert; Insert: Omit<MonitorAlert, 'id' | 'created_at'>; Update: Partial<MonitorAlert> };
    };
  };
}
