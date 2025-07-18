export interface ToSTerm {
  id: number;
  title: string;
  content: string;
  order: number;
}

export interface ToSTemplate {
  id: string;
  name: string;
  description?: string;
  payment_type?: 'full' | 'split' | 'custom';
  terms: ToSTerm[];
  variables?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: any[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageToSMapping {
  id: string;
  package_id: string;
  tos_template_id: string;
  is_default: boolean;
  created_at: string;
  package?: Package;
  tos_template?: ToSTemplate;
}

export interface ProposalWithToS {
  id: string;
  tos_template_id?: string;
  tos_snapshot?: ToSTerm[];
  proposal_data: any;
  created_at: string;
  // ... other proposal fields
}