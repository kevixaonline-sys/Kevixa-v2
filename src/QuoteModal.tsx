import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RFQItem } from '../types';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQItem | null;
  onQuoteSubmitted?: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  rfq,
  onQuoteSubmitted,
}) => {
  const { currentUser } = useAuth();
  const [unitPrice, setUnitPrice] = useState<number>(rfq?.targetUnitPrice || 34.5);
  const [leadTimeWeeks, setLeadTimeWeeks] = useState<number>(2);
  const [minBatch, setMinBatch] = useState<number>(rfq?.quantity || 10000);
  const [paymentTerms, setPaymentTerms] = useState<string>('50% advance, 50% on dispatch against COA');
  const [notes, setNotes] = useState<string>(
    'Factory stock packaging (amber glass bottle + rubber pipette) in warehouse. Ready ISO 22716 base formulation available for fast stability clearance.'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !rfq) return null;

  const totalQuoted = unitPrice * (rfq.quantity || 10000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await rfqDb.submitQuote({
        rfqId: rfq.id,
        factoryId: currentUser?.uid || 'factory-aura',
        factoryName: currentUser?.companyName || 'Aura Formulations',
        quotedUnitPrice: Number(unitPrice),
        quotedTotal: totalQuoted,
        leadTimeWeeks: Number(leadTimeWeeks),
        minimumBatchUnits: Number(minBatch),
        paymentTerms,
        notes,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#006c4a', '#85f8c4', '#000000'],
        });
      } catch {
        // ignore
      }

      if (onQuoteSubmitted) {
        onQuoteSubmitted();
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">send</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Submit Formal B2B Quote
              </h3>
              <p className="text-[11px] text-[#45464d]">
                To: <span className="font-bold text-[#1a1c1b]">{rfq.brandName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] flex items-center justify-center text-[#45464d]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* RFQ Reference Recap */}
        <div className="bg-[#faf9f7] p-3 mx-4 mt-4 rounded-xl border border-[#efeeec] text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1a1c1b]">{rfq.productName}</span>
            <span className="text-[11px] font-bold text-[#006c4a]">
              Target: ₹{rfq.targetUnitPrice.toFixed(2)}/u
            </span>
          </div>
          <div className="text-[11px] text-[#45464d] flex items-center gap-3">
            <span>Requested Qty: <strong>{rfq.quantity.toLocaleString()} units</strong></span>
            <span>Target Lead: <strong>{rfq.targetLeadTime}</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Quoted Unit Price & Lead Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Quoted Unit Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[#45464d] font-bold">₹</span>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={unitPrice}
                  onChange={e => setUnitPrice(Number(e.target.value))}
                  className="w-full h-9 pl-7 pr-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Committed Lead Time
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={leadTimeWeeks}
                  onChange={e => setLeadTimeWeeks(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-bold text-sm"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-[#45464d]">Weeks</span>
              </div>
            </div>
          </div>

          {/* Minimum Batch Units & Total */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Min. Production Batch
              </label>
              <input
                type="number"
                value={minBatch}
                onChange={e => setMinBatch(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-semibold text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Estimated Total Contract
              </label>
              <div className="h-9 px-3 rounded-lg bg-[#efeeec] flex items-center font-bold text-[#006c4a] text-sm">
                ₹{totalQuoted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">Commercial Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">
              Factory Remarks & Formulation Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
              placeholder="Specify bottle samples dispatch date, testing certifications, etc."
            />
          </div>

          {/* CDSCO Assurance Banner */}
          <div className="bg-[#85f8c4]/30 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-[#002114]">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">verified</span>
            <span>Quotes submitted from Aura Formulations include CDSCO COS-8 license warranty and batch COA.</span>
          </div>

          {/* Email Notification Dispatch Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#45464d] bg-[#faf9f7] p-2 rounded-lg border border-[#efeeec]">
            <span className="material-symbols-outlined text-[15px] text-[#006c4a]">forward_to_inbox</span>
            <span>Instant email alert will be dispatched to <strong>{rfq.brandName}</strong> according to their notification preferences.</span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex justify-end gap-2 border-t border-[#efeeec]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005137] active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{submitting ? 'Transmitting...' : 'Dispatch Formal Quote'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
