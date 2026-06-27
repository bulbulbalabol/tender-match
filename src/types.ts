export interface Tender {
  id: string
  name_ru: string
  name_en: string
  customer_ru: string
  customer_en: string
  amount: number
  region: string
  category: string
  type: string
  status: string
  deadline: string
  days_left: number
  is_closing_soon: boolean
  description_ru?: string
  description_en?: string
  category_info?: { id: string; name_ru: string; name_en: string; icon: string }
  region_info?: { id: string; name_ru: string; name_en: string }
  type_info?: { id: string; name_ru: string; name_en: string }
  match_score?: number
  match_reasons?: MatchReason[]
}

export interface MatchReason {
  type: 'category' | 'region' | 'amount'
  match: boolean
}

export interface Vendor {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  bin: string
  city: string
  employee_count: string
  categories: string[]
  regions: string[]
  min_amount: number
  max_amount: number
  created_at: string
}

export interface Category {
  id: string
  name_ru: string
  name_en: string
  icon: string
  ktru: string
}

export interface Region {
  id: string
  name_ru: string
  name_en: string
}

export interface Stats {
  total_tenders: number
  total_vendors: number
  total_amount_kzt: number
  closing_soon: number
  categories_count: number
  regions_count: number
}

export type Lang = 'en' | 'ru'
