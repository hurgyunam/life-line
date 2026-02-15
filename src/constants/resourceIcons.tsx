import {
  Trees,
  Mountain,
  Gem,
  Flower2,
  Shield,
  Droplet,
  Cherry,
  Carrot,
  LeafyGreen,
  Wheat,
} from 'lucide-react'
import type { CampResource } from '@/types/resource'

const iconClass = 'h-5 w-5 shrink-0'

export const RESOURCE_ICONS: Record<CampResource, React.ReactNode> = {
  wood: <Trees className={iconClass} />,
  stone: <Mountain className={iconClass} />,
  ironOre: <Gem className={iconClass} />,
  cotton: <Flower2 className={iconClass} />,
  leather: <Shield className={iconClass} />,
  water: <Droplet className={iconClass} />,
  wildStrawberry: <Cherry className={iconClass} />,
  potato: <Carrot className={iconClass} />,
  corn: <LeafyGreen className={iconClass} />,
  wheat: <Wheat className={iconClass} />,
}
