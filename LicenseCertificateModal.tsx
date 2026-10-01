import React from 'react';

interface LicenseCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseCertificateModal: React.FC<LicenseCertificateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-2xl">verified_user</span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                CDSCO Official Manufacturing License
              </h3>
              <p className="text-xs text-[#006c4a] font-medium flex items-center gap-1">
                <span>Form COS-8 · Rule 129A Compliant</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] flex items-center justify-center text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Certificate Paper Look */}
        <div className="p-5 flex flex-col gap-4 bg-[#faf9f7] m-4 rounded-xl border border-[#e3e2e0] shadow-inner text-[#1a1c1b]">
          {/* Govt emblem & header */}
          <div className="text-center pb-3 border-b border-[#c6c6cd]/40">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#006c4a]/10 text-[#006c4a] mb-1 font-serif text-lg font-bold">
              भारत
            </div>
            <div className="text-[11px] font-bold tracking-widest text-[#45464d] uppercase">
              Government of India · Ministry of Health & Family Welfare
            </div>
            <div className="text-sm font-['Plus_Jakarta_Sans'] font-bold text-[#1a1c1b] uppercase tracking-wide">
              Central Drugs Standard Control Organization (CDSCO)
            </div>
            <div className="text-[11px] text-[#006c4a] font-medium">
              Licensing Authority · Himachal Pradesh State Drug Administration
            </div>
          </div>

          {/* Certificate Body */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="bg-white p-3 rounded-lg border border-[#e9e8e6] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#45464d] uppercase font-bold tracking-wider">License Number</span>
                <p className="font-mono font-bold text-sm text-[#1a1c1b]">COS-HP/2022/8492</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#45464d] uppercase font-bold tracking-wider">Status</span>
                <p className="text-[#006c4a] font-bold text-xs flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006c4a] inline-block animate-pulse"></span>
                  Active & Validated
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#45464d]">
              <p>
                <strong className="text-[#1a1c1b]">Licensed Facility:</strong> Aura Formulations Private Limited
              </p>
              <p>
                <strong className="text-[#1a1c1b]">Registered Premises:</strong> Plot 14-B, Industrial Area Phase II, Baddi, District Solan, Himachal Pradesh - 173205
              </p>
              <p>
                <strong className="text-[#1a1c1b]">Approved Manufacturing Categories:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[#1a1c1b]">
                <li>Part I: Skin Serums, Emulsions, Creams & Lotions (ISO 22716 Cleanroom)</li>
                <li>Part II: Lip Balms, Solid Pomades & Wax Matrices</li>
                <li>Part III: Hair Cleansers, Shampoos & Conditioning Formulas</li>
              </ul>
              <p>
                <strong className="text-[#1a1c1b]">Good Manufacturing Practice (GMP):</strong> Schedule M-II Compliant & ISO 22716:2007 Certified
              </p>
              <p>
                <strong className="text-[#1a1c1b]">Validity Period:</strong> 15th October 2022 to 14th October 2026
              </p>
            </div>

            {/* Validation Stamp & QR */}
            <div className="pt-3 border-t border-[#c6c6cd]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded border border-[#006c4a] p-1 flex items-center justify-center bg-white text-[9px] font-mono text-center">
                  [CDSCO QR]
                </div>
                <div className="text-[10px]">
                  <p className="font-bold text-[#006c4a]">Digitally Validated</p>
                  <p className="text-[#45464d]">Central Portal Sync #8492-IN</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#45464d]">State Drugs Controller</div>
                <div className="font-['Plus_Jakarta_Sans'] font-semibold text-xs text-[#1a1c1b]">
                  Dr. S. K. Pathak, Ph.D.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#efeeec] flex items-center justify-between gap-3 bg-white">
          <span className="text-xs text-[#006c4a] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">verified</span>
            100% Verified Factory Partner
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.print?.();
              }}
              className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b] hover:bg-[#efeeec] transition-colors"
            >
              Print / Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#005137] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
