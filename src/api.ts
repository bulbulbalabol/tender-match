import axios from 'axios'
import { Tender, Vendor, Category, Region, Stats } from './types'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

export const getStats = (): Promise<Stats> =>
  api.get('/stats').then(r => r.data)

export const getCategories = (): Promise<Category[]> =>
  api.get('/categories').then(r => r.data)

export const getRegions = (): Promise<Region[]> =>
  api.get('/regions').then(r => r.data)

export const getTenders = (params: {
  category?: string
  region?: string
  amount_min?: number
  amount_max?: number
  search?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<{ tenders: Tender[]; total: number }> =>
  api.get('/tenders', { params }).then(r => r.data)

export const getTender = (id: string): Promise<Tender> =>
  api.get(`/tenders/${id}`).then(r => r.data)

export const createVendor = (data: {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  bin?: string
  city: string
  employee_count: string
  categories: string[]
  regions: string[]
  min_amount?: number
  max_amount?: number
}): Promise<{ id: string; message: string }> =>
  api.post('/vendors', data).then(r => r.data)

export const getVendor = (id: string): Promise<Vendor> =>
  api.get(`/vendors/${id}`).then(r => r.data)

export const getVendorByEmail = (email: string): Promise<Vendor> =>
  api.get(`/vendors/by-email/${email}`).then(r => r.data)

export const getMatches = (
  vendorId: string,
  params?: { limit?: number; offset?: number }
): Promise<{ matches: Tender[]; total: number; high_match: number; medium_match: number }> =>
  api.get(`/vendors/${vendorId}/matches`, { params }).then(r => r.data)

export const getBidIntelligence = (tenderId: string): Promise<{
  avg_bidders: number
  win_rate: number
  competition_level: string
  level_color: string
  level_label: { en: string; ru: string }
}> =>
  api.get(`/tenders/${tenderId}/bid-intel`).then(r => r.data)

export const generateProposal = (
  tenderId: string,
  vendorId: string,
  lang: string = 'en'
): Promise<{ proposal: string; lang: string; tender_name: string; vendor_name: string }> =>
  api.post('/proposal/generate', { tender_id: tenderId, vendor_id: vendorId, lang }).then(r => r.data)

export const formatAmount = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B ₸`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M ₸`
  return `${(amount / 1_000).toFixed(0)}K ₸`
}
