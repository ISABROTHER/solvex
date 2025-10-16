export type ClientTier = "VIP" | "Regular" | "Dormant";
export interface Client {
  id: string; company_name: string; contact_person: string; email: string; phone: string;
  tier: ClientTier; industry?: string; location?: string; notes?: string; last_contact?: string;
  created_at?: string; updated_at?: string; status?: "Active" | "Paused";
}

export interface BookedService {
  id: string; client_id: string; service_name: string; project_id?: string | null;
  booking_date: string; deadline: string; status: "Requested"|"Confirmed"|"In Progress"|"Completed";
  assigned_members: string[]; cost?: number; invoice_id?: string; notes?: string;
}

export interface Project {
  id: string; title: string; client_id: string;
  status: "Planned"|"In Progress"|"Review"|"Completed";
  start_date: string; due_date: string; owner_user_id: string;
  budget?: number; progress: number; tags?: string[]; notes?: string;
}

export interface Team { id: string; team_name: string; code: string; lead_member_id?: string; description?: string; email_alias?: string; is_active: boolean; }
export interface Member { id: string; full_name: string; role_title: string; email: string; phone?: string; team_id?: string; status: "Active"|"On Leave"|"Offboarded"; skills?: string[]; profile_image_url?: string; notes?: string; availability?: string; }
export interface Applicant { id: string; name: string; email: string; phone?: string; role_applied: string; team_target?: string; portfolio_links?: string[]; statement?: string; location?: string; application_date: string; status: "Pending"|"Approved"|"Rejected"; score?: number; }

export interface Equipment { id: string; item_name: string; category: "Camera"|"Lens"|"Drone"|"Audio"|"Lighting"|"Rig"|"Accessory"; serial_no?: string; condition: "Excellent"|"Good"|"Fair"|"Needs Repair"; status: "Available"|"Booked"|"Maintenance"|"Retired"; daily_rate?: number; location?: string; notes?: string; }
export interface EquipmentBooking { id: string; equipment_id: string; client_id?: string; project_id?: string; start_date: string; end_date: string; status: "Reserved"|"Checked Out"|"Returned"|"Overdue"|"Cancelled"; deposit?: number; total_cost?: number; checked_out_at?: string; returned_at?: string; notes?: string; }

export interface Partner { id: string; name: string; type: "Vendor"|"Media"|"Sponsor"|"Agency"|"Venue"|"Influencer"|"Education"|"Gov"|"NGO"; tier: "Strategic"|"Preferred"|"Standard"|"Trial"; category?: string; status: "Active"|"Paused"|"Applicant"; logo_url?: string; website_url?: string; about?: string; location?: string; account_manager_user_id?: string; last_contact_at?: string; next_action_at?: string; next_action_note?: string; notes?: string; }
export interface PartnerContact { id: string; partner_id: string; full_name: string; role_title?: string; email: string; phone?: string; whatsapp?: string; telegram?: string; preferred_channel?: "Email"|"WhatsApp"|"Telegram"|"Call"; is_primary?: boolean; }
export interface Agreement { id: string; partner_id: string; type: "MoU"|"SLA"|"Reseller"|"Sponsorship"|"NDA"; start_date: string; end_date?: string; auto_renew?: boolean; status: "Draft"|"Active"|"Expiring"|"Terminated"; document_url?: string; }

export interface Assignment { id: string; project_id: string; assignee_type: "team"|"member"|"partner"; assignee_id: string; role: string; scope_summary?: string; start_date?: string; due_date?: string; status?: string; permissions?: Record<string, boolean>; created_by?: string; created_at?: string; }

export type TabKey =
  | "home"
  | "clients"
  | "projects"
  | "access_requests"
  | "teams"
  | "equipment"
  | "services"
  | "partners"
  | "applications"
  | "jobs"
  | "settings";
