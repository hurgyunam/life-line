import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REGIONS } from '@/constants/regions';
import { getRegionDisplayInfos } from '@/utils/regionName';
import { RegionDetailRow } from '@/components/region/RegionDetailRow';

function ChevronIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export function RegionList() {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const displayInfos = getRegionDisplayInfos(REGIONS);
    const infoMap = new Map(displayInfos.map((d) => [d.regionId, d]));

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">
                            {t('regionList.name')}
                        </th>
                        <th className="px-2 py-1.5 w-9" aria-label={t('regionList.detailExpand')} />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {REGIONS.map((region) => {
                        const info = infoMap.get(region.id);
                        if (!info) return null;

                        const isExpanded = expandedId === region.id;
                        const baseName = `${t(`campResources.${info.resourceKey}`)} ${t('regionList.richRegionSuffix')}`;
                        const displayName =
              info.suffix != null ? `${baseName} ${info.suffix}` : baseName;

                        return (
                            <Fragment key={region.id}>
                                <tr
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleExpand(region.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleExpand(region.id);
                                        }
                                    }}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-2 py-1.5 font-medium text-gray-900 whitespace-nowrap">
                                        {displayName}
                                    </td>
                                    <td className="px-2 py-1.5 w-9">
                                        <span
                                            className="inline-flex text-gray-500"
                                            aria-expanded={isExpanded}
                                            aria-label={isExpanded ? t('regionList.detailCollapse') : t('regionList.detailExpand')}
                                        >
                                            <ChevronIcon expanded={isExpanded} />
                                        </span>
                                    </td>
                                </tr>
                                <RegionDetailRow region={region} isExpanded={isExpanded} />
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
