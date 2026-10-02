import React, { useState } from 'react';
import { RFQItem } from '../types';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';

interface FactoryViewProps {
  rfqs: RFQItem[];
  onOpenQuoteModal: (rfq: RFQItem) => void;
  onOpenMessage: (rfq: RFQItem) => void;
  onOpenCertificate: () => void;
  onOpenFormulaTool: () => void;
  onOpenSpecsTool: () => void;
  onOpenProFormaTool: (rfq?: RFQItem) => void;
  onOpenCreateRFQ: () => void;
  onOpenFactoryOnboarding?: () => void;
  onOpenLeadUnlock?: (rfq: RFQItem) => void;
  onOpenEditProfile?: () => void;
}

type FilterTab = 'all' | 'urgent' | 'high_value' | 'ayush';

export const FactoryView: React.FC<FactoryViewProps> = ({
  rfqs,
  onOpenQuoteModal,
  onOpenMessage,
  onOpenCertificate,
  onOpenFormulaTool,
  onOpenSpecsTool,
  onOpenProFormaTool,
  onOpenCreateRFQ,
  onOpenFactoryOnboarding,
  onOpenLeadUnlock,
  onOpenEditProfile,
}) => {
  const { currentUser } = useAuth();
  const [isAcceptingCapacity, setIsAcceptingCapacity] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showPhase2PreviewMode, setShowPhase2PreviewMode] = useState(false);

  // Filter logic
  const filteredRFQs = rfqs.filter(rfq => {
    if (activeFilter === 'urgent') return rfq.urgency === 'rush';
    if (activeFilter === 'high_value') return rfq.estimatedTotal >= 200000;
    if (activeFilter === 'ayush') {
      return (
        rfq.brandTag.toLowerCase().includes('ayush') ||
        rfq.formulationType.toLowerCase().includes('ayush') ||
        rfq.certifications.some(c => c.toLowerCase().includes('ayush'))
      );
    }
    return true;
  });

  const urgentCount = rfqs.filter(r => r.urgency === 'rush').length;
  const highValueCount = rfqs.filter(r => r.estimatedTotal >= 200000).length;
  const ayushCount = rfqs.filter(r => 
    r.brandTag.toLowerCase().includes('ayush') ||
    r.formulationType.toLowerCase().includes('ayush') ||
    r.certifications.some(c => c.toLowerCase().includes('ayush'))
  ).length;

  const handleDecline = (rfqId: string) => {
    const reason = prompt('Reason for declining this RFQ (e.g. Cleanroom capacity, packaging unavailability):');
    if (reason !== null) {
      rfqDb.declineRFQ(rfqId, reason || 'Factory capacity constraint');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-10">
      {/* Factory Portal Context & Presence Header */}
      <div className="px-4 py-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">factory</span>
            <span className="text-[11px] font-['Inter'] font-semibold uppercase tracking-wider text-[#45464d]">
              Factory Portal · {currentUser?.companyName || 'Aura Formulations'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-['Inter'] text-[#45464d] font-medium hidden sm:inline">
              {currentUser?.location || 'Baddi, HP'}
            </span>
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Edit Factory Profile, Contact Details & Address"
              >
                <span className="material-symbols-outlined text-[14px]">settings</span>
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase 1 Subscription Status & Free Onboarding Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-[#efeeec] shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006c4a] inline-block animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#002114] bg-[#85f8c4]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#006c4a]">verified</span>
              Subscription Status: Free Tier
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#45464d]">
              (₹0 RFQ Quotes · 100% Free Lead Access)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenFactoryOnboarding && (
              <button
                onClick={onOpenFactoryOnboarding}
                className="text-[10px] font-bold text-[#006c4a] hover:underline flex items-center gap-0.5 bg-[#85f8c4]/20 px-2 py-1 rounded-lg border border-[#85f8c4]/60"
              >
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                <span>Free Factory Onboarding</span>
              </button>
            )}
            <button
              onClick={() => setShowPhase2PreviewMode(!showPhase2PreviewMode)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                showPhase2PreviewMode
                  ? 'bg-[#3a0915] text-[#ffd9dd] border-[#70343e]'
                  : 'bg-[#efeeec] text-[#45464d] border-[#c6c6cd] hover:text-[#1a1c1b]'
              }`}
              title="Toggle preview of Phase 2 ₹500 Pay-Per-Lead architecture"
            >
              <span className="material-symbols-outlined text-[13px]">
                {showPhase2PreviewMode ? 'visibility' : 'lock'}
              </span>
              <span>Phase 2 Preview ({showPhase2PreviewMode ? 'On' : 'Off'})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <button
            onClick={() => setIsAcceptingCapacity(!isAcceptingCapacity)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm transition-all active:scale-95 text-left ${
              isAcceptingCapacity
                ? 'bg-[#85f8c4] text-[#002114]'
                : 'bg-[#e3e2e0] text-[#45464d]'
            }`}
            id="toggle-availability"
          >
            {isAcceptingCapacity ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c4a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006c4a]"></span>
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#76777d]"></span>
            )}
            <span className="text-[11px] font-['Inter'] font-semibold">
              {isAcceptingCapacity ? 'Accepting New Formulations' : 'Capacity Paused'}
            </span>
            <span className="text-[11px] font-['Inter'] bg-white/80 px-1.5 py-0.2 rounded-full text-[#005137] ml-1 font-mono">
              {isAcceptingCapacity ? 'Q2 Open' : 'Full'}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-[#efeeec] hover:bg-[#e9e8e6] text-[#1a1c1b] transition-colors flex items-center justify-center"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-white rounded-xl shadow-xl border border-[#c6c6cd] z-30 text-xs">
                <div className="font-bold text-[#1a1c1b] mb-2 flex justify-between items-center">
                  <span>Factory Alerts</span>
                  <span className="text-[10px] text-[#006c4a]">Real-Time</span>
                </div>
                <div className="space-y-2 text-[11px] text-[#45464d]">
                  <div className="p-1.5 rounded bg-[#85f8c4]/20 border border-[#85f8c4]/40">
                    <p className="font-semibold text-[#002114]">CDSCO COS-8 Active</p>
                    <p className="text-[10px]">Annual inspection audit passed.</p>
                  </div>
                  <div className="p-1.5 rounded bg-[#efeeec]">
                    <p className="font-semibold text-[#1a1c1b]">Nyra Skin Labs Rush</p>
                    <p className="text-[10px]">Ready base needed in 2 weeks.</p>
                  </div>
                </div>
                {onOpenEditProfile && (
                  <div className="mt-2.5 pt-2 border-t border-[#efeeec] flex items-center justify-between text-[10px]">
                    <span className="text-[#76777d] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#006c4a]">mail</span>
                      <span>Email Alerts: Active</span>
                    </span>
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        onOpenEditProfile();
                      }}
                      className="text-[#006c4a] font-bold hover:underline cursor-pointer"
                    >
                      Preferences
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Summary KPI Row (High Speed Glance) */}
      <div className="px-4 py-1">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
          {/* KPI 1 */}
          <div className="min-w-[155px] flex-1 snap-start p-3 rounded-xl bg-white shadow-sm border border-[#efeeec] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-['Inter'] text-[#45464d]">Inbound RFQs</span>
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">inventory_2</span>
            </div>
            <div>
              <span className="text-[24px] font-['Inter'] text-[#1a1c1b] font-bold leading-tight">
                {rfqs.length}
              </span>
              <span className="text-[11px] font-['Inter'] text-[#45464d] ml-1">Active</span>
            </div>
            <div className="mt-2 flex items-center gap-1 bg-[#85f8c4]/50 px-2 py-0.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[12px] text-[#006c4a] font-bold">arrow_upward</span>
              <span className="text-[10px] font-['Inter'] text-[#002114] font-semibold">+4 new today</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="min-w-[155px] flex-1 snap-start p-3 rounded-xl bg-white shadow-sm border border-[#efeeec] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-['Inter'] text-[#45464d]">Pending Quotes</span>
              <span className="material-symbols-outlined text-[16px] text-[#b86f7a]">pending_actions</span>
            </div>
            <div>
              <span className="text-[24px] font-['Inter'] text-[#1a1c1b] font-bold leading-tight">3</span>
              <span className="text-[11px] font-['Inter'] text-[#45464d] ml-1">Reviewing</span>
            </div>
            <div className="mt-2 flex items-center gap-1 bg-[#ffd9dd] px-2 py-0.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[12px] text-[#70343e]">schedule</span>
              <span className="text-[10px] font-['Inter'] text-[#3a0915] font-semibold">1 expires in 6h</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="min-w-[155px] flex-1 snap-start p-3 rounded-xl bg-white shadow-sm border border-[#efeeec] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-['Inter'] text-[#45464d]">Pipeline Est.</span>
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">currency_rupee</span>
            </div>
            <div>
              <span className="text-[24px] font-['Inter'] text-[#1a1c1b] font-bold leading-tight">₹28.4L</span>
            </div>
            <div className="mt-2 flex items-center gap-1 bg-[#efeeec] px-2 py-0.5 rounded-full w-fit">
              <span className="text-[10px] font-['Inter'] text-[#45464d] font-medium">Monthly Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Compliance & CDSCO Verification Widget */}
      <div className="px-4 py-1.5">
        <div className="p-4 rounded-xl bg-[#85f8c4]/25 border border-[#85f8c4]/60 shadow-sm relative overflow-hidden flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#1a1c1b] leading-tight">
                  CDSCO COS-8 Manufacturing License
                </span>
                <span className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Validated &amp; Inspection Audit Passed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 rounded-lg p-2.5 flex flex-col gap-1 mt-1 border border-white">
            <div className="flex justify-between items-center text-[#45464d]">
              <span className="text-[11px] font-['Inter']">License Registration</span>
              <span className="text-[14px] font-mono text-[#1a1c1b] font-bold">
                {currentUser?.cdscoLicense || 'COS-HP/2022/8492'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#45464d]">
              <span className="text-[11px] font-['Inter']">CDSCO Validity</span>
              <span className="text-[12px] font-['Inter'] text-[#1a1c1b] font-semibold">
                {currentUser?.cdscoValidity || 'Oct 2026 (Active)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#005137] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              100% Verified Partner Badge Active
            </span>
            <button
              onClick={onOpenCertificate}
              className="text-[11px] text-[#006c4a] font-bold underline hover:text-[#005137] transition-colors py-1 cursor-pointer"
            >
              View Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Manufacturing Quick Utilities Carousel (Factory Desk Tools) */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#1a1c1b]">
            Factory Desk Tools
          </span>
          <span className="text-[11px] text-[#45464d] font-medium">Fast Actions</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Formula Cost */}
          <button
            onClick={onOpenFormulaTool}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#efeeec] shadow-sm hover:bg-[#efeeec] transition-all active:scale-95 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-[#efeeec] flex items-center justify-center text-[#1a1c1b] mb-1">
              <span className="material-symbols-outlined text-[18px]">calculate</span>
            </div>
            <span className="text-[12px] font-semibold text-[#1a1c1b] line-clamp-1">Formula Cost</span>
            <span className="text-[10px] text-[#45464d]">Batch Margin</span>
          </button>

          {/* Specs Sheet */}
          <button
            onClick={onOpenSpecsTool}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#efeeec] shadow-sm hover:bg-[#efeeec] transition-all active:scale-95 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-[#efeeec] flex items-center justify-center text-[#1a1c1b] mb-1">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
            <span className="text-[12px] font-semibold text-[#1a1c1b] line-clamp-1">Specs Sheet</span>
            <span className="text-[10px] text-[#45464d]">Bulk Export</span>
          </button>

          {/* Pro-Forma */}
          <button
            onClick={() => onOpenProFormaTool(rfqs[0])}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#efeeec] shadow-sm hover:bg-[#efeeec] transition-all active:scale-95 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-[#efeeec] flex items-center justify-center text-[#1a1c1b] mb-1">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <span className="text-[12px] font-semibold text-[#1a1c1b] line-clamp-1">Pro-Forma</span>
            <span className="text-[10px] text-[#45464d]">Quick Invoice</span>
          </button>
        </div>
      </div>

      {/* Active RFQs Section */}
      <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[20px] text-[#1a1c1b]">
              Incoming Requests (RFQs)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[#000000] text-white px-2 py-0.5 rounded-full font-bold">
                {rfqs.length} Total
              </span>
              <button
                onClick={onOpenCreateRFQ}
                className="text-[11px] bg-[#006c4a] text-white px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-sm hover:bg-[#005137]"
                title="Post new RFQ"
              >
                <span className="material-symbols-outlined text-[13px]">add</span>
                <span>Post RFQ</span>
              </button>
            </div>
          </div>

          {/* Segment Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold shadow-sm transition-transform active:scale-95 shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              All ({rfqs.length})
            </button>
            <button
              onClick={() => setActiveFilter('urgent')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-transform active:scale-95 shrink-0 ${
                activeFilter === 'urgent'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              Urgent ({urgentCount})
            </button>
            <button
              onClick={() => setActiveFilter('high_value')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-transform active:scale-95 shrink-0 ${
                activeFilter === 'high_value'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              High Value (&gt;₹2L) ({highValueCount})
            </button>
            <button
              onClick={() => setActiveFilter('ayush')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-transform active:scale-95 shrink-0 ${
                activeFilter === 'ayush'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b]'
              }`}
            >
              Ayush Certified ({ayushCount})
            </button>
          </div>
        </div>

        {/* RFQ Cards Stack */}
        <div className="flex flex-col gap-3 mt-1">
          {filteredRFQs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#efeeec]">
              <span className="material-symbols-outlined text-3xl text-[#76777d] mb-2">filter_list_off</span>
              <p className="font-semibold text-sm text-[#1a1c1b]">No RFQs matching this filter</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-xs text-[#006c4a] font-bold underline"
              >
                Reset to All
              </button>
            </div>
          ) : (
            filteredRFQs.map(rfq => {
              const isRush = rfq.urgency === 'rush';
              const isHighVolume = rfq.urgency === 'high_volume';

              return (
                <div
                  key={rfq.id}
                  className={`p-4 rounded-xl bg-white shadow-sm border border-[#efeeec] flex flex-col gap-2 relative transition-all ${
                    rfq.status === 'declined' ? 'opacity-60 bg-[#efeeec]/40' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#e9e8e6] flex items-center justify-center font-bold text-[#1a1c1b] text-xs">
                        {rfq.brandInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#1a1c1b]">
                            {rfq.brandName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              rfq.brandTag.includes('Ayush')
                                ? 'bg-[#85f8c4]/50 text-[#002114]'
                                : rfq.brandTag.includes('Series')
                                ? 'bg-[#ffd9dd] text-[#3a0915]'
                                : 'bg-[#85f8c4]/50 text-[#002114]'
                            }`}
                          >
                            {rfq.brandTag}
                          </span>
                        </div>
                        <span className="text-[11px] font-['Inter'] text-[#45464d]">
                          {rfq.brandLocation} · {rfq.timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {rfq.quotesCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-[#85f8c4]/30 text-[#00422d] px-2 py-0.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[12px] text-[#006c4a]">notifications_active</span>
                          <span>{rfq.quotesCount} Quote{rfq.quotesCount !== 1 ? 's' : ''}</span>
                        </span>
                      )}

                      {isRush ? (
                        <span className="flex items-center gap-1 text-[11px] font-['Inter'] bg-[#ffd9dd] text-[#3a0915] px-2 py-0.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[13px]">bolt</span>
                          Rush
                        </span>
                      ) : isHighVolume ? (
                        <span className="text-[11px] font-['Inter'] bg-[#3a0915] text-[#ffd9dd] px-2 py-0.5 rounded-full font-bold">
                          High Volume
                        </span>
                      ) : (
                        <span className="text-[11px] font-['Inter'] bg-[#efeeec] text-[#45464d] px-2 py-0.5 rounded-full font-medium">
                          Standard
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="bg-[#f4f3f1] p-3 rounded-lg flex flex-col gap-1">
                    <span className="text-[13px] font-['Inter'] text-[#1a1c1b] font-semibold">
                      {rfq.quantity.toLocaleString()} units · {rfq.productName}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {rfq.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-['Inter'] bg-[#e3e2e0] px-2 py-0.5 rounded text-[#45464d]"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 py-0.5">
                    <div className="flex flex-col bg-[#efeeec]/60 p-2 rounded-lg">
                      <span className="text-[11px] font-['Inter'] text-[#45464d]">Target Unit Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[15px] font-['Inter'] font-bold text-[#1a1c1b]">
                          ₹{rfq.targetUnitPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#45464d]">/ unit</span>
                      </div>
                      <span className="text-[11px] text-[#006c4a] font-semibold">
                        Est: ₹{rfq.estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex flex-col bg-[#efeeec]/60 p-2 rounded-lg">
                      <span className="text-[11px] font-['Inter'] text-[#45464d]">Target Lead Time</span>
                      <span className="text-[15px] font-['Inter'] font-bold text-[#1a1c1b]">
                        {rfq.targetLeadTime}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isRush
                            ? 'text-[#b86f7a]'
                            : isHighVolume
                            ? 'text-[#006c4a]'
                            : 'text-[#45464d]'
                        }`}
                      >
                        {rfq.leadTimeBadgeNote || 'Standard batch queue'}
                      </span>
                    </div>
                  </div>

                  {/* Free RFQ Matching Indicator */}
                  <div className="flex items-center justify-between text-[11px] bg-[#85f8c4]/15 border border-[#85f8c4]/40 px-2.5 py-1 rounded-lg">
                    <span className="text-[#005137] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#006c4a]">hub</span>
                      Matched for {currentUser?.location || 'Baddi'} CDSCO License
                    </span>
                    <span className="text-[10px] text-[#006c4a] font-bold uppercase tracking-wider">
                      Phase 1 Free Lead (₹0)
                    </span>
                  </div>

                  {/* Direct Contact Drawer (if lead unlocked or previewed) */}
                  {rfq.leadUnlocked && (
                    <div className="p-2.5 rounded-lg bg-[#faf9f7] border border-[#85f8c4] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#006c4a] uppercase font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">lock_open</span>
                          Direct Brand Sourcing Contact (Unlocked)
                        </span>
                        <p className="font-bold text-[#1a1c1b]">{rfq.directContact?.contactPerson || 'Dr. Neha Sharma (Head of R&D)'}</p>
                        <p className="text-[11px] font-mono text-[#45464d]">{rfq.directContact?.phone || '+91 98450 82910'}</p>
                      </div>
                      <a
                        href={`https://wa.me/919845082910?text=Hello,%20Aura%20Formulations%20regarding%20${encodeURIComponent(rfq.productName)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {/* Phase 2 Monetization Architecture: Unlock Lead (₹500) Button Component */}
                  <div className="flex items-center justify-between py-0.5">
                    <button
                      onClick={() => onOpenLeadUnlock ? onOpenLeadUnlock(rfq) : null}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        rfq.leadUnlocked
                          ? 'bg-[#85f8c4]/30 text-[#002114] border border-[#85f8c4]'
                          : 'bg-[#faf9f7] hover:bg-[#efeeec] text-[#1a1c1b] border border-[#c6c6cd]'
                      }`}
                      title="Prepare for Phase 2 pay-per-lead integration"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#006c4a]">
                        {rfq.leadUnlocked ? 'lock_open' : 'lock'}
                      </span>
                      <span>{rfq.leadUnlocked ? 'Lead Unlocked' : 'Unlock Lead (₹500)'}</span>
                      <span className="text-[9px] bg-[#ffd9dd] text-[#3a0915] px-1.5 py-0.2 rounded font-bold uppercase">
                        {rfq.leadUnlocked ? 'Phase 1 Active' : 'Phase 2 Preview'}
                      </span>
                    </button>

                    <span className="text-[10px] text-[#45464d]">
                      {rfq.leadUnlocked ? 'Direct contacts visible' : 'Waived in Phase 1 Free Tier'}
                    </span>
                  </div>

                  {/* Status indicator if quoted or declined */}
                  {rfq.status === 'quoted' && (
                    <div className="bg-[#85f8c4]/30 px-2.5 py-1 rounded-md text-[11px] text-[#002114] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-[#006c4a]">check_circle</span>
                      <span>Quote submitted ({rfq.quotesCount} quote{rfq.quotesCount > 1 ? 's' : ''} on record)</span>
                    </div>
                  )}

                  {rfq.status === 'declined' && (
                    <div className="bg-[#ffdad6]/60 px-2.5 py-1 rounded-md text-[11px] text-[#ba1a1a] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      <span>Declined by factory: {rfq.notes}</span>
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenQuoteModal(rfq)}
                      className={`flex-1 h-11 text-xs font-['Inter'] rounded-xl font-semibold flex items-center justify-center gap-1 shadow-sm active:scale-98 transition-transform ${
                        isRush
                          ? 'bg-[#006c4a] text-white hover:bg-[#005137]'
                          : 'bg-[#000000] text-white hover:bg-neutral-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>{rfq.status === 'quoted' ? 'Update Quote' : 'Submit Quote'}</span>
                    </button>

                    <button
                      onClick={() => onOpenMessage(rfq)}
                      aria-label="Message Brand"
                      className="w-11 h-11 rounded-xl bg-[#efeeec] text-[#1a1c1b] flex items-center justify-center hover:bg-[#e9e8e6] transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </button>

                    <button
                      onClick={() => handleDecline(rfq.id)}
                      className="px-2.5 h-11 rounded-xl text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors text-[11px] font-['Inter']"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Operational Health Micro-Toast & Footer Guarantee Note */}
      <div className="px-4 pb-6">
        <div className="p-3 rounded-xl bg-[#efeeec] flex items-center gap-3 border border-[#e3e2e0]">
          <div className="w-7 h-7 rounded-full bg-[#85f8c4] flex items-center justify-center text-[#002114]">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[12px] font-['Inter'] font-semibold text-[#1a1c1b]">
              CDSCO Central Gateway Sync
            </span>
            <span className="text-[10px] font-['Inter'] text-[#45464d]">
              Last batch audit synchronized 34 mins ago
            </span>
          </div>
          <span className="text-[11px] font-['Inter'] text-[#006c4a] font-bold">100% Live</span>
        </div>
      </div>
    </div>
  );
};
