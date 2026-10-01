import React, { useState, useEffect } from 'react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | 'cdsco';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicy?: PolicyType;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialPolicy = 'terms',
}) => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(initialPolicy);

  // Sync state whenever modal opens with a new initial policy
  useEffect(() => {
    if (isOpen && initialPolicy) {
      setActivePolicy(initialPolicy);
    }
  }, [isOpen, initialPolicy]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#c6c6cd]/50 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#efeeec] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">
                {activePolicy === 'terms' && 'gavel'}
                {activePolicy === 'privacy' && 'security'}
                {activePolicy === 'refund' && 'receipt_long'}
                {activePolicy === 'cdsco' && 'verified_user'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="legal-modal-title"
                  className="font-['Plus_Jakarta_Sans'] font-bold text-base sm:text-lg text-[#1a1c1b]"
                >
                  {activePolicy === 'terms' && 'Terms of Service'}
                  {activePolicy === 'privacy' && 'Privacy Policy'}
                  {activePolicy === 'refund' && 'Refund & Subscription Policy'}
                  {activePolicy === 'cdsco' && 'CDSCO Compliance Disclaimer'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#efeeec] text-[#45464d] hidden sm:inline-block">
                  Legal Notice
                </span>
              </div>
              <p className="text-xs text-[#76777d]">
                Kevixa B2B Technology Platform · Effective Date: Jan 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#efeeec] hover:bg-[#c6c6cd]/40 text-[#45464d] flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation for all policies */}
        <div className="px-4 sm:px-5 pt-3 border-b border-[#efeeec] bg-[#faf9f7] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActivePolicy('terms')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activePolicy === 'terms'
                ? 'border-[#006c4a] text-[#006c4a] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#1a1c1b]'
            }`}
          >
            <span className="material-symbols-outlined text-base">gavel</span>
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActivePolicy('privacy')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activePolicy === 'privacy'
                ? 'border-[#006c4a] text-[#006c4a] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#1a1c1b]'
            }`}
          >
            <span className="material-symbols-outlined text-base">security</span>
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActivePolicy('refund')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activePolicy === 'refund'
                ? 'border-[#006c4a] text-[#006c4a] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#1a1c1b]'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Refund & Cancellation</span>
          </button>

          <button
            onClick={() => setActivePolicy('cdsco')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activePolicy === 'cdsco'
                ? 'border-[#006c4a] text-[#006c4a] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#1a1c1b]'
            }`}
          >
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>CDSCO Disclaimer</span>
          </button>
        </div>

        {/* Scrollable Policy Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-[#45464d] leading-relaxed">
          {/* TERMS OF SERVICE */}
          {activePolicy === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
                <p className="font-semibold text-[#1a1c1b] text-xs">
                  Summary: Kevixa operates strictly as an intermediary technology platform. We connect beauty brands and contract factories, but we do not manufacture goods, formulate products, or hold ownership of batches.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  1. Intermediary Technology Status
                </h4>
                <p>
                  Kevixa (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;) is a digital business-to-business (B2B) communications and matchmaking intermediary operating under Section 79 of the Indian Information Technology Act, 2000. Kevixa provides software infrastructure to enable direct discovery, RFQ exchanges, and quotation negotiations between independent beauty brands and licensed manufacturing facilities.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  2. No Manufacturing or Product Ownership
                </h4>
                <p>
                  Kevixa does not manufacture, compound, fill, pack, test, label, store, or warehouse cosmetic or personal care products. Kevixa does not take title to or possession of any physical raw materials, packaging components, or finished batches. All manufacturing activities take place exclusively at third-party licensed facilities.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  3. Bilateral Commercial Contracts
                </h4>
                <p>
                  Any formal manufacturing contract, purchase order (PO), formulation agreement, quality agreement, sample approval, or commercial supply agreement entered into is strictly a bilateral contract between the Brand and the Manufacturer. Kevixa is not a party to these commercial contracts and bears no liability for breach, delivery delays, defective batches, non-payment, or microbial non-compliance.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  4. User Representations & Conduct
                </h4>
                <p>
                  Manufacturers represent and warrant that their manufacturing licenses (CDSCO Form COS-8, Form 32, or State Drug Controller endorsements) are current, valid, and unencumbered. Brands represent and warrant that product claims, trademarks, and formulation briefs comply with BIS IS 4707 standards and Indian labeling regulations.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  5. Limitation of Liability & Dispute Resolution
                </h4>
                <p>
                  To the maximum extent permitted by Indian law, Kevixa shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from production defects, ingredient contamination, or commercial supply disruptions. Governing law is the laws of India, with courts in New Delhi having exclusive jurisdiction.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activePolicy === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
                <p className="font-semibold text-[#1a1c1b] text-xs">
                  Summary: Your business credentials, contact numbers, email addresses, and uploaded CDSCO license documents are stored with bank-grade security and are NEVER sold to third-party advertisers.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  1. Information We Collect
                </h4>
                <p>
                  To facilitate commercial B2B matchmaking, Kevixa collects the following categories of information:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[#45464d]">
                  <li><strong className="text-[#1a1c1b]">Company & Profile Data:</strong> Company name, registered business address, GSTIN, and state jurisdiction.</li>
                  <li><strong className="text-[#1a1c1b]">Contact Information:</strong> Authorized representative name, verified business email, and phone number.</li>
                  <li><strong className="text-[#1a1c1b]">Regulatory Documents:</strong> Uploaded CDSCO Form COS-8 manufacturing licenses, state drug control certificates, and factory specifications.</li>
                  <li><strong className="text-[#1a1c1b]">RFQ & Formulation Data:</strong> Target formulation briefs, ingredient lists, packaging specifications, and target MOQs.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  2. Strict Non-Sale of User Data
                </h4>
                <div className="p-3 bg-[#85f8c4]/20 rounded-xl border border-[#85f8c4] text-[#002114]">
                  <strong className="block text-xs mb-0.5">Zero Third-Party Advertising Monetization</strong>
                  Kevixa does not sell, rent, monetize, or trade your personal information, corporate contact information, or formulation briefs to third-party marketing agencies, brokers, or data aggregators.
                </div>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  3. Secure Storage & Encryption
                </h4>
                <p>
                  All credentials, session tokens, and regulatory PDF uploads are stored using industry-standard AES-256 server-side encryption and Firebase infrastructure with role-based access rules. Only authenticated parties to a specific RFQ negotiation receive designated contact access.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  4. Data Retention and Account Deletion
                </h4>
                <p>
                  Users may request a full export of their RFQ history or complete de-identification and deletion of their company profile and uploaded regulatory files by emailing privacy@kevixa.in.
                </p>
              </div>
            </div>
          )}

          {/* REFUND & CANCELLATION POLICY */}
          {activePolicy === 'refund' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
                <p className="font-semibold text-[#1a1c1b] text-xs">
                  Summary: Because digital contact information and proprietary RFQ leads are transmitted instantly upon unlock, subscription plans and pay-per-lead unlock fees are non-refundable once delivered.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  1. Digital Service Delivery Nature
                </h4>
                <p>
                  Kevixa provides digital information services, including immediate access to brand procurement dossiers, direct contact numbers, formulation technical sheets, and premium directory placement (e.g., Pro Factory Tier).
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  2. Non-Refundable Once Delivered
                </h4>
                <p>
                  Because proprietary contact details and commercial specifications are revealed immediately upon payment or unlock confirmation:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[#45464d]">
                  <li><strong className="text-[#1a1c1b]">Lead Unlock Fees (e.g., ₹500 Lead Unlock):</strong> Once the full brand contact name, email, phone, and detailed packaging brief are decrypted and shown, all sales are final and non-refundable.</li>
                  <li><strong className="text-[#1a1c1b]">Subscription Plans:</strong> Factory Pro subscription fees are billed monthly or annually and are non-refundable for the current billing cycle. Cancellations apply to future billing renewals.</li>
                  <li><strong className="text-[#1a1c1b]">Phase 1 Free Tier:</strong> All RFQ browsing, quoting, and onboarding during Phase 1 are offered with ₹0 platform commission and no hidden obligations.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  3. Technical Dispute & Duplicate Charges
                </h4>
                <p>
                  In the rare event of a verified double charge, system billing error, or platform downtime where lead data was not accessible due to server failure, users may submit a claim within 7 calendar days to billing@kevixa.in. Verified billing discrepancies will be credited or refunded within 5-7 banking days.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  4. Statutory Invoicing & GST
                </h4>
                <p>
                  All commercial fees charged by Kevixa include applicable Goods and Services Tax (GST) in India. GST invoices can be downloaded anytime from the Factory Profile dashboard.
                </p>
              </div>
            </div>
          )}

          {/* CDSCO COMPLIANCE DISCLAIMER */}
          {activePolicy === 'cdsco' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
                <p className="font-semibold text-[#1a1c1b] text-xs">
                  Summary: Factory owners are solely and legally responsible for maintaining valid CDSCO COS-8 manufacturing licenses, FSSAI certifications, and NABL approvals. Kevixa does not conduct physical cGMP facility inspections.
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  1. Statutory Regulatory Compliance
                </h4>
                <p>
                  Cosmetic formulation and manufacturing in India is governed by the Drugs and Cosmetics Act, 1940 and the Cosmetics Rules, 2020 administered by the Central Drugs Standard Control Organization (CDSCO) and State Licensing Authorities (SLAs).
                </p>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  2. Factory Owner Sole Responsibility
                </h4>
                <p>
                  Contract manufacturers, loan licensees, and private label factories registered on Kevixa are solely responsible for:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[#45464d]">
                  <li>Maintaining valid Form COS-8 (or erstwhile Form 32) manufacturing licenses issued by their respective State Drug Licensing Authorities.</li>
                  <li>Ensuring valid retention fee payments and statutory quinquennial license renewals.</li>
                  <li>Maintaining Schedule M-II cGMP cleanroom standards, HVAC differential pressures, and water purification protocols.</li>
                  <li>Adhering to FSSAI (for nutraceuticals/ayurvedic cosmetics) and maintaining testing equipment accredited by NABL.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  3. Scope of &quot;CDSCO Verified&quot; Badge
                </h4>
                <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec]">
                  <p>
                    The &quot;CDSCO Verified&quot; badge displayed on Kevixa indicates that the factory owner has uploaded a valid Form COS-8 certificate document matching the stated registered name and license number. This digital check does not represent an on-site government inspection, microbial stability guarantee, or endorsement of specific batches.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mb-1">
                  4. D2C Brand Audit & Quality Due Diligence
                </h4>
                <p>
                  Brands are strongly advised to perform pilot batch test runs, request Certificate of Analysis (CoA) documentation for all active ingredients, verify stability at accelerated conditions (40°C / 75% RH), and inspect physical manufacturing facilities prior to committing large-scale capital or initiating commercial trade distribution.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#efeeec] bg-[#faf9f7] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#76777d]">
            CDSCO COS-8 Intermediary Portal · Kevixa India
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
