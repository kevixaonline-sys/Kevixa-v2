import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenNewRFQ?: () => void;
  onOpenFactoryOnboarding?: () => void;
  onOpenAIChat?: () => void;
  onOpenEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenNewRFQ,
  onOpenFactoryOnboarding,
  onOpenAIChat,
  onOpenEditProfile,
}) => {
  const { currentUser, userRole, switchRole } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf9f7]/90 backdrop-blur-xl border-b border-[#efeeec] shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between max-w-5xl mx-auto">
        {/* Left: Brand Identity with prominent Kevixa logo badge */}
        <div 
          onClick={() => onOpenProfile()}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Kevixa CDSCO B2B Network"
        >
          <img
            alt="Kevixa Logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            src="/favicon.svg"
          />
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] sm:text-[19px] text-[#1a1c1b] tracking-tight leading-none">
                Kevixa
              </span>
              <span className="font-['Inter'] text-[10px] text-[#006c4a] font-bold tracking-wider uppercase mt-0.5">
                CDSCO B2B
              </span>
            </div>
            
            {/* Prominent Kevixa CDSCO B2B Logo Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-[#006c4a] text-white tracking-wide shadow-2xs border border-[#85f8c4]/30">
              <span className="material-symbols-outlined text-[13px] text-[#85f8c4]">verified_user</span>
              <span>Kevixa CDSCO B2B</span>
            </span>
          </div>
        </div>

        {/* Right: Quick Role Switcher + New RFQ Button (if brand) + Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Quick toggle between Factory and Brand view */}
          <button
            onClick={() => switchRole(userRole === 'factory' ? 'brand' : 'factory')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] text-[#45464d] font-medium transition-colors"
            title="Switch between Factory view and Brand view"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006c4a]">
              {userRole === 'factory' ? 'store' : 'factory'}
            </span>
            <span>View as <strong className="text-[#1a1c1b] capitalize">{userRole === 'factory' ? 'Brand' : 'Factory'}</strong></span>
          </button>

          {/* AI Copilot Chat Trigger */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-linear-to-r from-[#006c4a] to-[#00422d] text-white text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              title="Open Kevixa Gemini AI Assistant"
            >
              <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">auto_awesome</span>
              <span className="text-[11px] font-bold">AI Copilot</span>
            </button>
          )}

          {/* New RFQ CTA for Brand role */}
          {userRole === 'brand' && onOpenNewRFQ && (
            <button
              onClick={onOpenNewRFQ}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#006c4a] text-white text-xs font-semibold shadow-sm hover:bg-[#005137] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Post Free RFQ</span>
            </button>
          )}

          {/* Settings / Edit Profile button for Factory role */}
          {userRole === 'factory' && onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Factory Settings & Edit Profile"
            >
              <span className="material-symbols-outlined text-[15px]">settings</span>
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Edit</span>
            </button>
          )}

          {/* Free Factory Onboarding trigger for Factory role */}
          {userRole === 'factory' && onOpenFactoryOnboarding && (
            <button
              onClick={onOpenFactoryOnboarding}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#85f8c4]/30 hover:bg-[#85f8c4]/50 text-[#002114] text-xs font-semibold border border-[#85f8c4] transition-all"
              title="Register factory & upload CDSCO COS-8 license"
            >
              <span className="material-symbols-outlined text-[15px] text-[#006c4a]">verified</span>
              <span>CDSCO Verified</span>
            </button>
          )}

          {/* Auth Button or User Profile Avatar */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="relative flex items-center justify-center p-1 rounded-full hover:bg-[#efeeec] transition-colors min-w-[44px] min-h-[44px]"
              aria-label="User profile"
            >
              <img
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#c6c6cd]"
                src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/aida/AEtjO1UvmKFys7v_YGw2g4BRhQ1k31R6ZXL_Bsd9aqVhrWAQS8CrgCtbTomH-aJ-uGInjqPZq5esyCRT3M-hz2a0kRHA1WDDcjjkLccTMmUYEKdMPrShJQE-JzMVrnf-sT5tkJyKNKxuYgStC9MWIVLgVri6AO0VSPOPZQUHQ-0fHX1-M9S6S6PhuGasKSApoQUvfaEpj3VdVlqxLXhjL30pht3uc3CCabJqT3p_E6v_Fmz43kDC73miM_AptGE'}
              />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#006c4a] rounded-full ring-2 ring-[#faf9f7]" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold hover:bg-black"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
