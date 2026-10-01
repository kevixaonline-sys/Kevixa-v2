import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

interface FactoryOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FactoryOnboardingModal: React.FC<FactoryOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, completeFactoryOnboarding } = useAuth();

  const [companyName, setCompanyName] = useState(
    currentUser?.companyName && currentUser.role === 'factory' ? currentUser.companyName : 'Himalayan Formulations Pvt Ltd'
  );
  const [location, setLocation] = useState('Baddi, Himachal Pradesh');
  const [customLocation, setCustomLocation] = useState('');
  const [moq, setMoq] = useState<number>(2500);
  const [cdscoLicense, setCdscoLicense] = useState('COS-HP/2024/9482');
  const [cdscoValidity, setCdscoValidity] = useState('Oct 2028 (Active)');
  const [contactName, setContactName] = useState(currentUser?.displayName || 'Rajesh Varma (Technical Director)');
  const [email, setEmail] = useState(currentUser?.email || 'regulatory@himalayanformulations.in');
  
  // File upload state
  const [fileName, setFileName] = useState('Form_COS-8_Official_License.pdf');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [isUploaded, setIsUploaded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setIsUploaded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalLocation = location === 'Custom' ? customLocation : location;

      await completeFactoryOnboarding({
        companyName,
        location: finalLocation,
        minOrderQuantity: Number(moq),
        cdscoLicense,
        cdscoValidity,
        cdscoLicenseFileName: fileName,
        contactName,
        email,
        specializations: ['Active Serums', 'Ceramide Creams', 'ISO 22716 Cleanroom'],
      });

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

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to complete factory onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#85f8c4]/40 text-[#006c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">factory</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Free Factory Onboarding & Licensing
              </h3>
              <p className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
                <span>Phase 1 Rollout · 100% Free · Auto CDSCO Verified Badge</span>
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

        {/* Phase 1 Free Tier Banner */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-[#85f8c4]/20 border border-[#85f8c4] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#006c4a] text-xl mt-0.5">verified_user</span>
          <div className="text-xs">
            <p className="font-bold text-[#002114]">Phase 1 Free Onboarding Benefits</p>
            <p className="text-[#005137] text-[11px] mt-0.5 leading-snug">
              Register your manufacturing premises with zero platform fees. Verified profiles automatically receive the <strong>CDSCO Verified</strong> partner badge and direct access to inbound brand formulation RFQs.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Company Name */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">
              Manufacturing Facility Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs font-semibold"
              placeholder="e.g. Himalayan Formulations Pvt Ltd"
            />
          </div>

          {/* Location Hub Presets */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">
              Manufacturing Location / Hub *
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-1.5">
              {[
                'Baddi, Himachal Pradesh',
                'Thane, Maharashtra',
                'Gujarat (Ahmedabad/Vadodara)',
                'Pune, Maharashtra',
                'Haridwar, Uttarakhand',
                'Custom',
              ].map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold text-center transition-all truncate ${
                    location === loc
                      ? 'bg-[#000000] text-white'
                      : 'bg-[#efeeec] text-[#45464d] hover:bg-[#e3e2e0]'
                  }`}
                >
                  {loc.split(',')[0]}
                </button>
              ))}
            </div>
            {location === 'Custom' && (
              <input
                type="text"
                required
                value={customLocation}
                onChange={e => setCustomLocation(e.target.value)}
                placeholder="Enter city and state (e.g. Hyderabad, Telangana)"
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
              />
            )}
          </div>

          {/* Minimum Order Quantity (MOQ) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#1a1c1b]">
                Minimum Order Quantity (Base MOQ) *
              </label>
              <span className="text-[11px] font-bold text-[#006c4a]">
                {moq.toLocaleString()} units
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1000, 2500, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMoq(val)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    moq === val
                      ? 'bg-[#006c4a] text-white shadow-sm'
                      : 'bg-[#efeeec] text-[#45464d] hover:bg-[#e3e2e0]'
                  }`}
                >
                  {val.toLocaleString()} u
                </button>
              ))}
            </div>
          </div>

          {/* CDSCO COS-8 License Details */}
          <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1a1c1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#006c4a]">badge</span>
                CDSCO COS-8 Manufacturing License
              </span>
              <span className="bg-[#85f8c4] text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded">
                Rule 129A
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-[#45464d] block mb-0.5">
                  License Number *
                </label>
                <input
                  type="text"
                  required
                  value={cdscoLicense}
                  onChange={e => setCdscoLicense(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-[#c6c6cd] font-mono text-xs font-bold"
                  placeholder="COS-HP/2024/..."
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#45464d] block mb-0.5">
                  Audit Validity *
                </label>
                <input
                  type="text"
                  required
                  value={cdscoValidity}
                  onChange={e => setCdscoValidity(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold"
                  placeholder="Oct 2028 (Active)"
                />
              </div>
            </div>

            {/* License File Upload Box */}
            <div>
              <label className="text-[10px] font-semibold text-[#45464d] block mb-1">
                Upload CDSCO COS-8 License Certificate (PDF or Image) *
              </label>
              
              <div className="border-2 border-dashed border-[#c6c6cd] hover:border-[#006c4a] rounded-xl p-3 bg-white text-center cursor-pointer relative group transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {isUploaded ? (
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#85f8c4]/30 text-[#006c4a] flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">description</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#1a1c1b] truncate max-w-[200px]">{fileName}</p>
                        <p className="text-[10px] text-[#45464d]">{fileSize} · Ready for Verification</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#006c4a] bg-[#85f8c4]/40 px-2 py-0.5 rounded flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">check</span>
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    <span className="material-symbols-outlined text-2xl text-[#76777d]">upload_file</span>
                    <p className="text-xs font-semibold text-[#1a1c1b] mt-1">Click or drag & drop Form COS-8 certificate</p>
                    <p className="text-[10px] text-[#76777d]">PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Contact Officer Name</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-[#c6c6cd] text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-[#c6c6cd] text-xs"
              />
            </div>
          </div>

          {/* Immediate badge reward badge */}
          <div className="p-2.5 rounded-xl bg-[#faf9f7] border border-[#efeeec] flex items-center justify-between">
            <span className="text-[11px] text-[#45464d]">Badge granted upon registration:</span>
            <span className="bg-[#85f8c4] text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-xs">verified</span>
              CDSCO Verified Partner
            </span>
          </div>

          {/* Submit */}
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
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{isSubmitting ? 'Registering...' : 'Register Factory for Free (Phase 1)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
