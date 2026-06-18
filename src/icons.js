import { Droplets, Coffee, Zap, Flame, Leaf, Wind, Thermometer, Bean } from 'lucide-react'

export const ICON_MAP = {
  Droplets,
  Coffee,
  Zap,
  Flame,
  Leaf,
  Wind,
  Thermometer,
  Bean,
}

export const ICON_OPTIONS = Object.entries(ICON_MAP).map(([name, Icon]) => ({ name, Icon }))
