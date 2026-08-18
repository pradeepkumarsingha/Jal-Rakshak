export const EMERGENCY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#CA8A04',
  MODERATE: '#84CC16',
  LOW: '#16A34A',
  NORMAL: '#0891B2',
}

export const MAP_COLORS = {
  WATER: '#0EA5E9',
  LAND: '#F1F5F9',
  ROADS: '#94A3B8',
  SHELTERS: '#7C3AED',
  SOS: '#DC2626',
  RESCUE: '#059669',
}

export const UI_COLORS = {
  PRIMARY: '#0284C7',
  SECONDARY: '#2563EB',
  BACKGROUND: '#F8FAFC',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#0F172A',
  TEXT_SECONDARY: '#64748B',
}

export const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  RESCUE: 'rescue',
}

export const HELPLINE_NUMBERS = [
  { name: 'NDRF National Helpline', number: '1078', desc: 'National Disaster Response Force' },
  { name: 'State Disaster Control Room', number: '1070', desc: 'SDRF / State Emergency Ops Center' },
  { name: 'National Emergency Number', number: '112', desc: 'Police, Fire, Ambulance 24x7' },
  { name: 'Central Water Commission Control', number: '1800-11-4040', desc: 'River Gauge & Flood Alerts' },
  { name: 'Odisha Disaster Ops (SRC)', number: '0674-2534177', desc: 'Special Relief Commissioner' },
]

export const SOS_CATEGORIES = [
  { id: 'rooftop', label: 'Stranded on Rooftop / High Ground', icon: 'Home', weight: 35 },
  { id: 'medical', label: 'Medical Emergency / Oxygen / Dialysis', icon: 'HeartPulse', weight: 45 },
  { id: 'risingRapidly', label: 'Water Inflowing Rapidly (>1m/hr)', icon: 'Waves', weight: 40 },
  { id: 'infantsElderly', label: 'Infants / Pregnant / Senior Citizens', icon: 'Users', weight: 30 },
  { id: 'cutoff', label: 'Complete Road Cutoff / No Food or Drinking Water', icon: 'AlertTriangle', weight: 25 },
]

export const WATER_DEPTH_LEVELS = [
  { id: 'ankle', label: 'Ankle Level (~15 cm)', desc: 'Pedestrians can wade cautiously', score: 15 },
  { id: 'knee', label: 'Knee Level (~50 cm)', desc: 'Two-wheelers and sedans impassable', score: 40 },
  { id: 'waist', label: 'Waist Level (~100 cm)', desc: 'Ground floors inundated; evacuation urgent', score: 75 },
  { id: 'overhead', label: 'Chest to Overhead (>180 cm)', desc: 'Life-threatening; boat / air rescue required', score: 98 },
]
