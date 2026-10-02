import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { rfqDb } from '../services/rfqDb';
import { FooterLegalSection } from './FooterLegalSection';

interface ProfileViewProps {
  onOpenAuth: () => void;
  onOpenCertificate: () => void;
  onOpenFactoryOnboarding?: () => void;
  onOpenEditProfile?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAuth,
  onOpenCertificate,
  onOpenFactoryOnboarding,
  onOpenEditProfile,
}) => {
  const { currentUser, userRole, switchRole, signOut } = useAuth();
  const { theme, isDarkMode, toggleDarkMode } = useTheme();

  const handleResetDb = () => {
    if (confirm('Reset RFQ database to initial reference demo state?')) {
      rfqDb.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-2 pb-16 gap-4">
      {/* Profile Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#006c4a]/30 shadow-sm shrink-0 bg-white"
            src={
              currentUser?.avatarUrl ||
              'https://lh3.googleusercontent.com/aida/AEtjO1UvmKFys7v_YGw2g4BRhQ1k31R6ZXL_Bsd9aqVhrWAQS8CrgCtbTomH-aJ-uGInjqPZq5esyCRT3M-hz2a0kRHA1WDDcjjkLccTMmUYEKdMPrShJQE-JzMVrnf-sT5tkJyKNKxuYgStC9MWIVLgVri6AO0VSPOPZQUHQ-0fHX1-M9S6S6PhuGasKSApoQUvfaEpj3VdVlqxLXhjL30pht3uc3CCabJqT3p_E6v_Fmz43kDC73miM_AptGE'
            }
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#1a1c1b] truncate">
                {currentUser?.displayName || 'Rajesh Varma'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  userRole === 'factory'
                    ? 'bg-[#85f8c4] text-[#002114]'
                    : 'bg-[#ffd9dd] text-[#3a0915]'
                }`}
              >
                {userRole === 'factory' ? 'CDSCO Factory' : 'Beauty Brand'}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#45464d] truncate">
              {currentUser?.companyName || 'Aura Formulations'} · {currentUser?.location || 'Baddi, HP'}
            </p>
            <p className="text-[11px] text-[#76777d] truncate">{currentUser?.email || 'qa@auraformulations.in'}</p>
          </div>
        </div>

        {/* Settings / Edit Profile Button */}
        {onOpenEditProfile && (
          <button
            onClick={onOpenEditProfile}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-center shrink-0"
            title="Edit Profile, Contact Details & Address"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Role Switcher Widget */}
      <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#efeeec] space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
              Active Portal Mode
            </h3>
            <p className="text-xs text-[#45464d]">
              Toggle between Factory manufacturing view and Brand RFQ submission view
            </p>
          </div>
          <span className="text-xs font-bold text-[#006c4a] capitalize">{userRole} View</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchRole('factory')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
              userRole === 'factory'
                ? 'border-[#006c4a] bg-white shadow-sm ring-1 ring-[#006c4a]'
                : 'border-[#c6c6cd] bg-white/60 hover:bg-white text-[#45464d]'
            }`}
          >
            <span className="material-symbols-outlined text-[#006c4a]">factory</span>
            <span className="text-xs font-bold text-[#1a1c1b]">Factory Portal</span>
            <span className="text-[10px] text-[#45464d]">Aura Formulations (Baddi)</span>
          </button>

          <button
            onClick={() => switchRole('brand')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
              userRole === 'brand'
                ? 'border-[#006c4a] bg-white shadow-sm ring-1 ring-[#006c4a]'
                : 'border-[#c6c6cd] bg-white/60 hover:bg-white text-[#45464d]'
            }`}
          >
            <span className="material-symbols-outlined text-[#3a0915]">spa</span>
            <span className="text-xs font-bold text-[#1a1c1b]">Brand Portal</span>
            <span className="text-[10px] text-[#45464d]">Nyra Skin Labs (Bengaluru)</span>
          </button>
        </div>
      </div>

      {/* Factory Subscription Status & Monetization Architecture Card */}
      {userRole === 'factory' && (
        <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a]">loyalty</span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                  Platform Subscription Tier
                </h3>
                <p className="text-[11px] text-[#45464d]">Factory monetization rollout roadmap</p>
              </div>
            </div>
            <span className="bg-[#85f8c4] text-[#002114] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#006c4a] inline-block animate-pulse"></span>
              Subscription Status: Free Tier
            </span>
          </div>

          <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#45464d]">
              <span>Inbound RFQ Leads:</span>
              <span className="font-bold text-[#006c4a]">Unlimited Access (₹0 Fee)</span>
            </div>
            <div className="flex justify-between items-center text-[#45464d]">
              <span>Formal Quote Submission:</span>
              <span className="font-bold text-[#006c4a]">Free · 0% Commission</span>
            </div>
            <div className="flex justify-between items-center text-[#45464d]">
              <span>CDSCO Directory Verified Badge:</span>
              <span className="font-bold text-[#006c4a]">Active & Validated</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#efeeec] text-[#45464d]">
              <span>Phase 2 Monetization Architecture:</span>
              <span className="font-bold text-[#3a0915] bg-[#ffd9dd] px-2 py-0.5 rounded font-mono">
                Pay-Per-Lead (₹500 / lead)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#45464d]">Free Tier active across India.</span>
            {onOpenFactoryOnboarding && (
              <button
                onClick={onOpenFactoryOnboarding}
                className="text-xs text-[#006c4a] font-bold underline hover:text-[#005137]"
              >
                Update License & MOQ
              </button>
            )}
          </div>
        </div>
      )}

      {/* Factory Contact & Physical Facility Address Card (if factory role) */}
      {userRole === 'factory' && (
        <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a]">factory</span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                  Factory Facility & Contact Details
                </h3>
                <p className="text-[11px] text-[#45464d]">Public B2B directory information</p>
              </div>
            </div>
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="text-xs text-[#006c4a] font-bold underline hover:text-[#005137] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit Details</span>
              </button>
            )}
          </div>

          {currentUser?.tagline && (
            <p className="text-xs italic text-[#45464d] bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec]">
              &quot;{currentUser.tagline}&quot;
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec] space-y-0.5">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">Manufacturing Plant Address</span>
              <p className="font-semibold text-[#1a1c1b]">
                {currentUser?.address?.streetPlot || 'Plot No. 42-B, Phase III'}, {currentUser?.address?.industrialArea || 'Baddi Industrial Area'}
              </p>
              <p className="text-[#45464d]">
                {currentUser?.address?.city || 'Baddi'}, {currentUser?.address?.state || 'Himachal Pradesh'} - {currentUser?.address?.pincode || '173205'}
              </p>
            </div>

            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec] space-y-1">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">B2B Contact Channels</span>
              <p className="font-semibold text-[#1a1c1b]">
                {currentUser?.contactPerson || currentUser?.displayName || 'Rajesh Varma'}
              </p>
              <p className="text-[#45464d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#006c4a]">call</span>
                <span>{currentUser?.phone || '+91 98160 44210'}</span>
              </p>
              <p className="text-[#45464d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#006c4a]">chat</span>
                <span>WhatsApp: {currentUser?.whatsapp || '+91 98160 44210'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Factory Regulatory Credentials (if factory role) */}
      {userRole === 'factory' && (
        <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a]">verified</span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                  CDSCO License Credentials
                </h3>
                <span className="text-[10px] bg-[#85f8c4] text-[#002114] px-1.5 py-0.2 rounded font-bold uppercase">
                  CDSCO Verified
                </span>
              </div>
            </div>
            <button
              onClick={onOpenCertificate}
              className="text-xs text-[#006c4a] font-bold underline"
            >
              View Certificate
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec]">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">License No.</span>
              <span className="font-mono font-bold text-[#1a1c1b]">
                {currentUser?.cdscoLicense || 'COS-HP/2022/8492'}
              </span>
            </div>
            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec]">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">Audit Validity</span>
              <span className="font-semibold text-[#006c4a]">
                {currentUser?.cdscoValidity || 'Oct 2026 (Active)'}
              </span>
            </div>
            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec]">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">Factory Base MOQ</span>
              <span className="font-semibold text-[#1a1c1b]">
                {(currentUser?.minOrderQuantity || 2500).toLocaleString()} units
              </span>
            </div>
            <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec]">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">License Doc</span>
              <span className="font-semibold text-[#006c4a] truncate block">
                {currentUser?.cdscoLicenseFileName || 'COS-8_Validated.pdf'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Factory Public Performance & Audit Ratings Card (if factory role) */}
      {userRole === 'factory' && (
        <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                hotel_class
              </span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                  Public Ratings & Verified Audit Score
                </h3>
                <p className="text-[11px] text-[#45464d]">
                  Displayed publicly to D2C brands on your factory profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#faf9f7] px-2.5 py-1 rounded-lg border border-[#efeeec]">
              <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm text-[#1a1c1b] font-mono">
                {rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').overall.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#76777d]">
                ({rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').totalReviews} reviews)
              </span>
            </div>
          </div>

          {/* 3 Criteria Progress Bars */}
          <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2.5">
            <span className="text-[11px] font-bold text-[#1a1c1b] block uppercase tracking-wider">
              3 Audit Criteria Breakdown
            </span>

            {/* Communication */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#45464d] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-[#006c4a]">chat_bubble</span>
                  <span>Communication:</span>
                </span>
                <span className="font-bold text-[#1a1c1b] font-mono">
                  ★ {rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').communication.toFixed(1)} <span className="text-[10px] text-[#76777d]">/ 5.0</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e3e2e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006c4a] rounded-full"
                  style={{ width: `${(rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').communication / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Lead Time */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#45464d] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-[#006c4a]">schedule</span>
                  <span>Lead Time:</span>
                </span>
                <span className="font-bold text-[#1a1c1b] font-mono">
                  ★ {rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').leadTime.toFixed(1)} <span className="text-[10px] text-[#76777d]">/ 5.0</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e3e2e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006c4a] rounded-full"
                  style={{ width: `${(rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').leadTime / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#45464d] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-[#006c4a]">verified</span>
                  <span>Quality:</span>
                </span>
                <span className="font-bold text-[#1a1c1b] font-mono">
                  ★ {rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').quality.toFixed(1)} <span className="text-[10px] text-[#76777d]">/ 5.0</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e3e2e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006c4a] rounded-full"
                  style={{ width: `${(rfqDb.getFactoryRatingBreakdown(currentUser?.uid || 'factory-aura').quality / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Reviews Preview */}
          {rfqDb.getReviewsForFactory(currentUser?.uid || 'factory-aura').length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-[#1a1c1b] block">
                Recent Verified Brand Reviews ({rfqDb.getReviewsForFactory(currentUser?.uid || 'factory-aura').length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {rfqDb.getReviewsForFactory(currentUser?.uid || 'factory-aura').slice(0, 3).map(r => (
                  <div key={r.id} className="p-2.5 bg-[#faf9f7] rounded-lg border border-[#efeeec] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1a1c1b]">{r.brandName}</span>
                      <span className="font-mono text-[#006c4a] font-bold">★ {r.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-[#45464d] italic line-clamp-2">
                      &quot;{r.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Notification Preferences Card (Both Factory & Brand) */}
      <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                Email Notification Preferences
              </h3>
              <p className="text-[11px] text-[#45464d]">
                Automated alerts for new RFQs & quote updates
              </p>
            </div>
          </div>

          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="text-xs text-[#006c4a] font-bold underline hover:text-[#005137] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Configure</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* New RFQ Submissions Status */}
          <div className="p-2.5 rounded-lg bg-[#faf9f7] border border-[#efeeec] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">
                New RFQ Submissions
              </span>
              <span className="font-semibold text-[#1a1c1b]">
                {currentUser?.emailNotifications?.newRfqAlerts !== false ? 'Instant Alerts Active' : 'Alerts Disabled'}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                currentUser?.emailNotifications?.newRfqAlerts !== false && currentUser?.emailNotifications?.enabled !== false
                  ? 'bg-[#85f8c4] text-[#002114]'
                  : 'bg-[#efeeec] text-[#76777d]'
              }`}
            >
              {currentUser?.emailNotifications?.newRfqAlerts !== false && currentUser?.emailNotifications?.enabled !== false ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Quote Updates Status */}
          <div className="p-2.5 rounded-lg bg-[#faf9f7] border border-[#efeeec] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#45464d] block font-bold uppercase">
                Quote Updates & Pricing
              </span>
              <span className="font-semibold text-[#1a1c1b]">
                {currentUser?.emailNotifications?.quoteUpdateAlerts !== false ? 'Instant Alerts Active' : 'Alerts Disabled'}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                currentUser?.emailNotifications?.quoteUpdateAlerts !== false && currentUser?.emailNotifications?.enabled !== false
                  ? 'bg-[#85f8c4] text-[#002114]'
                  : 'bg-[#efeeec] text-[#76777d]'
              }`}
            >
              {currentUser?.emailNotifications?.quoteUpdateAlerts !== false && currentUser?.emailNotifications?.enabled !== false ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#faf9f7] border border-[#efeeec] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[15px] text-[#006c4a] shrink-0">
              alternate_email
            </span>
            <span className="text-[11px] text-[#45464d] truncate">
              Alerts dispatched to:{' '}
              <strong className="text-[#1a1c1b]">
                {currentUser?.emailNotifications?.notificationEmail || currentUser?.email || 'qa@auraformulations.in'}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-[#006c4a] font-bold uppercase tracking-wider shrink-0 bg-[#85f8c4]/30 px-2 py-0.5 rounded">
            {currentUser?.emailNotifications?.frequency === 'daily_digest' ? 'Daily Digest' : 'Real-Time'}
          </span>
        </div>
      </div>

      {/* Appearance & Dark Mode Theme Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-[#85f8c4]/20 text-[#85f8c4]' : 'bg-[#006c4a]/10 text-[#006c4a]'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
                Workspace Theme & Appearance
              </h3>
              <p className="text-[11px] text-[#45464d]">
                {isDarkMode ? 'Dark Mode Active (Charcoal & Emerald)' : 'Light Mode Active (Daylight Paper)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 px-3 rounded-lg border border-[#c6c6cd] hover:border-[#006c4a] text-xs font-bold text-[#1a1c1b] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle dark mode theme"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{isDarkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>

            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="text-xs text-[#006c4a] font-bold underline hover:text-[#005137] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>Configure</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#faf9f7] border border-[#efeeec] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#45464d]">
              Saved preference:{' '}
              <strong className="text-[#1a1c1b] capitalize">{theme} mode</strong>
            </span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isDarkMode ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#efeeec] text-[#45464d]'
          }`}>
            {isDarkMode ? 'OLED Charcoal' : 'Daylight Paper'}
          </span>
        </div>
      </div>

      {/* Account & Testing Actions */}
      <div className="p-4 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-2">
          Account Management
        </h3>

        <button
          onClick={onOpenAuth}
          className="w-full h-10 px-3 rounded-xl border border-[#c6c6cd] hover:border-[#006c4a] text-xs font-semibold text-[#1a1c1b] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Sign Up / Log In with Firebase</span>
          </span>
          <span className="material-symbols-outlined text-sm text-[#76777d]">chevron_right</span>
        </button>

        <button
          onClick={handleResetDb}
          className="w-full h-10 px-3 rounded-xl border border-[#c6c6cd] hover:bg-[#faf9f7] text-xs font-semibold text-[#45464d] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset Demo RFQ Database</span>
          </span>
          <span className="text-[10px] text-[#76777d]">Restore 12 RFQs</span>
        </button>

        <button
          onClick={signOut}
          className="w-full h-10 px-3 rounded-xl bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-xs font-bold text-[#93000a] flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

      {/* FAQ & Legal Policies Footer */}
      <FooterLegalSection sourceContext="profile" />

      <div className="text-center text-[11px] text-[#76777d] pt-2">
        Kevixa CDSCO B2B Platform · v2.4 · Powered by Firebase Authentication & Local Sync
      </div>
    </div>
  );
};
