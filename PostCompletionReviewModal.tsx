import React, { useState, useEffect } from 'react';
import { RFQItem, FactoryListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { rfqDb } from '../services/rfqDb';

interface PostCompletionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory?: FactoryListing | null;
  rfq?: RFQItem | null;
  onReviewSubmitted?: () => void;
}

interface StarPickerProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
  criterion: 'Communication' | 'Lead Time' | 'Quality';
  description: string;
  ratingsLabels: Record<number, string>;
}

const StarPicker: React.FC<StarPickerProps> = ({
  value,
  onChange,
  label,
  criterion,
  description,
  ratingsLabels,
}) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const activeScore = hoverVal ?? value;

  return (
    <div className="bg-[#faf9f7] p-3 sm:p-4 rounded-xl border border-[#efeeec] space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#006c4a]">
              {criterion === 'Communication'
                ? 'chat_bubble'
                : criterion === 'Lead Time'
                ? 'schedule'
                : 'verified'}
            </span>
            <span>{label}</span>
            <span className="text-red-500">*</span>
          </span>
          <p className="text-[11px] text-[#76777d] mt-0.5">{description}</p>
        </div>

        {/* Selected Score Indicator */}
        <div className="text-right">
          <span className="text-sm font-extrabold text-[#006c4a] font-mono">
            {activeScore} / 5
          </span>
        </div>
      </div>

      {/* 5-Star Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label={`Rate ${label}`}>
          {[1, 2, 3, 4, 5].map(star => {
            const isFilled = star <= (hoverVal ?? value);
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverVal(star)}
                onMouseLeave={() => setHoverVal(null)}
                className="p-1 rounded-lg hover:bg-white text-amber-500 transition-transform active:scale-125 cursor-pointer focus:outline-none"
                title={`${star} star - ${ratingsLabels[star]}`}
                aria-label={`${star} star`}
              >
                <span
                  className="material-symbols-outlined text-2xl sm:text-3xl transition-colors"
                  style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Verbal Feedback Tag */}
        <span className="text-[11px] font-semibold text-[#45464d] bg-white px-2.5 py-1 rounded-lg border border-[#e3e2e0] shadow-2xs">
          {ratingsLabels[activeScore] || 'Tap to score'}
        </span>
      </div>
    </div>
  );
};

