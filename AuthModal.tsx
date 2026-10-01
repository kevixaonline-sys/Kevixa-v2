import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'brand',
}) => {
  const { signUp, signIn, demoLogin } = useAuth();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [role, setRole] = useState<UserRole>(defaultRole);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('Baddi, HP');
  const [cdscoLicense, setCdscoLicense] = useState('COS-HP/2024/9201');
  const [moq, setMoq] = useState<number>(2500);
  const [licenseFileName, setLicenseFileName] = useState('Form_COS-8_Official_License.pdf');
  const [categoryFocus, setCategoryFocus] = useState('Active Serums, Clean Beauty');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp({
          email,
          password,
          displayName: displayName || (role === 'factory' ? 'Factory Lead' : 'Brand Director'),
          role,
          companyName: companyName || (role === 'factory' ? 'Himalayan Formulations Ltd' : 'Aura Bloom Botanics'),
          location,
          cdscoLicense: role === 'factory' ? cdscoLicense : undefined,
          cdscoValidity: role === 'factory' ? 'Oct 2028 (Active)' : undefined,
          cdscoLicenseFileName: role === 'factory' ? licenseFileName : undefined,
          minOrderQuantity: role === 'factory' ? Number(moq) : undefined,
          categoryFocus: categoryFocus.split(',').map(s => s.trim()),
        });
        setSuccessMsg(`Welcome to Kevixa! Registered as ${role === 'factory' ? 'CDSCO Verified Factory Partner' : 'Verified Brand'}.`);
      } else {
        await signIn(email, password);
        setSuccessMsg('Successfully signed in!');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (demoRole: UserRole) => {
    demoLogin(demoRole);
    setSuccessMsg(`Switched to demo account: ${demoRole === 'factory' ? 'Aura Formulations (Factory)' : 'Nyra Skin Labs (Brand)'}`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#c6c6cd]/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#efeeec] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <img
              alt="Kevixa"
              className="h-7 w-auto object-contain"
              src="/favicon.svg"
            />
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                {mode === 'signup' ? 'Create Kevixa Account' : 'Welcome Back to Kevixa'}
              </h3>
              <p className="text-[11px] text-[#006c4a] font-semibold">
                CDSCO B2B Ecosystem · Firebase Authentication
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

        {/* Tab Toggle (Sign Up vs Sign In) */}
        <div className="px-4 pt-3">
          <div className="grid grid-cols-2 p-1 bg-[#efeeec] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#1a1c1b] shadow-sm'
                  : 'text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              Sign Up (Brand vs. Factory)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#1a1c1b] shadow-sm'
                  : 'text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Quick Demo Login Helpers */}
        <div className="p-4 pb-0">
          <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#45464d]">
              <span>Quick Test Access:</span>
              <span className="text-[10px] text-[#006c4a]">Instant Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('factory')}
                className="p-2 rounded-lg bg-white border border-[#c6c6cd] hover:border-[#006c4a] text-left transition-all hover:shadow-sm"
              >
                <span className="text-[10px] font-bold text-[#006c4a] uppercase block">Factory</span>
                <span className="text-xs font-bold text-[#1a1c1b] block truncate">Aura Formulations</span>
                <span className="text-[10px] text-[#45464d]">CDSCO Baddi, HP</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('brand')}
                className="p-2 rounded-lg bg-white border border-[#c6c6cd] hover:border-[#006c4a] text-left transition-all hover:shadow-sm"
              >
                <span className="text-[10px] font-bold text-[#3a0915] uppercase block">Brand</span>
                <span className="text-xs font-bold text-[#1a1c1b] block truncate">Nyra Skin Labs</span>
                <span className="text-[10px] text-[#45464d]">D2C Bengaluru, KA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-[#ffdad6] text-[#93000a] text-xs rounded-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-[#85f8c4]/40 text-[#002114] text-xs font-semibold rounded-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#006c4a]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1.5">
                Select Your Industry Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('brand')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    role === 'brand'
                      ? 'border-[#006c4a] bg-[#85f8c4]/20 text-[#002114] font-bold shadow-sm'
                      : 'border-[#c6c6cd] bg-white text-[#45464d] hover:bg-[#faf9f7]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-[#006c4a]">
                    spa
                  </span>
                  <span className="text-xs font-bold">Brand / D2C</span>
                  <span className="text-[10px] font-normal text-[#45464d]">
                    Seeking Manufacturing
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('factory')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    role === 'factory'
                      ? 'border-[#006c4a] bg-[#85f8c4]/20 text-[#002114] font-bold shadow-sm'
                      : 'border-[#c6c6cd] bg-white text-[#45464d] hover:bg-[#faf9f7]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-[#006c4a]">
                    factory
                  </span>
                  <span className="text-xs font-bold">Factory / Lab</span>
                  <span className="text-[10px] font-normal text-[#45464d]">
                    CDSCO License Holder
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Company Name */}
          {mode === 'signup' && (
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">
                {role === 'factory' ? 'Manufacturing Facility Name *' : 'Brand / Company Name *'}
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
                placeholder={role === 'factory' ? 'e.g. Himalayan Pharma & Formulations' : 'e.g. Nyra Skin Labs'}
              />
            </div>
          )}

          {/* Full Name */}
          {mode === 'signup' && (
            <div>
              <label className="font-semibold text-[#1a1c1b] block mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
                placeholder="e.g. Dr. Neha Sharma"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">Business Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
              placeholder="e.g. founder@company.in"
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-semibold text-[#1a1c1b] block mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Factory-specific: CDSCO License, Location Hub, MOQ, File Upload */}
          {mode === 'signup' && role === 'factory' && (
            <div className="space-y-2.5 p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a1c1b] flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-[#006c4a]">verified</span>
                  Free Factory Onboarding & Licensing (Phase 1)
                </span>
                <span className="bg-[#85f8c4] text-[#002114] text-[9px] font-bold px-1.5 py-0.2 rounded">
                  Auto Verified
                </span>
              </div>

              {/* Hub Presets */}
              <div>
                <label className="text-[10px] font-semibold text-[#45464d] block mb-1">
                  Manufacturing Hub *
                </label>
                <div className="flex flex-wrap gap-1">
                  {['Baddi, HP', 'Thane, Maharashtra', 'Gujarat (Ahmedabad)', 'Pune, MH'].map(hub => (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => setLocation(hub)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                        location === hub
                          ? 'bg-[#000000] text-white'
                          : 'bg-white border border-[#c6c6cd] text-[#45464d]'
                      }`}
                    >
                      {hub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#1a1c1b] block mb-0.5 text-[10px]">CDSCO License No. *</label>
                  <input
                    type="text"
                    required
                    value={cdscoLicense}
                    onChange={e => setCdscoLicense(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none font-mono text-xs font-bold"
                    placeholder="COS-HP/2024/..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1a1c1b] block mb-0.5 text-[10px]">Base MOQ *</label>
                  <select
                    value={moq}
                    onChange={e => setMoq(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-lg border border-[#c6c6cd] text-xs font-semibold bg-white"
                  >
                    <option value={1000}>1,000 units</option>
                    <option value={2500}>2,500 units</option>
                    <option value={5000}>5,000 units</option>
                    <option value={10000}>10,000 units</option>
                  </select>
                </div>
              </div>

              {/* License File Upload Preview */}
              <div>
                <label className="text-[10px] font-semibold text-[#45464d] block mb-1">
                  Upload CDSCO COS-8 Certificate *
                </label>
                <div className="border border-dashed border-[#c6c6cd] rounded-lg p-2 bg-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#006c4a]">description</span>
                    <span className="font-semibold text-[11px] text-[#1a1c1b] truncate max-w-[170px]">{licenseFileName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#006c4a] bg-[#85f8c4]/40 px-1.5 py-0.2 rounded">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Brand-specific: Location & Category */}
          {mode === 'signup' && role === 'brand' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-[#1a1c1b] block mb-1">City, State *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
                  placeholder="e.g. Bengaluru, KA"
                />
              </div>
              <div>
                <label className="font-semibold text-[#1a1c1b] block mb-1">Product Focus</label>
                <input
                  type="text"
                  value={categoryFocus}
                  onChange={e => setCategoryFocus(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] focus:border-[#006c4a] outline-none text-xs"
                  placeholder="Serums, Lip Care"
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#000000] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:bg-neutral-800 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                {mode === 'signup' ? 'person_add' : 'login'}
              </span>
              <span>
                {loading
                  ? 'Connecting to Firebase...'
                  : mode === 'signup'
                  ? `Create ${role === 'factory' ? 'Factory' : 'Brand'} Account`
                  : 'Sign In to Kevixa'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
