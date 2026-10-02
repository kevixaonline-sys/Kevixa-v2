import React, { useState } from 'react';
import { RFQItem } from '../types';

interface ProFormaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRFQ?: RFQItem | null;
}

export const ProFormaModal: React.FC<ProFormaModalProps> = ({ isOpen, onClose, selectedRFQ }) => {
  const [invoiceNumber] = useState(`PI-AURA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ratePerUnit, setRatePerUnit] = useState<number>(selectedRFQ?.targetUnitPrice || 35.0);
  const units = selectedRFQ?.quantity || 10000;
  const subtotal = ratePerUnit * units;
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#efeeec] flex items-center justify-center text-[#1a1c1b]">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Pro-Forma Quotation & Invoice
              </h3>
              <p className="text-[11px] text-[#45464d]">{invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] flex items-center justify-center text-[#45464d]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
            <div>
              <span className="text-[10px] text-[#45464d] uppercase font-bold">Issuer (Factory)</span>
              <p className="font-bold text-[#1a1c1b]">Aura Formulations Pvt Ltd</p>
              <p className="text-[#45464d]">Plot 14-B Industrial Area, Baddi, HP</p>
              <p className="font-mono text-[10px] text-[#006c4a] font-semibold">GSTIN: 02AAACA5892K1Z9</p>
            </div>
            <div>
              <span className="text-[10px] text-[#45464d] uppercase font-bold">Client (Brand)</span>
              <p className="font-bold text-[#1a1c1b]">{selectedRFQ?.brandName || 'Nyra Skin Labs'}</p>
              <p className="text-[#45464d]">{selectedRFQ?.brandLocation || 'Bengaluru, KA'}</p>
              <p className="text-[10px] text-[#45464d]">RFQ Ref: {selectedRFQ?.id || 'RFQ-2026-01'}</p>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="flex items-center justify-between p-3 bg-[#f4f3f1] rounded-xl">
            <div>
              <span className="font-semibold text-[#1a1c1b]">Quoted Unit Rate:</span>
              <p className="text-[11px] text-[#45464d]">Ex-factory Baddi warehouse</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.5"
                value={ratePerUnit}
                onChange={e => setRatePerUnit(Number(e.target.value))}
                className="w-24 h-8 px-2 rounded-lg border border-[#c6c6cd] font-bold text-sm text-[#1a1c1b]"
              />
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-[#e9e8e6] rounded-xl overflow-hidden">
            <div className="bg-[#efeeec] px-3 py-2 font-bold text-[11px] grid grid-cols-12 text-[#1a1c1b]">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="p-3 grid grid-cols-12 text-[#1a1c1b] border-b border-[#efeeec] items-center">
              <div className="col-span-6">
                <p className="font-semibold">{selectedRFQ?.productName || '10% Niacinamide + Zinc Serum (30ml)'}</p>
                <p className="text-[10px] text-[#45464d]">HSN: 33049910 · Primary Amber Bottle + Dropper</p>
              </div>
              <span className="col-span-2 text-right font-mono">{units.toLocaleString()}</span>
              <span className="col-span-2 text-right font-mono">₹{ratePerUnit.toFixed(2)}</span>
              <span className="col-span-2 text-right font-mono font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 bg-[#faf9f7] p-3 rounded-xl border border-[#efeeec]">
            <div className="flex justify-between">
              <span className="text-[#45464d]">Taxable Value</span>
              <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#45464d]">Integrated GST (18%)</span>
              <span className="font-mono font-medium">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#c6c6cd] font-bold text-sm text-[#1a1c1b]">
              <span>Final Invoice Amount</span>
              <span className="font-['Plus_Jakarta_Sans'] text-base text-[#006c4a]">
                ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#45464d] leading-relaxed">
            * Payment terms: 50% advance against purchase order, 50% prior to dispatch post COA release. Delivery Ex-works Baddi, Himachal Pradesh.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#efeeec] flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#1a1c1b]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              window.print?.();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#005137]"
          >
            Download / Print Pro-Forma
          </button>
        </div>
      </div>
    </div>
  );
};