export const PostCompletionReviewModal: React.FC<PostCompletionReviewModalProps> = ({
  isOpen,
  onClose,
  factory,
  rfq,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth();

  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [leadTimeRating, setLeadTimeRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Available factories if not pre-provided
  const factories = rfqDb.getFactories();
  const currentFactory = factory || factories.find(f => f.id === selectedFactoryId) || factories[0];

  useEffect(() => {
    if (factory) {
      setSelectedFactoryId(factory.id);
    } else if (factories.length > 0 && !selectedFactoryId) {
      setSelectedFactoryId(factories[0].id);
    }
  }, [factory, factories]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setCommunicationRating(5);
      setLeadTimeRating(5);
      setQualityRating(5);
      setComment('');
      setShowToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Live average calculation based on the 3 required criteria
  const averageScore = ((communicationRating + leadTimeRating + qualityRating) / 3).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    const brandName = currentUser?.companyName || currentUser?.displayName || 'Nyra Skin Labs';
    const brandId = currentUser?.uid || 'brand-nyra';
    const targetFactoryId = currentFactory?.id || 'factory-aura';
    const targetFactoryName = currentFactory?.name || 'Aura Formulations Pvt Ltd';

    rfqDb.addFactoryReview({
      factoryId: targetFactoryId,
      factoryName: targetFactoryName,
      brandId,
      brandName,
      rfqId: rfq?.id,
      productName: rfq?.productName || 'Formulation Pilot Batch',
      batchUnits: rfq?.quantity || 5000,
      communicationRating,
      leadTimeRating,
      qualityRating,
      comment: comment.trim(),
    });

    setIsSubmitting(false);
    setShowToast(true);

    if (onReviewSubmitted) {
      onReviewSubmitted();
    }

    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#d2d1cf] flex flex-col overflow-hidden text-[#1a1c1b]">
        {/* Top Header */}
        <div className="p-4 bg-[#faf9f7] border-b border-[#efeeec] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">rate_review</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="review-modal-title" className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                  Post-Completion Rating & Review
                </h2>
                <span className="bg-[#85f8c4]/40 text-[#002114] text-[10px] font-bold px-2 py-0.2 rounded-full">
                  Verified D2C
                </span>
              </div>
              <p className="text-xs text-[#45464d]">
                Rate manufacturer on Communication, Lead Time & Quality.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#76777d] hover:text-[#1a1c1b] transition-colors cursor-pointer"
            aria-label="Close review dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {showToast && (
          <div className="bg-[#006c4a] text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top-1 duration-150 shadow-inner">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Review submitted! Factory public average rating has been updated.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Context: Factory & Batch Info */}
          <div className="bg-[#faf9f7] p-3.5 rounded-xl border border-[#efeeec] space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c4a] block">
                  Manufacturing Facility
                </span>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                  {currentFactory?.name || 'Aura Formulations Pvt Ltd'}
                </p>
                <p className="text-[11px] text-[#45464d]">
                  {currentFactory?.location} · {currentFactory?.cleanroomGrade}
                </p>
              </div>

              {!factory && (
                <div className="w-48">
                  <label className="text-[10px] text-[#76777d] block font-semibold mb-0.5">
                    Switch Factory:
                  </label>
                  <select
                    value={selectedFactoryId}
                    onChange={(e) => setSelectedFactoryId(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-[#d2d1cf] bg-white font-medium"
                  >
                    {factories.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* RFQ / Batch Context if available */}
            {rfq && (
              <div className="pt-2 border-t border-[#efeeec] flex items-center justify-between text-xs text-[#45464d]">
                <span className="font-semibold text-[#1a1c1b] truncate">
                  Batch: {rfq.productName}
                </span>
                <span className="font-mono shrink-0">
                  {rfq.quantity.toLocaleString()} units · {rfq.packageType}
                </span>
              </div>
            )}
          </div>

          {/* 3 Core Rating Criteria */}
          <div className="space-y-3">
            {/* 1. Communication */}
            <StarPicker
              criterion="Communication"
              label="1. Communication & Transparency"
              description="Responsiveness, technical clarity, proactive updates & batch QA coordination"
              value={communicationRating}
              onChange={setCommunicationRating}
              ratingsLabels={{
                1: 'Poor / unresponsive',
                2: 'Delayed responses',
                3: 'Adequate communication',
                4: 'Very responsive & clear',
                5: 'Exceptional QA coordination',
              }}
            />

            {/* 2. Lead Time */}
            <StarPicker
              criterion="Lead Time"
              label="2. Lead Time & Adherence"
              description="Adherence to promised production timeline, dispatch speed & bottleneck handling"
              value={leadTimeRating}
              onChange={setLeadTimeRating}
              ratingsLabels={{
                1: 'Severe delays',
                2: 'Late delivery',
                3: 'Acceptable timeline',
                4: 'On-time delivery',
                5: 'Ahead of schedule / zero delays',
              }}
            />

            {/* 3. Quality */}
            <StarPicker
              criterion="Quality"
              label="3. Cleanroom Quality & Stability"
              description="Viscosity, emulsification stability, packaging integrity & CDSCO CoA validation"
              value={qualityRating}
              onChange={setQualityRating}
              ratingsLabels={{
                1: 'Specification failures',
                2: 'Minor defects',
                3: 'Meets standard specs',
                4: 'High purity & stability',
                5: 'World-class cleanroom quality',
              }}
            />
          </div>

          {/* Overall Computed Average Banner */}
          <div className="p-3 bg-linear-to-r from-[#006c4a]/10 via-[#85f8c4]/20 to-[#006c4a]/10 rounded-xl border border-[#006c4a]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <div>
                <span className="text-xs font-bold text-[#1a1c1b] block">
                  Calculated Average Rating
                </span>
                <span className="text-[11px] text-[#45464d]">
                  (Communication + Lead Time + Quality) ÷ 3
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#006c4a]">
                <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span>{averageScore}</span>
                <span className="text-xs text-[#45464d] font-normal">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Detailed Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1a1c1b] flex items-center justify-between">
              <span>Verified Brand Review & Testimonial <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-[#76777d] font-normal">
                {comment.length} / 500 characters
              </span>
            </label>
            <textarea
              rows={3}
              required
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your manufacturing experience: stability testing results, CoA turnaround speed, dispatch condition, and communication with the factory QA team..."
              className="w-full text-xs p-3 rounded-xl border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-[#efeeec]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#efeeec] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">send</span>
              <span>{isSubmitting ? 'Submitting...' : 'Submit Verified Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
