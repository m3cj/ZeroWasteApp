import React from 'react';
import {
  Boxes,
  Recycle,
  Cpu,
  AlertTriangle,
  Apple,
  HeartPulse,
  Layers,
  FileText,
  Footprints,
  Hammer,
  Shirt,
  Trees,
  Wine,
  Scissors,
  BatteryCharging,
  Package,
  CircleDot,
  Trash2,
} from 'lucide-react';

const ICON_MAP = {
  // Groups
  Boxes: Boxes,
  Recycle: Recycle,
  Cpu: Cpu,
  AlertTriangle: AlertTriangle,
  Apple: Apple,
  HeartPulse: HeartPulse,

  // Categories
  Layers: Layers,
  FileText: FileText,
  Footprints: Footprints,
  Hammer: Hammer,
  Shirt: Shirt,
  Trees: Trees,
  Wine: Wine,
  Scissors: Scissors,
  BatteryCharging: BatteryCharging,
  Package: Package,
  CircleDot: CircleDot,

  // Semantic fallbacks by group/category title
  'Dry Waste': Boxes,
  'E-Waste': Cpu,
  'Domestic Hazardous Waste': AlertTriangle,
  'Wet Waste': Apple,
  'Sanitary & Medical Waste': HeartPulse,

  Plastic: Layers,
  Paper: FileText,
  'Leather & Sole': Footprints,
  Metal: Hammer,
  Cloth: Shirt,
  Wood: Trees,
  Glass: Wine,
  Hair: Scissors,
  Electronics: Cpu,
  Battery: BatteryCharging,
};

export default function WasteIcon({
  name,
  size = 16,
  className = '',
  strokeWidth = 2,
}) {
  const IconComponent = ICON_MAP[name] || Package;
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}
