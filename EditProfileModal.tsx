import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { rfqDb } from '../services/rfqDb';
import { FactoryAddress, EmailNotificationPreferences } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOGOS = [
  {
    name: 'Aura Cleanroom',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1UvmKFys7v_YGw2g4BRhQ1k31R6ZXL_Bsd9aqVhrWAQS8CrgCtbTomH-aJ-uGInjqPZq5esyCRT3M-hz2a0kRHA1WDDcjjkLccTMmUYEKdMPrShJQE-JzMVrnf-sT5tkJyKNKxuYgStC9MWIVLgVri6AO0VSPOPZQUHQ-0fHX1-M9S6S6PhuGasKSApoQUvfaEpj3VdVlqxLXhjL30pht3uc3CCabJqT3p_E6v_Fmz43kDC73miM_AptGE',
  },
  {
    name: 'Biotech Derma',
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Botanical Herbal',
    url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cosmeceuticals GMP',
    url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Color Lab Velvet',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, userRole } = useAuth();
  const { theme, isDarkMode, setTheme, toggleDarkMode } = useTheme();

  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Address
  const [streetPlot, setStreetPlot] = useState('');
  const [industrialArea, setIndustrialArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Email Notification Preferences
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [newRfqAlerts, setNewRfqAlerts] = useState(true);
  const [quoteUpdateAlerts, setQuoteUpdateAlerts] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationFrequency, setNotificationFrequency] = useState<'immediate' | 'daily_digest'>('immediate');
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);
  const [testAlertSentMessage, setTestAlertSentMessage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Populate initial state from currentUser or factory listing in rfqDb
  useEffect(() => {
    if (isOpen) {
      const targetFactory = rfqDb.getFactoryById(currentUser?.uid || 'factory-aura') || rfqDb.getFactories()[0];
      setCompanyName(currentUser?.companyName || targetFactory?.name || 'Aura Formulations Pvt Ltd');
      setTagline(
        currentUser?.tagline ||
          targetFactory?.tagline ||
          'Premier CDSCO Class 100,000 Cleanroom Manufacturer for High-Performance Active Serums & Creams'
      );
      setAvatarUrl(currentUser?.avatarUrl || targetFactory?.logoUrl || PRESET_LOGOS[0].url);
      setContactPerson(currentUser?.contactPerson || targetFactory?.contactPerson || currentUser?.displayName || 'Rajesh Varma (VP Technical Operations)');
      setPhone(currentUser?.phone || targetFactory?.phone || '+91 98160 44210');
      const baseEmail = currentUser?.email || targetFactory?.email || 'qa@auraformulations.in';
      setEmail(baseEmail);
      setWhatsapp(currentUser?.whatsapp || targetFactory?.whatsapp || '+91 98160 44210');

      // Address fields
      setStreetPlot(currentUser?.address?.streetPlot || targetFactory?.address?.streetPlot || 'Plot No. 42-B, Phase III');
      setIndustrialArea(currentUser?.address?.industrialArea || targetFactory?.address?.industrialArea || 'Baddi Industrial Area, Solan District');
      setCity(currentUser?.address?.city || targetFactory?.address?.city || 'Baddi');
      setState(currentUser?.address?.state || targetFactory?.address?.state || 'Himachal Pradesh');
      setPincode(currentUser?.address?.pincode || targetFactory?.address?.pincode || '173205');

      // Email Notification Preferences
      const notifPrefs = currentUser?.emailNotifications || targetFactory?.emailNotifications;
      setEmailNotificationsEnabled(notifPrefs ? notifPrefs.enabled : true);
      setNewRfqAlerts(notifPrefs ? notifPrefs.newRfqAlerts : true);
      setQuoteUpdateAlerts(notifPrefs ? notifPrefs.quoteUpdateAlerts : true);
      setNotificationEmail(notifPrefs?.notificationEmail || baseEmail);
      setNotificationFrequency(notifPrefs?.frequency || 'immediate');
      setTestAlertSentMessage(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSendTestAlert = () => {
    setIsSendingTestAlert(true);
    setTestAlertSentMessage(null);
    setTimeout(() => {
      setIsSendingTestAlert(false);
      const recipient = notificationEmail.trim() || email.trim() || currentUser?.email || 'your email';
      setTestAlertSentMessage(`Test alert successfully simulated! Dispatched to ${recipient}.`);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formattedAddress: FactoryAddress = {
      streetPlot: streetPlot.trim(),
      industrialArea: industrialArea.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    const locationString = city.trim() && state.trim() ? `${city.trim()}, ${state.trim()}` : city.trim() || state.trim() || currentUser?.location || 'Baddi, HP';

    const emailNotifications: EmailNotificationPreferences = {
      enabled: emailNotificationsEnabled,
      newRfqAlerts: newRfqAlerts,
      quoteUpdateAlerts: quoteUpdateAlerts,
      notificationEmail: notificationEmail.trim() || email.trim() || currentUser?.email || '',
      frequency: notificationFrequency,
    };

    // 1. Update AuthContext profile
    await updateUserProfile({
      companyName: companyName.trim(),
      tagline: tagline.trim(),
      avatarUrl: avatarUrl.trim(),
      displayName: contactPerson.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      location: locationString,
      address: formattedAddress,
      emailNotifications,
      themePreference: theme,
    });

    // 2. Update local factory listing in rfqDb so it reflects on public factory cards viewed by D2C brands
    rfqDb.updateFactoryListing(currentUser?.uid || 'factory-aura', {
      name: companyName.trim(),
      tagline: tagline.trim(),
      logoUrl: avatarUrl.trim(),
      location: locationString,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      address: formattedAddress,
      emailNotifications,
    });

    setIsSaving(false);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#e3e2e0] flex flex-col overflow-hidden text-[#1a1c1b]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#faf9f7] border-b border-[#efeeec] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">domain_verification</span>
            </div>
            <div>
              <h2 id="edit-profile-title" className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                Factory Settings & Edit Profile
              </h2>
              <p className="text-xs text-[#45464d]">
                Update cleanroom credentials, branding, contact details & facility address.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#45464d] hover:text-[#1a1c1b] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bg-[#006c4a] text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-1.5 shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Factory profile & public listing updated successfully!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Factory Identity & Logo */}
          <div className="space-y-3.5 bg-[#faf9f7] p-4 rounded-xl border border-[#efeeec]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">business</span>
              Factory Identity & Branding
            </span>

            {/* Profile Picture / Logo Selector */}
            <div>
              <label className="text-xs font-bold text-[#1a1c1b] block mb-1.5">
                Factory Profile Picture / Logo
              </label>

              <div className="flex items-center gap-3.5 mb-2.5">
                <img
                  alt="Factory Logo Preview"
                  src={avatarUrl || PRESET_LOGOS[0].url}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#006c4a]/30 shadow-xs bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_LOGOS[0].url;
                  }}
                />
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] font-semibold text-[#45464d] block">
                    Upload or specify custom Logo URL:
                  </span>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>

              {/* Preset Avatar Selector Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-[#76777d] font-semibold block">
                  Or select preset cleanroom icon:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-md border flex items-center gap-1 font-semibold transition-all cursor-pointer ${
                        avatarUrl === preset.url
                          ? 'bg-[#006c4a] text-white border-[#006c4a]'
                          : 'bg-white hover:bg-[#efeeec] text-[#45464d] border-[#d2d1cf]'
                      }`}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Factory Name */}
            <div>
              <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                Factory Legal / Trade Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Aura Formulations Pvt Ltd"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none font-semibold"
              />
            </div>

            {/* Business Tagline */}
            <div>
              <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                Business Tagline & Cleanroom Specialization
              </label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Premier CDSCO Class 100,000 Cleanroom Manufacturer for High-Performance Active Serums & Creams"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3.5 bg-[#faf9f7] p-4 rounded-xl border border-[#efeeec]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">contact_phone</span>
              Official B2B Contact Details
            </span>
            <p className="text-[11px] text-[#45464d]">
              These verified direct contact details are shared with D2C brands submitting RFQs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                  Contact Person Name & Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Rajesh Varma (VP Technical Operations)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                  Official Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98160 44210"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="qa@auraformulations.in"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a1c1b] block mb-1 flex items-center gap-1">
                  <span>Direct WhatsApp Number</span>
                  <span className="text-[10px] text-[#006c4a] font-normal">(Instant formulation chat)</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98160 44210"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Complete Factory Address */}
          <div className="space-y-3.5 bg-[#faf9f7] p-4 rounded-xl border border-[#efeeec]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              Complete Manufacturing Plant Address
            </span>
            <p className="text-[11px] text-[#45464d]">
              Audited facility address shown on public factory profile cards for CDSCO compliance.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    Street / Plot No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={streetPlot}
                    onChange={(e) => setStreetPlot(e.target.value)}
                    placeholder="e.g. Plot No. 42-B, Phase III"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    Industrial Area / Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={industrialArea}
                    onChange={(e) => setIndustrialArea(e.target.value)}
                    placeholder="e.g. Baddi Industrial Area, Solan District"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Baddi"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Himachal Pradesh"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="173205"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Email Notification Preferences */}
          <div className="space-y-4 bg-[#faf9f7] p-4 rounded-xl border border-[#efeeec]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">forward_to_inbox</span>
                Email Notification Preferences
              </span>

              {/* Master Status Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                  emailNotificationsEnabled
                    ? 'bg-[#85f8c4] text-[#002114]'
                    : 'bg-[#efeeec] text-[#76777d]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    emailNotificationsEnabled ? 'bg-[#006c4a]' : 'bg-[#76777d]'
                  }`}
                />
                {emailNotificationsEnabled ? 'Alerts Active' : 'Alerts Disabled'}
              </span>
            </div>

            <p className="text-[11px] text-[#45464d]">
              Stay informed with real-time email dispatches for critical RFQ milestones, customer inquiries, and commercial quote updates.
            </p>

            {/* Master Toggle Card */}
            <div className="bg-white p-3 rounded-xl border border-[#e3e2e0] flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#1a1c1b] block">
                  Enable Email Notifications
                </span>
                <p className="text-[11px] text-[#45464d]">
                  Master switch to receive or pause automated email alerts from the Kevixa platform.
                </p>
              </div>

              {/* Master Switch Button */}
              <button
                type="button"
                role="switch"
                aria-checked={emailNotificationsEnabled}
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006c4a] focus:ring-offset-2 ${
                  emailNotificationsEnabled ? 'bg-[#006c4a]' : 'bg-[#d2d1cf]'
                }`}
              >
                <span className="sr-only">Toggle all email notifications</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    emailNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Granular Notification Toggles (New RFQs & Quote Updates) */}
            <div className={`space-y-2.5 transition-opacity ${emailNotificationsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <span className="text-[11px] font-bold text-[#1a1c1b] uppercase tracking-wide block">
                Alert Event Triggers
              </span>

              {/* Toggle 1: New RFQ Submissions */}
              <div className="bg-white p-3 rounded-xl border border-[#e3e2e0] flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">assignment_add</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1a1c1b]">
                        New RFQ Submissions
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${newRfqAlerts && emailNotificationsEnabled ? 'bg-[#85f8c4]/40 text-[#006c4a]' : 'bg-[#efeeec] text-[#76777d]'}`}>
                        {newRfqAlerts && emailNotificationsEnabled ? 'Enabled' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#45464d] mt-0.5">
                      {userRole === 'factory'
                        ? 'Instant alerts when D2C beauty brands publish new formulation RFQs matching your cleanroom facility.'
                        : 'Alerts when your team submits new RFQ requirements or distributes batches to CDSCO factories.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={newRfqAlerts}
                  onClick={() => setNewRfqAlerts(!newRfqAlerts)}
                  disabled={!emailNotificationsEnabled}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    newRfqAlerts && emailNotificationsEnabled ? 'bg-[#006c4a]' : 'bg-[#d2d1cf]'
                  }`}
                >
                  <span className="sr-only">Toggle new RFQ alerts</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      newRfqAlerts && emailNotificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Quote Updates & Pricing Revisions */}
              <div className="bg-white p-3 rounded-xl border border-[#e3e2e0] flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1a1c1b]">
                        Quote Updates & Pricing Revisions
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${quoteUpdateAlerts && emailNotificationsEnabled ? 'bg-[#85f8c4]/40 text-[#006c4a]' : 'bg-[#efeeec] text-[#76777d]'}`}>
                        {quoteUpdateAlerts && emailNotificationsEnabled ? 'Enabled' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#45464d] mt-0.5">
                      {userRole === 'factory'
                        ? 'Alerts when brands review, counter-offer, or approve commercial manufacturing quotes and lead times.'
                        : 'Instant alerts when factories submit new unit pricing, revised delivery lead times, or milestone terms.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={quoteUpdateAlerts}
                  onClick={() => setQuoteUpdateAlerts(!quoteUpdateAlerts)}
                  disabled={!emailNotificationsEnabled}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    quoteUpdateAlerts && emailNotificationsEnabled ? 'bg-[#006c4a]' : 'bg-[#d2d1cf]'
                  }`}
                >
                  <span className="sr-only">Toggle quote updates alerts</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      quoteUpdateAlerts && emailNotificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Destination Email & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    Notification Dispatch Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#76777d]">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="e.g. alerts@company.com"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#76777d] mt-0.5 block">
                    Defaults to account email ({email || 'qa@auraformulations.in'})
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1a1c1b] block mb-1">
                    Dispatch Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#efeeec] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setNotificationFrequency('immediate')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        notificationFrequency === 'immediate'
                          ? 'bg-white text-[#006c4a] shadow-xs'
                          : 'text-[#45464d] hover:text-[#1a1c1b]'
                      }`}
                    >
                      Instant Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFrequency('daily_digest')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        notificationFrequency === 'daily_digest'
                          ? 'bg-white text-[#006c4a] shadow-xs'
                          : 'text-[#45464d] hover:text-[#1a1c1b]'
                      }`}
                    >
                      Daily Digest
                    </button>
                  </div>
                  <span className="text-[10px] text-[#76777d] mt-0.5 block">
                    {notificationFrequency === 'immediate' ? 'Delivered seconds after submission' : 'Compiled every morning at 09:00 AM IST'}
                  </span>
                </div>
              </div>

              {/* Test Alert Simulator Button & Banner */}
              <div className="pt-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-[#45464d]">
                    Want to test your notification pipeline?
                  </span>
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    disabled={isSendingTestAlert || !emailNotificationsEnabled}
                    className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] hover:border-[#006c4a] hover:bg-white text-xs font-bold text-[#1a1c1b] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">
                      {isSendingTestAlert ? 'hourglass_empty' : 'send'}
                    </span>
                    <span>{isSendingTestAlert ? 'Simulating Dispatch...' : 'Send Test Alert'}</span>
                  </button>
                </div>

                {testAlertSentMessage && (
                  <div className="mt-2 p-2 bg-[#85f8c4]/20 border border-[#85f8c4]/60 rounded-lg text-xs text-[#002114] flex items-center justify-between gap-2 animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
                        mark_email_read
                      </span>
                      <span>{testAlertSentMessage}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTestAlertSentMessage(null)}
                      className="text-[#76777d] hover:text-[#1a1c1b]"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Appearance & Dark Mode Theme Preferences */}
          <div className="space-y-4 bg-[#faf9f7] p-4 rounded-xl border border-[#efeeec]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">
                  {isDarkMode ? 'dark_mode' : 'light_mode'}
                </span>
                Appearance & Theme Preferences
              </span>

              {/* Live Theme Badge */}
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-[#85f8c4] text-[#002114]'
                    : 'bg-[#efeeec] text-[#45464d]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {isDarkMode ? 'dark_mode' : 'light_mode'}
                </span>
                <span>{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
              </span>
            </div>

            <p className="text-[11px] text-[#45464d]">
              Toggle Kevixa&apos;s workspace appearance to dark or light mode. Your preference is persisted across local user settings and automatically synced with your operator session.
            </p>

            {/* Quick Toggle Switch Card */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e3e2e0] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isDarkMode ? 'bg-[#85f8c4]/20 text-[#85f8c4]' : 'bg-[#006c4a]/10 text-[#006c4a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1a1c1b]">
                      Dark Mode Theme
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isDarkMode ? 'bg-[#85f8c4]/30 text-[#006c4a]' : 'bg-[#efeeec] text-[#76777d]'
                      }`}
                    >
                      {isDarkMode ? 'Enabled' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#45464d] mt-0.5">
                    {isDarkMode
                      ? 'Deep charcoal surfaces with high-contrast emerald highlights for low-light lab environments.'
                      : 'Warm, high-legibility daylight paper aesthetic with crisp editorial typography.'}
                  </p>
                </div>
              </div>

              {/* Master Dark Mode Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006c4a] ${
                  isDarkMode ? 'bg-[#006c4a]' : 'bg-[#d2d1cf]'
                }`}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3 Theme Options: Light, Dark, System Auto */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#1a1c1b] block uppercase tracking-wide">
                Visual Theme Selection
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white border-[#006c4a] text-[#006c4a] shadow-xs ring-1 ring-[#006c4a]'
                      : 'bg-white/60 border-[#efeeec] text-[#45464d] hover:bg-white hover:border-[#c6c6cd]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-500">
                    light_mode
                  </span>
                  <span className="text-[11px]">Light Mode</span>
                  <span className="text-[9px] font-normal text-[#76777d]">Daylight paper</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white border-[#006c4a] text-[#006c4a] shadow-xs ring-1 ring-[#006c4a]'
                      : 'bg-white/60 border-[#efeeec] text-[#45464d] hover:bg-white hover:border-[#c6c6cd]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-indigo-400">
                    dark_mode
                  </span>
                  <span className="text-[11px]">Dark Mode</span>
                  <span className="text-[9px] font-normal text-[#76777d]">Charcoal & OLED</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    theme === 'system'
                      ? 'bg-white border-[#006c4a] text-[#006c4a] shadow-xs ring-1 ring-[#006c4a]'
                      : 'bg-white/60 border-[#efeeec] text-[#45464d] hover:bg-white hover:border-[#c6c6cd]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">
                    devices
                  </span>
                  <span className="text-[11px]">System Auto</span>
                  <span className="text-[9px] font-normal text-[#76777d]">Match device OS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>{isSaving ? 'Saving...' : 'Save & Update Public Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
