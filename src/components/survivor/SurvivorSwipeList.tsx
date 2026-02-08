import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Survivor } from '@/types/survivor';
import { SurvivorCard } from '@/components/survivor/SurvivorCard';

const SWIPE_THRESHOLD = 60;
const DRAG_DECAY = 0.3;

interface SurvivorSwipeListProps {
  survivors: Survivor[]
}

export function SurvivorSwipeList({ survivors }: SurvivorSwipeListProps) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const dragStartRef = useRef<{ x: number; startX: number } | null>(null);

    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < survivors.length - 1;

    const goPrev = useCallback(() => {
        if (!canGoPrev || isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((i) => i - 1);
        setTimeout(() => setIsAnimating(false), 300);
    }, [canGoPrev, isAnimating]);

    const goNext = useCallback(() => {
        if (!canGoNext || isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((i) => i + 1);
        setTimeout(() => setIsAnimating(false), 300);
    }, [canGoNext, isAnimating]);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (isAnimating) return;
            dragStartRef.current = { x: e.clientX, startX: e.clientX }
            ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        },
        [isAnimating]
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragStartRef.current || isAnimating) return;
            const dx = e.clientX - dragStartRef.current.x;
            let constrained = dx;
            if (dx > 0 && !canGoPrev) constrained = dx * DRAG_DECAY;
            if (dx < 0 && !canGoNext) constrained = dx * DRAG_DECAY;
            setDragOffset(constrained);
        },
        [isAnimating, canGoPrev, canGoNext]
    );

    const handlePointerUp = useCallback(() => {
        if (!dragStartRef.current || isAnimating) return;
        const offset = dragOffset;
        setDragOffset(0);
        dragStartRef.current = null;

        if (offset > SWIPE_THRESHOLD && canGoPrev) {
            goPrev();
        } else if (offset < -SWIPE_THRESHOLD && canGoNext) {
            goNext();
        }
    }, [dragOffset, canGoPrev, canGoNext, goPrev, goNext, isAnimating]);

    if (survivors.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[280px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500">{t('survivorList.empty')}</p>
            </div>
        );
    }

    const current = survivors[currentIndex];

    return (
        <div className="w-full select-none">
            {/* 스와이프 영역 */}
            <div
                className="relative touch-pan-y touch-pinch-zoom"
                style={{ touchAction: 'pan-y pinch-zoom' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div
                    className="transition-transform duration-300 ease-out"
                    style={{
                        transform: `translateX(calc(${dragOffset}px))`,
                        transition: dragOffset !== 0 ? 'none' : undefined,
                    }}
                >
                    <div className="min-h-[420px]">
                        <SurvivorCard survivor={current} />
                    </div>
                </div>

                {/* 스와이프 힌트 (드래그 중일 때) */}
                {dragOffset !== 0 && (
                    <div
                        className="absolute inset-y-0 left-0 flex items-center justify-center w-12 bg-amber-100/80 rounded-l-2xl pointer-events-none"
                        style={{ opacity: dragOffset > 20 ? Math.min(1, dragOffset / 80) : 0 }}
                    >
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                )}
                {dragOffset !== 0 && (
                    <div
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 bg-indigo-100/80 rounded-r-2xl pointer-events-none"
                        style={{ opacity: dragOffset < -20 ? Math.min(1, -dragOffset / 80) : 0 }}
                    >
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* 네비게이션: 인덱스 + 이전/다음 버튼 */}
            <div className="flex items-center justify-between gap-4 mt-4 px-2">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canGoPrev || isAnimating}
                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label={t('common.prev')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <span className="text-sm font-medium text-gray-600 tabular-nums">
                    {currentIndex + 1} / {survivors.length}
                </span>

                <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext || isAnimating}
                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label={t('common.next')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* 점 인디케이터 */}
            {survivors.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {survivors.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                if (!isAnimating) {
                                    setIsAnimating(true);
                                    setCurrentIndex(i);
                                    setTimeout(() => setIsAnimating(false), 300);
                                }
                            }}
                            className={`h-2 rounded-full transition-all ${
                                i === currentIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={t('survivorList.detailExpand')}
                            aria-current={i === currentIndex ? 'true' : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
