import React, { useState } from 'react';
import { FactoryListing, FactoryReview } from '../types';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';

interface FactoryReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory: FactoryListing | null;
  onOpenRateModal?: (factory: FactoryListing) => void;
}

export const FactoryReviewsModal: React.FC<FactoryReviewsModalProps> = ({
  isOpen,
  onClose,
  factory,
  onOpenRateModal,
}) => {
  const { userRole } = useAuth();
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'high_quality' | 'fast_delivery'>('all');

  if (!isOpen || !factory) return null;

  const reviews: FactoryReview[] = rfqDb.getReviewsForFactory(factory.id);
  const breakdown = rfqDb.getFactoryRatingBreakdown(factory.id);

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (filterCriteria === 'high_quality') return r.qualityRating === 5;
    if (filterCriteria === 'fast_delivery') return r.leadTimeRating >= 4;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviews-dossier-title"
    >
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#d2d1cf] flex flex-col overflow-hidden text-[#1a1c1b]">
        {/* Top Modal Header */}
        <div className="p-4 bg-[#faf9f7] border-b border-[#efeeec] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                hotel_class
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="reviews-dossier-title" className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                  {factory.name}
                </h2>
                <span className="bg-[#85f8c4]/40 text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  CDSCO Verified Audits
                </span>
              </div>
              <p className="text-xs text-[#45464d]">
                {factory.location} · {factory.cleanroomGrade}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#76777d] hover:text-[#1a1c1b] transition-colors cursor-pointer"
            aria-label="Close reviews dossier"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Average Rating & 3-Criteria Breakdown Card */}
          <div className="p-4 sm:p-5 bg-[#faf9f7] rounded-2xl border border-[#efeeec] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left: Big Score */}
            <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-[#e3e2e0] sm:pr-4 flex flex-col items-center sm:items-start justify-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#76777d]">
                Average Rating
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl font-black text-[#1a1c1b] tracking-tight">
                  {breakdown.overall.toFixed(1)}
                </span>
                <span className="text-base text-[#76777d] font-semibold">/ 5.0</span>
              </div>

              {/* Stars */}
              <div className="flex items-center text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: star <= Math.round(breakdown.overall) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>

              <span className="text-xs text-[#45464d] font-medium">
                Based on <strong className="text-[#1a1c1b]">{breakdown.totalReviews}</strong> verified brand review{breakdown.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Right: 3 Core Criteria Breakdown Bars */}
            <div className="sm:col-span-8 space-y-2.5">
              <span className="text-xs font-bold text-[#1a1c1b] block">
                Performance Rating Breakdown:
              </span>

              {/* 1. Communication */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#45464d] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">chat_bubble</span>
                    <span>Communication</span>
                  </span>
                  <span className="font-bold text-[#1a1c1b] font-mono">
                    ★ {breakdown.communication.toFixed(1)} <span className="text-[10px] text-[#76777d] font-normal">/ 5.0</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e3e2e0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006c4a] rounded-full transition-all duration-500"
                    style={{ width: `${(breakdown.communication / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* 2. Lead Time */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#45464d] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">schedule</span>
                    <span>Lead Time & Adherence</span>
                  </span>
                  <span className="font-bold text-[#1a1c1b] font-mono">
                    ★ {breakdown.leadTime.toFixed(1)} <span className="text-[10px] text-[#76777d] font-normal">/ 5.0</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e3e2e0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006c4a] rounded-full transition-all duration-500"
                    style={{ width: `${(breakdown.leadTime / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Quality */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#45464d] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">verified</span>
                    <span>Cleanroom & CoA Quality</span>
                  </span>
                  <span className="font-bold text-[#1a1c1b] font-mono">
                    ★ {breakdown.quality.toFixed(1)} <span className="text-[10px] text-[#76777d] font-normal">/ 5.0</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e3e2e0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006c4a] rounded-full transition-all duration-500"
                    style={{ width: `${(breakdown.quality / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Header: Filter Chips + Write Review Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#1a1c1b]">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterCriteria('all')}
                className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                  filterCriteria === 'all'
                    ? 'bg-[#1a1c1b] text-white border-[#1a1c1b]'
                    : 'bg-white text-[#45464d] border-[#d2d1cf] hover:bg-[#efeeec]'
                }`}
              >
                All Reviews ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCriteria('high_quality')}
                className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                  filterCriteria === 'high_quality'
                    ? 'bg-[#006c4a] text-white border-[#006c4a]'
                    : 'bg-white text-[#45464d] border-[#d2d1cf] hover:bg-[#efeeec]'
                }`}
              >
                ★ 5.0 Quality
              </button>
              <button
                type="button"
                onClick={() => setFilterCriteria('fast_delivery')}
                className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                  filterCriteria === 'fast_delivery'
                    ? 'bg-[#006c4a] text-white border-[#006c4a]'
                    : 'bg-white text-[#45464d] border-[#d2d1cf] hover:bg-[#efeeec]'
                }`}
              >
                On-Time Lead Time
              </button>
            </div>

            {/* Write Review CTA for Brands */}
            {userRole === 'brand' && onOpenRateModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRateModal(factory);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">rate_review</span>
                <span>Rate this Factory</span>
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2">
                <span className="material-symbols-outlined text-3xl text-[#76777d]">rate_review</span>
                <p className="text-xs font-semibold text-[#1a1c1b]">No reviews match this filter.</p>
              </div>
            ) : (
              filteredReviews.map(r => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-white border border-[#efeeec] shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                          {r.brandName}
                        </span>
                        <span className="bg-[#85f8c4]/30 text-[#002114] text-[10px] font-bold px-2 py-0.2 rounded-full">
                          Verified Brand
                        </span>
                      </div>

                      {r.productName && (
                        <p className="text-[11px] text-[#45464d] mt-0.5">
                          Production: <strong className="text-[#1a1c1b]">{r.productName}</strong>
                          {r.batchUnits ? ` (${r.batchUnits.toLocaleString()} units)` : ''}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 bg-[#faf9f7] px-2 py-1 rounded-lg border border-[#efeeec]">
                        <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-bold text-xs text-[#1a1c1b] font-mono">
                          {r.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#76777d] block mt-0.5">
                        {r.dateFormatted || 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* 3 Criteria Mini Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    <span className="bg-[#faf9f7] text-[#45464d] px-2 py-0.5 rounded-md border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">chat_bubble</span>
                      <span>Communication:</span>
                      <strong className="text-[#1a1c1b]">★ {r.communicationRating}</strong>
                    </span>

                    <span className="bg-[#faf9f7] text-[#45464d] px-2 py-0.5 rounded-md border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">schedule</span>
                      <span>Lead Time:</span>
                      <strong className="text-[#1a1c1b]">★ {r.leadTimeRating}</strong>
                    </span>

                    <span className="bg-[#faf9f7] text-[#45464d] px-2 py-0.5 rounded-md border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">verified</span>
                      <span>Quality:</span>
                      <strong className="text-[#1a1c1b]">★ {r.qualityRating}</strong>
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-[#333] leading-relaxed bg-[#faf9f7]/60 p-2.5 rounded-lg border border-[#efeeec]/80">
                    &quot;{r.comment}&quot;
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#faf9f7] border-t border-[#efeeec] flex items-center justify-between">
          <span className="text-[11px] text-[#76777d]">
            All reviews verified via CDSCO manufacturing batch audit records.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#d2d1cf] hover:bg-[#efeeec] text-xs font-semibold text-[#1a1c1b] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
