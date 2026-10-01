import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RFQItem } from '../types';
import { rfqDb } from '../services/rfqDb';

interface LeadUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQItem | null;
  onLeadUnlocked?: () => void;
}

export const LeadUnlockModal: React.FC<LeadUnlockModalProps> = ({
  isOpen,
  onClose,
  rfq,
  onLeadUnlocked,
}) => {
  const [unlocking, setUnlocking] = useState(false);

  if (!isOpen || !rfq) return null;

  const isUnlocked = rfq.leadUnlocked;

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
      rfqDb.unlockLead(rfq.id);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#006c4a', '#85f8c4', '#ffd9dd'],
        });
      } catch {
        // ignore
      }
      setUnlocking(false);
      if (onLeadUnlocked) onLeadUnlocked();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3a0915] text-[#ffd9dd] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">monetization_on</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Monetization Architecture Preview
              </h3>
              <p className="text-[11px] text-[#006c4a] font-semibold">
                Phase 2 Pay-Per-Lead Integration (₹500 / lead)
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

        {/* Phase 1 vs Phase 2 Comparison Badge */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-[#faf9f7] border border-[#efeeec] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#45464d]">Current Status</span>
            <span className="bg-[#85f8c4] text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Phase 1 Free Tier Active
            </span>
          </div>
          <p className="text-xs text-[#1a1c1b] font-medium leading-relaxed">
            During <strong>Phase 1 Rollout</strong>, all verified factory partners receive 100% free lead unlocking. In <strong>Phase 2</strong>, this component transitions to the ₹500 pay-per-lead / wallet deduction gateway.
          </p>
        </div>

        {/* RFQ Card Context */}
        <div className="p-4 space-y-3 text-xs">
          <div className="bg-[#f4f3f1] p-3 rounded-xl border border-[#e3e2e0]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#006c4a] uppercase">{rfq.brandTag}</span>
                <h4 className="font-bold text-sm text-[#1a1c1b]">{rfq.brandName}</h4>
                <p className="text-[#45464d] text-[11px]">{rfq.productName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#45464d] block">Target Value</span>
                <span className="font-bold text-sm text-[#1a1c1b]">
                  ₹{rfq.estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details (Locked vs Unlocked) */}
          <div className="p-3 rounded-xl border border-[#c6c6cd] space-y-2 relative overflow-hidden bg-white">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#1a1c1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#006c4a]">
                  {isUnlocked ? 'lock_open' : 'lock'}
                </span>
                Direct Brand Procurement Dossier
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isUnlocked ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#ffd9dd] text-[#3a0915]'
              }`}>
                {isUnlocked ? 'Unlocked & Active' : 'Phase 2 Preview'}
              </span>
            </div>

            {isUnlocked ? (
              <div className="space-y-2 pt-2 border-t border-[#efeeec]">
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d]">Procurement Lead:</span>
                  <span className="font-bold text-[#1a1c1b]">
                    {rfq.directContact?.contactPerson || 'Dr. Neha Sharma (Head of R&D)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d]">Direct Phone:</span>
                  <span className="font-mono font-bold text-[#006c4a]">
                    {rfq.directContact?.phone || '+91 98450 82910'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d]">Official Sourcing Email:</span>
                  <span className="font-mono text-[#1a1c1b]">
                    {rfq.directContact?.email || 'procurement@brand.com'}
                  </span>
                </div>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/919845082910?text=Hello,%20Aura%20Formulations%20is%20reviewing%20your%20RFQ%20for%20${encodeURIComponent(rfq.productName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-lg bg-[#25D366] text-white font-bold text-center flex items-center justify-center gap-1 shadow-sm hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-base">chat</span>
                    <span>Direct WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${rfq.directContact?.phone || '+919845082910'}`}
                    className="px-3 py-2 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] font-bold flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <div className="blur-xs select-none space-y-1 text-[#76777d]">
                  <p>Contact: Dr. Neha Sharma (Head of R&D)</p>
                  <p>Phone: +91 98450 ••••••</p>
                  <p>Email: neha@•••••••••.com</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#ffd9dd]/30 border border-[#ffd9dd] text-[11px] text-[#3a0915] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#70343e]">info</span>
                  <span>Phase 2 will bill ₹500 to unlock direct procurement lines. In Phase 1, you can unlock this immediately for ₹0!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#efeeec] flex items-center justify-between bg-white">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#45464d] uppercase font-bold">Standard Cost</span>
            <span className="text-sm font-['Plus_Jakarta_Sans'] font-bold text-[#1a1c1b]">
              ₹500 <span className="text-[10px] text-[#006c4a] line-through font-normal">₹0 in Phase 1</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b]"
            >
              Close
            </button>
            {!isUnlocked ? (
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005137] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">lock_open</span>
                <span>{unlocking ? 'Unlocking...' : 'Unlock Lead (Free in Phase 1)'}</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#000000] text-white text-xs font-semibold"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
