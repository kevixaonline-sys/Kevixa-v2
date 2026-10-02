import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';
import { RFQUrgency } from '../types';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRFQCreated?: () => void;
}

export const CreateRFQModal: React.FC<CreateRFQModalProps> = ({
  isOpen,
  onClose,
  onRFQCreated,
}) => {
  const { currentUser } = useAuth();

  const [productName, setProductName] = useState('15% Vitamin C + Ferulic Glow Serum (30ml)');
  const [quantity, setQuantity] = useState<number>(10000);
  const [formulationType, setFormulationType] = useState('Semi-Custom Formulation');
  const [packageType, setPackageType] = useState('Amber Glass + Pipette');
  const [targetUnitPrice, setTargetUnitPrice] = useState<number>(38.0);
  const [targetLeadTime, setTargetLeadTime] = useState('2 Weeks');
  const [urgency, setUrgency] = useState<RFQUrgency>('rush');
  const [brandTag, setBrandTag] = useState('Verified Brand');
  const [notes, setNotes] = useState('Requires stabilized L-ascorbic acid or Ethyl Ascorbic Acid base. Must meet ISO 22716 cleanroom standards.');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([
    'Semi-Custom Formulation',
    'Amber Glass + Pipette',
    'ISO 22716 Base',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalEstimate = quantity * targetUnitPrice;

  const handleToggleCert = (cert: string) => {
    if (selectedCerts.includes(cert)) {
      setSelectedCerts(selectedCerts.filter(c => c !== cert));
    } else {
      setSelectedCerts([...selectedCerts, cert]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const brandName = currentUser?.companyName || 'Nyra Skin Labs';
      const brandLocation = currentUser?.location || 'Bengaluru, KA';

      await rfqDb.addRFQ({
        brandId: currentUser?.uid || 'brand-nyra',
        brandName,
        brandLocation,
        brandTag,
        urgency,
        productName,
        quantity: Number(quantity),
        packageType,
        formulationType,
        certifications: selectedCerts.length > 0 ? selectedCerts : [formulationType, packageType],
        targetUnitPrice: Number(targetUnitPrice),
        estimatedTotal: totalEstimate,
        targetLeadTime,
        leadTimeBadgeNote: urgency === 'rush' ? 'Ready base needed' : 'Standard run',
        notes,
      });

      // Launch confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#006c4a', '#85f8c4', '#131b2e'],
        });
      } catch {
        // ignore
      }

      if (onRFQCreated) {
        onRFQCreated();
      }
      onClose();
    } catch (err) {
      console.error('Error posting RFQ:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">post_add</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Post Formulation RFQ
              </h3>
              <p className="text-[11px] text-[#006c4a] font-semibold">
                Phase 1 Free Matching · Broadcast to CDSCO-certified factories
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

        {/* Phase 1 Free RFQ Tag */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-[#85f8c4]/20 border border-[#85f8c4] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-[#006c4a] text-lg">lock_open</span>
            <div>
              <p className="font-bold text-[#002114]">Free RFQ Creation & Matching (Phase 1)</p>
              <p className="text-[11px] text-[#005137]">₹0 Matching Fee · Direct factory quotes delivered without intermediary cuts.</p>
            </div>
          </div>
          <span className="bg-[#006c4a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
            100% Free
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Brand Identity Recap */}
          <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e9e8e6] flex items-center justify-center font-bold text-xs">
                {currentUser?.companyName?.slice(0, 2).toUpperCase() || 'NS'}
              </div>
              <div>
                <p className="font-bold text-[#1a1c1b]">
                  {currentUser?.companyName || 'Nyra Skin Labs'}
                </p>
                <p className="text-[10px] text-[#45464d]">
                  {currentUser?.location || 'Bengaluru, KA'}
                </p>
              </div>
            </div>
            <select
              value={brandTag}
              onChange={e => setBrandTag(e.target.value)}
              className="h-7 px-2 bg-white rounded-lg border border-[#c6c6cd] text-[10px] font-semibold text-[#006c4a]"
            >
              <option value="Verified Brand">Verified Brand</option>
              <option value="Ayush License">Ayush License</option>
              <option value="D2C Series A">D2C Series A</option>
              <option value="Clean Clinical">Clean Clinical</option>
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">
              Formulation / Product Title *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs font-semibold"
              placeholder="e.g. 10% Niacinamide + Zinc Serum (30ml)"
            />
          </div>

          {/* Quantity & Unit Target Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Batch Run Quantity (Units) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-bold text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                Target Unit Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[#45464d] font-bold">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={targetUnitPrice}
                  onChange={e => setTargetUnitPrice(Number(e.target.value))}
                  className="w-full h-9 pl-7 pr-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Calculated Total Estimate Banner */}
          <div className="p-2.5 rounded-xl bg-[#85f8c4]/25 border border-[#85f8c4] flex justify-between items-center">
            <span className="text-[11px] text-[#002114] font-medium">Est. Contract Budget:</span>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#002114]">
              ₹{totalEstimate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Formulation Type & Packaging Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Formulation Type</label>
              <select
                value={formulationType}
                onChange={e => setFormulationType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs bg-white"
              >
                <option value="Semi-Custom Formulation">Semi-Custom Formulation</option>
                <option value="Full Custom R&D">Full Custom R&D</option>
                <option value="100% Organic Ayush">100% Organic Ayush</option>
                <option value="Ready Base Contract">Ready Base Contract</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Packaging Format</label>
              <select
                value={packageType}
                onChange={e => setPackageType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs bg-white"
              >
                <option value="Amber Glass + Pipette">Amber Glass + Pipette</option>
                <option value="Airless Acrylic Jar">Airless Acrylic Jar</option>
                <option value="Matte Aluminum Tin">Matte Aluminum Tin</option>
                <option value="Frosted Glass Dropper">Frosted Glass Dropper</option>
                <option value="Laminated Tube">Laminated Tube</option>
                <option value="Foamer Pump Bottle">Foamer Pump Bottle</option>
              </select>
            </div>
          </div>

          {/* Urgency & Lead Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Timeline Urgency</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setUrgency('rush');
                    setTargetLeadTime('2 Weeks');
                  }}
                  className={`py-1.5 rounded-lg font-semibold text-[10px] text-center transition-all ${
                    urgency === 'rush'
                      ? 'bg-[#ffd9dd] text-[#3a0915] border border-[#ffb2bc]'
                      : 'bg-[#efeeec] text-[#45464d]'
                  }`}
                >
                  Rush (2w)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrgency('standard');
                    setTargetLeadTime('3 Weeks');
                  }}
                  className={`py-1.5 rounded-lg font-semibold text-[10px] text-center transition-all ${
                    urgency === 'standard'
                      ? 'bg-[#000000] text-white'
                      : 'bg-[#efeeec] text-[#45464d]'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrgency('high_volume');
                    setTargetLeadTime('4 Weeks');
                  }}
                  className={`py-1.5 rounded-lg font-semibold text-[10px] text-center transition-all ${
                    urgency === 'high_volume'
                      ? 'bg-[#3a0915] text-[#ffd9dd]'
                      : 'bg-[#efeeec] text-[#45464d]'
                  }`}
                >
                  High Vol
                </button>
              </div>
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Target Lead Time</label>
              <input
                type="text"
                value={targetLeadTime}
                onChange={e => setTargetLeadTime(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
                placeholder="e.g. 2 Weeks"
              />
            </div>
          </div>

          {/* Compliance & Spec Badges */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1.5">
              Compliance & Specification Badges
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Semi-Custom Formulation',
                'Amber Glass + Pipette',
                'ISO 22716 Base',
                'CDSCO COS-8',
                '100% Organic Ayush',
                'Cruelty Free',
                'Airless Acrylic Jar',
                'Full Custom R&D',
                '5-Ceramide Matrix',
              ].map(badge => {
                const isSelected = selectedCerts.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => handleToggleCert(badge)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#006c4a] text-white font-semibold'
                        : 'bg-[#efeeec] text-[#45464d] hover:bg-[#e3e2e0]'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">
              Formulation Specifications & Texture Benchmark
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
              placeholder="e.g. Viscosity target, key active extracts, stability expectations..."
            />
          </div>

          {/* Email Notification Dispatch Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#45464d] bg-[#faf9f7] p-2 rounded-lg border border-[#efeeec]">
            <span className="material-symbols-outlined text-[15px] text-[#006c4a]">forward_to_inbox</span>
            <span>Automated email alerts will be dispatched to CDSCO cleanroom manufacturers based on active notification preferences.</span>
          </div>

          {/* Footer CTAs */}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005137] active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">publish</span>
              <span>{isSubmitting ? 'Posting RFQ...' : 'Publish to CDSCO Factories'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
