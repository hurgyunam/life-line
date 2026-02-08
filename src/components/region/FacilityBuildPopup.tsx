import { useTranslation } from 'react-i18next';
import type { Facility } from '@/types/facility';
import { FACILITIES } from '@/types/facility';
import { FACILITY_ICONS } from '@/constants/facilityIcons';

interface FacilityBuildPopupProps {
  regionId: string
  installedFacilities: Facility[]
  onSelect: (facility: Facility) => void
  onClose: () => void
}

export function FacilityBuildPopup({
    installedFacilities,
    onSelect,
    onClose,
}: FacilityBuildPopupProps) {
    const { t } = useTranslation();
    const installedSet = new Set(installedFacilities);
    const availableFacilities = FACILITIES.filter((f) => !installedSet.has(f));

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="facility-popup-title"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="flex flex-col w-full max-w-[320px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
                    <h2 id="facility-popup-title" className="text-lg font-semibold text-gray-800">
                        {t('regionList.facilityBuildTitle')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label={t('common.close')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </header>
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {availableFacilities.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">
                            {t('regionList.allFacilitiesInstalled')}
                        </p>
                    ) : (
                        availableFacilities.map((facility) => (
                            <button
                                key={facility}
                                type="button"
                                onClick={() => onSelect(facility)}
                                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 hover:border-indigo-200 transition-colors"
                            >
                                <span className="flex shrink-0 text-indigo-600 [&>svg]:h-5 [&>svg]:w-5">
                                    {FACILITY_ICONS[facility]}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {t(`facility.${facility}`)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
