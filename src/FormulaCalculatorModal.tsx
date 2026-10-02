import React, { useState } from 'react';

interface FormulaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrice?: (price: number) => void;
}

export const FormulaCalculatorModal: React.FC<FormulaCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyPrice,
}) => {
  const [batchUnits, setBatchUnits] = useState(10000);
  const [packVolumeMl, setPackVolumeMl] = useState(30);
  const [bulkKgCost, setBulkKgCost] = useState(420); // ₹ / kg for bulk emulsion/serum
  const [packagingCost, setPackagingCost] = useState(12.5); // ₹ / unit (bottle, dropper, label)
  const [factoryOverhead, setFactoryOverhead] = useState(3.5); // ₹ / unit (cleanroom blending, QC, testing)
  const [targetMarginPercent, setTargetMarginPercent] = useState(32); // %

  if (!isOpen) return null;

  // Bulk cost per unit: (packVolumeMl / 1000) * bulkKgCost
  const bulkCostPerUnit = (packVolumeMl / 1000) * bulkKgCost;
  const totalCostPerUnit = bulkCostPerUnit + packagingCost + factoryOverhead;
  const recommendedUnitPrice = totalCostPerUnit / (1 - targetMarginPercent / 100);
  const totalBatchCost = totalCostPerUnit * batchUnits;
  const totalBatchRevenue = recommendedUnitPrice * batchUnits;
  const batchGrossProfit = totalBatchRevenue - totalBatchCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">calculate</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Formula Cost & Batch Margin
              </h3>
              <p className="text-[11px] text-[#45464d]">
                Instant unit economics & CDSCO batch costing
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

        {/* Inputs */}
        <div className="p-4 space-y-4 text-xs">
          {/* Batch Size & Volume */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Batch Units</label>
              <div className="relative">
                <input
                  type="number"
                  value={batchUnits}
                  onChange={e => setBatchUnits(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#006c4a] outline-none text-xs font-semibold"
                />
                <span className="absolute right-2 top-2 text-[10px] text-[#45464d]">units</span>
              </div>
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Pack Size (ml/g)</label>
              <div className="relative">
                <input
                  type="number"
                  value={packVolumeMl}
                  onChange={e => setPackVolumeMl(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#006c4a] outline-none text-xs font-semibold"
                />
                <span className="absolute right-2 top-2 text-[10px] text-[#45464d]">ml</span>
              </div>
            </div>
          </div>

          {/* Bulk Liquid Cost */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#1a1c1b]">Bulk Formulation (₹ / kg)</label>
              <span className="text-[11px] text-[#006c4a] font-semibold">₹{bulkCostPerUnit.toFixed(2)} / unit bulk</span>
            </div>
            <input
              type="number"
              value={bulkKgCost}
              onChange={e => setBulkKgCost(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#006c4a] outline-none text-xs font-semibold"
              placeholder="e.g. 420 for Niacinamide serum bulk"
            />
          </div>

          {/* Packaging Cost per unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Packaging (₹/unit)</label>
              <input
                type="number"
                step="0.5"
                value={packagingCost}
                onChange={e => setPackagingCost(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#006c4a] outline-none text-xs font-semibold"
                placeholder="Glass bottle + pump"
              />
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">QC & Overhead (₹/unit)</label>
              <input
                type="number"
                step="0.5"
                value={factoryOverhead}
                onChange={e => setFactoryOverhead(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#006c4a] outline-none text-xs font-semibold"
                placeholder="Micro testing & labor"
              />
            </div>
          </div>

          {/* Target Margin Slider */}
          <div className="bg-[#faf9f7] p-3 rounded-xl border border-[#efeeec]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[#1a1c1b]">Target Factory Margin</span>
              <span className="text-sm font-bold text-[#006c4a]">{targetMarginPercent}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              value={targetMarginPercent}
              onChange={e => setTargetMarginPercent(Number(e.target.value))}
              className="w-full accent-[#006c4a] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#45464d] mt-1">
              <span>Competitive (15%)</span>
              <span>Balanced (30-35%)</span>
              <span>High R&D (60%)</span>
            </div>
          </div>

          {/* Calculation Output Card */}
          <div className="p-3.5 rounded-xl bg-[#85f8c4]/20 border border-[#85f8c4] space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[#002114] font-medium">Recommended Unit Quote:</span>
              <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#002114]">
                ₹{recommendedUnitPrice.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-[#85f8c4]/60">
              <div>
                <span className="text-[#45464d] block">Unit Base Cost</span>
                <span className="font-bold text-[#1a1c1b]">₹{totalCostPerUnit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#45464d] block">Batch Margin</span>
                <span className="font-bold text-[#006c4a]">₹{batchGrossProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-[#45464d] block">Total Batch Rev</span>
                <span className="font-bold text-[#1a1c1b]">₹{totalBatchRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#efeeec] flex items-center justify-end gap-2 bg-white">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b]"
          >
            Close
          </button>
          {onApplyPrice && (
            <button
              onClick={() => {
                onApplyPrice(Number(recommendedUnitPrice.toFixed(2)));
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#005137]"
            >
              Use ₹{recommendedUnitPrice.toFixed(2)} in Quote
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
