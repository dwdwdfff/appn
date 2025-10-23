import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Developer = {
  id: string;
  name: string;
  logo_url?: string;
  established_date?: string;
  description?: string;
  portfolio?: any[];
  contact_info?: any;
  dynamic_data?: any;
  created_at: string;
  updated_at: string;
};

export type Area = {
  id: string;
  name: string;
  city: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  developer_id?: string;
  area_id?: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  down_payment_min?: number;
  down_payment_max?: number;
  installment_years?: number;
  has_clubhouse?: boolean;
  amenities?: string[];
  unit_types?: string[];
  delivery_date?: string;
  status?: string;
  images?: string[];
  master_plan_url?: string;
  dynamic_data?: any;
  dynamic_fields?: any;
  created_at: string;
  updated_at: string;
  developer?: Developer;
  area?: Area;
};

export type Unit = {
  id: string;
  project_id: string;
  unit_type: string;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  down_payment?: number;
  monthly_installment?: number;
  quarterly_installment?: number;
  semi_annual_installment?: number;
  annual_installment?: number;
  installment_years?: number;
  floor_number?: number;
  unit_number?: string;
  status?: string;
  master_plan_url?: string;
  video_url?: string;
  layout_image_url?: string;
  dynamic_data?: any;
  created_at: string;
  updated_at: string;
  project?: Project;
};
