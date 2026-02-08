import { Hammer, Sprout, Warehouse, Droplet, Utensils } from 'lucide-react';
import type { Facility } from '@/types/facility';

const iconClass = 'h-4 w-4 shrink-0';

export const FACILITY_ICONS: Record<Facility, React.ReactNode> = {
    workshop: <Hammer className={iconClass} />,
    farm: <Sprout className={iconClass} />,
    storage: <Warehouse className={iconClass} />,
    well: <Droplet className={iconClass} />,
    kitchen: <Utensils className={iconClass} />,
};
