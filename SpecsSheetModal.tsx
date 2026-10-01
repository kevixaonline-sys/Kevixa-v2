import React from 'react';

interface SpecsSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsSheetModal: React.FC<SpecsSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#efeeec] flex items-center justify-center text-[#1a1c1b]">
              <span className="material-symbols-outlined text-lg">description</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Standard COA & Technical Spec Sheet
              </h3>
              <p className="text-[11px] text-[#45464d]">CDSCO COS-8 Batch Export Dossier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] flex items-center justify-center text-[#45464d]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          <div className="bg-[#faf9f7] p-3 rounded-xl border border-[#efeeec] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#45464d] uppercase font-bold">Standard Formula</span>
              <p className="font-bold text-[#1a1c1b]">10% Niacinamide + 1% Zinc PCA Serum</p>
            </div>
            <span className="bg-[#85f8c4] text-[#002114] px-2 py-0.5 rounded font-semibold text-[10px]">
              Ready Validated Base
            </span>
          </div>

          {/* Test parameters table */}
          <div className="border border-[#e9e8e6] rounded-xl overflow-hidden">
            <div className="bg-[#efeeec] px-3 py-2 font-bold text-[11px] text-[#1a1c1b] flex justify-between">
              <span>Physicochemical Parameter</span>
              <span>Specification Range</span>
            </div>
            <div className="divide-y divide-[#efeeec] text-[#45464d]">
              <div className="px-3 py-2 flex justify-between">
                <span>Appearance / Clarity</span>
                <span className="font-semibold text-[#1a1c1b]">Clear to slightly opalescent</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>pH @ 25°C</span>
                <span className="font-semibold text-[#1a1c1b]">5.50 - 6.20 (Balanced)</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>Viscosity (Brookfield RVT)</span>
                <span className="font-semibold text-[#1a1c1b]">1,800 - 3,200 cPs</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>Specific Gravity</span>
                <span className="font-semibold text-[#1a1c1b]">1.025 - 1.045 g/ml</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>Microbial Contamination</span>
                <span className="font-semibold text-[#006c4a]">&lt; 100 CFU/g (Pass)</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>Heavy Metals (Pb, As, Hg, Cd)</span>
                <span className="font-semibold text-[#006c4a]">Below Detection Limits (ICP-MS)</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span>Accelerated Stability (3 Mo @ 40°C)</span>
                <span className="font-semibold text-[#006c4a]">Validated Stable (24M Shelf Life)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#efeeec]/60 p-3 rounded-lg text-[11px] text-[#45464d] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#006c4a]">verified</span>
            <span>Pre-cleared for CDSCO Form COS-8 export dossiers and commercial brand packaging.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#efeeec] flex items-center justify-between bg-white">
          <span className="text-[11px] text-[#45464d]">Format: PDF / JSON</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                alert('Exported technical spec sheet to clipboard!');
              }}
              className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b]"
            >
              Copy Text
            </button>
            <button
              onClick={() => {
                window.print?.();
              }}
              className="px-4 py-1.5 rounded-lg bg-[#000000] text-white text-xs font-semibold hover:bg-neutral-800"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
