import { Banknote, Smartphone, Wallet, Building2, Home, TreePine } from 'lucide-react';

export const CATEGORY_META = {
  family: {
    id: 'family',
    label: 'Family',
    color: '#3B6E8F',
    bg: '#3B6E8F14',
    border: '#3B6E8F40',
    icon: Home,
  },
  business: {
    id: 'business',
    label: 'Business',
    color: '#6B4F7A',
    bg: '#6B4F7A14',
    border: '#6B4F7A40',
    icon: Building2,
  },
  public: {
    id: 'public',
    label: 'Public',
    color: '#2F8F82',
    bg: '#2F8F8214',
    border: '#2F8F8240',
    icon: TreePine,
  },
};

/** Every waste group mapped to a Tailwind color family — used for material swatches everywhere a category shows up. */
export const WASTE_GROUP_SWATCH = {
  'WG-01': { name: 'kraft', color: '#A0673B', bg: '#A0673B14', border: '#A0673B40' },
  'WG-02': { name: 'gunmetal', color: '#566270', bg: '#5662701a', border: '#56627040' },
  'WG-03': { name: 'resin', color: '#2E8F82', bg: '#2E8F8214', border: '#2E8F8240' },
  'WG-04': { name: 'circuit', color: '#6B5B95', bg: '#6B5B9514', border: '#6B5B9540' },
  'WG-05': { name: 'flint', color: '#7FA6A0', bg: '#7FA6A014', border: '#7FA6A040' },
};

export const PAYMENT_META = {
  cash: { id: 'cash', label: 'Cash', icon: Banknote, accent: '#1E7A46' },
  upi: { id: 'upi', label: 'UPI QR', icon: Smartphone, accent: '#2C5F74' },
  other: { id: 'other', label: 'Other', icon: Wallet, accent: '#B8860B' },
};

export const STAFF_ROLE_META = {
  technician: { id: 'technician', label: 'Zero Waste Technician', tagline: 'Field pickups & doorstep purchase' },
  data_operator: { id: 'data_operator', label: 'Data Operator', tagline: 'Live rates, catalog & slot desk' },
};

export const SCREENS = {
  LOGIN: 'login',
  TECH_QUEUE: 'tech-queue',
  TECH_PURCHASE: 'tech-purchase',
  OPERATOR_RATES: 'operator-rates',
};
