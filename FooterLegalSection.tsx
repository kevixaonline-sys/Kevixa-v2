import React, { useState } from 'react';
import { FAQSection } from './FAQSection';
import { LegalPolicyModal, PolicyType } from './LegalPolicyModal';

interface FooterLegalSectionProps {
  showFAQ?: boolean;
  className?: string;
  sourceContext?: 'explore' | 'profile';
}

export const FooterLegalSection: React.FC<FooterLegalSectionProps> = ({
  showFAQ = true,
  className = '',
  sourceContext = 'explore',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('terms');

  const openPolicy = (policy: PolicyType) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const scrollToFAQ = () => {
    const el = document.getElementById(
      sourceContext === 'profile' ? 'profile-faq-section' : 'explore-faq-section'
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqId = sourceContext === 'profile' ? 'profile-faq-section' : 'explore-faq-section';

  return (
    <div className={`w-full mt-6 space-y-6 ${className}`}>
      {/* FAQ Accordion Component */}
      {showFAQ && (
        <FAQSection
          id={faqId}
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about CDSCO compliance, B2B quoting, and factory matchmaking"
        />
      )}

      {/* Trust & Regulatory Banner */}
      <div className="p-3.5 rounded-xl bg-linear-to-r from-[#002114] to-[#00422d] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#85f8c4]/20 text-[#85f8c4] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs">
                CDSCO Regulatory Assurance
              </span>
              <span className="text-[9px] bg-[#85f8c4] text-[#002114] font-bold px-1.5 py-0.2 rounded uppercase">
                Cosmetics Rules 2020
              </span>
            </div>
            <p className="text-[11px] text-white/80">
              Only factories with verified Form COS-8 or Form 32 licenses can submit quotes on Kevixa.
            </p>
          </div>
        </div>

        <button
          onClick={() => openPolicy('cdsco')}
          className="text-[11px] font-semibold text-[#85f8c4] hover:text-white underline text-left sm:text-right shrink-0 cursor-pointer"
        >
          View Compliance Notice →
        </button>
      </div>

      {/* Bottom Footer Section */}
      <footer className="pt-4 border-t border-[#efeeec] space-y-4">
        {/* Navigation Links Grid / Flex */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#006c4a] flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-[#1a1c1b]">
              Kevixa Technologies
            </span>
            <span className="text-[10px] text-[#76777d]">· India B2B Marketplace</span>
          </div>

          <div className="text-[11px] text-[#76777d]">
            Intermediary Platform · IT Act 2000 (Section 79)
          </div>
        </div>

        {/* Footer Policy Links Required by Brief */}
        <nav
          aria-label="Legal and Help Links"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#45464d]"
        >
          <button
            type="button"
            onClick={scrollToFAQ}
            className="hover:text-[#006c4a] transition-colors flex items-center gap-1 cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-sm text-[#006c4a]">
              help_center
            </span>
            <span>Frequently Asked Questions</span>
          </button>

          <span className="text-[#c6c6cd] hidden sm:inline">·</span>

          <button
            type="button"
            onClick={() => openPolicy('terms')}
            className="hover:text-[#006c4a] transition-colors cursor-pointer text-left"
          >
            Terms of Service
          </button>

          <span className="text-[#c6c6cd] hidden sm:inline">·</span>

          <button
            type="button"
            onClick={() => openPolicy('privacy')}
            className="hover:text-[#006c4a] transition-colors cursor-pointer text-left"
          >
            Privacy Policy
          </button>

          <span className="text-[#c6c6cd] hidden sm:inline">·</span>

          <button
            type="button"
            onClick={() => openPolicy('refund')}
            className="hover:text-[#006c4a] transition-colors cursor-pointer text-left"
          >
            Refund & Cancellation Policy
          </button>

          <span className="text-[#c6c6cd] hidden sm:inline">·</span>

          <button
            type="button"
            onClick={() => openPolicy('cdsco')}
            className="text-[#006c4a] hover:text-[#005137] underline font-bold transition-colors cursor-pointer text-left"
          >
            CDSCO Compliance Disclaimer
          </button>
        </nav>

        {/* Copyright and Legal Disclaimers */}
        <div className="pt-2 text-[10px] text-[#76777d] leading-normal space-y-1">
          <p>
            © {new Date().getFullYear()} Kevixa Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p>
            Disclaimer: Kevixa operates as an intermediary matchmaking platform under the Information
            Technology Act, 2000. Kevixa does not formulate, manufacture, or warranty cosmetic batches.
            All commercial transactions, formulations, quality audits, and statutory CDSCO/FSSAI licensing
            compliance remain the direct responsibility of the respective contracting brands and manufacturing entities.
          </p>
        </div>
      </footer>

      {/* Accessible Policy Modal */}
      <LegalPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPolicy={selectedPolicy}
      />
    </div>
  );
};
