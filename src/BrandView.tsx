import React, { useState } from 'react';
import { RFQItem, RFQQuote, RFQStepperStatus, QuickNote, FactoryListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { rfqDb } from '../services/rfqDb';
import { RFQDetailModal } from './RFQDetailModal';

interface BrandViewProps {
  rfqs: RFQItem[];
  quotes: RFQQuote[];
  onOpenCreateRFQ: () => void;
  onOpenMessage: (rfq: RFQItem) => void;
  onOpenRateModal?: (factory: FactoryListing, rfq?: RFQItem) => void;
}

const STEPPER_STAGES: Array<{ key: RFQStepperStatus; label: string; icon: string }> = [
  { key: 'Draft', label: 'Draft', icon: 'edit_document' },
  { key: 'Submitted', label: 'Submitted', icon: 'send' },
  { key: 'Negotiating', label: 'Negotiating', icon: 'handshake' },
  { key: 'Approved', label: 'Approved', icon: 'verified' },
];

export const BrandView: React.FC<BrandViewProps> = ({
  rfqs,
  quotes,
  onOpenCreateRFQ,
  onOpenMessage,
  onOpenRateModal,
}) => {
  const { currentUser } = useAuth();
  const [selectedRFQForDetail, setSelectedRFQForDetail] = useState<RFQItem | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<'overview' | 'notes' | 'history' | 'quotes'>('overview');
  const [activeAlertPopupRFQId, setActiveAlertPopupRFQId] = useState<string | null>(null);
  const [inlineNoteOpenRFQId, setInlineNoteOpenRFQId] = useState<string | null>(null);
  const [inlineNoteText, setInlineNoteText] = useState('');
  const [inlineCategory, setInlineCategory] = useState<QuickNote['category']>('General');

  // Filter RFQs posted by current brand or all demo RFQs
  const brandRfqs = rfqs.filter(
    r => r.brandId === currentUser?.uid || r.brandName.toLowerCase().includes(currentUser?.companyName.toLowerCase() || 'nyra')
  );

  const displayList = brandRfqs.length > 0 ? brandRfqs : rfqs;

  // Keep selected RFQ in modal in sync with database updates
  const activeDetailRFQ = selectedRFQForDetail 
    ? rfqs.find(r => r.id === selectedRFQForDetail.id) || selectedRFQForDetail 
    : null;

  const openDetailModal = (rfq: RFQItem, tab: 'overview' | 'notes' | 'history' | 'quotes' = 'overview') => {
    setSelectedRFQForDetail(rfq);
    setDetailModalInitialTab(tab);
    // Dismiss alert upon viewing full details/tab
    if (rfq.hasAlert) {
      rfqDb.dismissAlert(rfq.id);
    }
  };

  const handleDismissAlert = (rfqId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    rfqDb.dismissAlert(rfqId);
    setActiveAlertPopupRFQId(null);
  };

  const handleAlertAction = (rfq: RFQItem, tab: 'quotes' | 'history', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    rfqDb.dismissAlert(rfq.id);
    setActiveAlertPopupRFQId(null);
    openDetailModal(rfq, tab);
  };

  const handleUpdateStepper = (rfqId: string, status: RFQStepperStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const authorName = currentUser?.displayName || currentUser?.companyName || 'Brand Procurement';
    const authorRole = currentUser?.role === 'brand' ? 'Brand Team' : 'Procurement Desk';
    rfqDb.updateRFQStepperStatus(rfqId, status, authorName, authorRole);
  };

  const handleSaveInlineNote = (rfqId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineNoteText.trim()) return;

    const authorName = currentUser?.displayName || currentUser?.companyName || 'Brand Procurement';
    const authorRole = currentUser?.role === 'brand' ? 'Brand Team' : 'Procurement Desk';

    rfqDb.addInternalNote(rfqId, {
      text: inlineNoteText.trim(),
      author: authorName,
      role: authorRole,
      category: inlineCategory,
    });

    setInlineNoteText('');
    setInlineNoteOpenRFQId(null);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-2 pb-12 gap-4">
      {/* Brand Context Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#3a0915] text-[#ffd9dd] flex items-center justify-center font-bold text-xs">
            {currentUser?.companyName?.slice(0, 2).toUpperCase() || 'NS'}
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-semibold block">
              Brand Portal · {currentUser?.companyName || 'Nyra Skin Labs'}
            </span>
            <span className="text-[12px] text-[#1a1c1b] font-medium">
              {currentUser?.location || 'Bengaluru, KA'} · D2C Formulation Desk
            </span>
          </div>
        </div>
        <span className="bg-[#85f8c4]/40 text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded-full">
          Verified Brand
        </span>
      </div>

      {/* Hero CTA Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b2e] to-[#000000] text-white shadow-md relative overflow-hidden flex flex-col justify-between gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#85f8c4] font-bold">
              CDSCO B2B Network
            </span>
            <h2 className="text-lg font-['Plus_Jakarta_Sans'] font-bold leading-snug">
              Launch Your Next Formulation
            </h2>
            <p className="text-xs text-[#bec6e0] max-w-sm">
              Connect directly with verified Schedule M / ISO 22716 cleanrooms in Baddi, Pune, and Haridwar.
            </p>
          </div>
          <span className="material-symbols-outlined text-3xl text-[#85f8c4]/80">
            science
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onOpenCreateRFQ}
            className="px-4 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Formulation RFQ</span>
          </button>
          <span className="text-[11px] text-[#bec6e0]">Average 3 factory quotes in 24h</span>
        </div>
      </div>

      {/* Stats Glance */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white rounded-xl border border-[#efeeec] shadow-xs">
          <span className="text-[11px] text-[#45464d] block">My Active RFQs</span>
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#1a1c1b]">
            {displayList.length}
          </span>
          <span className="text-[10px] text-[#006c4a] font-semibold block mt-0.5">Live on exchange</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#efeeec] shadow-xs">
          <span className="text-[11px] text-[#45464d] block">Factory Quotes</span>
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#1a1c1b]">
            {quotes.length}
          </span>
          <span className="text-[10px] text-[#b86f7a] font-semibold block mt-0.5">Under evaluation</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#efeeec] shadow-xs">
          <span className="text-[11px] text-[#45464d] block">Target Budget</span>
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#1a1c1b]">
            ₹{(displayList.reduce((acc, r) => acc + r.estimatedTotal, 0) / 100000).toFixed(1)}L
          </span>
          <span className="text-[10px] text-[#45464d] font-semibold block mt-0.5">Est. production</span>
        </div>
      </div>

      {/* Brand's RFQs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#1a1c1b]">
              My Formulation RFQ Pipeline
            </h3>
            <span className="text-[11px] bg-[#efeeec] text-[#45464d] px-2 py-0.5 rounded-full font-bold">
              {displayList.length}
            </span>
          </div>
          <button
            onClick={onOpenCreateRFQ}
            className="text-xs text-[#006c4a] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New RFQ</span>
          </button>
        </div>

        <div className="space-y-4">
          {displayList.map(rfq => {
            const rfqQuotes = quotes.filter(q => q.rfqId === rfq.id);
            const internalNotes = rfq.internalNotes || [];
            const latestNote = internalNotes.length > 0 ? internalNotes[0] : null;

            // Determine stepper state
            const currentStatus: RFQStepperStatus = 
              rfq.stepperStatus || (rfqQuotes.length > 0 ? 'Negotiating' : 'Submitted');
            const currentStepIdx = STEPPER_STAGES.findIndex(s => s.key === currentStatus);

            const isInlineNotesOpen = inlineNoteOpenRFQId === rfq.id;

            // Post-completion review states
            const hasReviewed = rfqDb.hasBrandReviewedRFQ(currentUser?.uid || 'brand-nyra', rfq.id);
            const reviewedItem = rfqDb.getReviewForRFQ(rfq.id);
            const targetFactory = rfqDb.getFactoryById(rfqQuotes[0]?.factoryId || 'factory-aura') || rfqDb.getFactories()[0];
            const isCompleted = currentStatus === 'Approved' || rfq.status === 'contracted';

            return (
              <div
                key={rfq.id}
                className={`p-4 rounded-xl bg-white shadow-xs transition-all space-y-3 relative ${
                  Boolean(rfq.hasAlert && !rfq.alertDismissed)
                    ? rfq.alertType === 'new_quote'
                      ? 'border-2 border-[#85f8c4] ring-2 ring-[#006c4a]/15 shadow-sm'
                      : 'border-2 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                    : 'border border-[#efeeec] hover:border-[#d2d1cf]'
                }`}
              >
                {/* RFQ Header Row */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-[#006c4a] bg-[#85f8c4]/30 px-2 py-0.5 rounded">
                        {rfq.formulationType}
                      </span>
                      <span className="text-[10px] text-[#76777d] font-mono">
                        #{rfq.id}
                      </span>
                    </div>

                    <h4 
                      onClick={() => openDetailModal(rfq, 'overview')}
                      className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] mt-1 hover:text-[#006c4a] cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>{rfq.productName}</span>
                      <span className="material-symbols-outlined text-[15px] text-[#76777d]">open_in_new</span>
                    </h4>

                    <span className="text-[11px] text-[#45464d]">
                      {rfq.quantity.toLocaleString()} units · Packaging: {rfq.packageType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Visual Notification Bell Icon with Alert Ping Indicator */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAlertPopupRFQId(prev => (prev === rfq.id ? null : rfq.id));
                        }}
                        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          Boolean(rfq.hasAlert && !rfq.alertDismissed)
                            ? rfq.alertType === 'new_quote'
                              ? 'bg-[#85f8c4]/30 text-[#006c4a] hover:bg-[#85f8c4]/50 ring-2 ring-[#006c4a]/30'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 ring-2 ring-amber-400/40'
                            : 'bg-[#f4f3f1] text-[#76777d] hover:bg-[#efeeec] hover:text-[#1a1c1b]'
                        }`}
                        title={
                          Boolean(rfq.hasAlert && !rfq.alertDismissed)
                            ? `${rfq.alertTitle}: ${rfq.alertMessage}`
                            : 'Notification bell (No active alerts)'
                        }
                        aria-label="RFQ notification bell"
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          {Boolean(rfq.hasAlert && !rfq.alertDismissed) ? 'notifications_active' : 'notifications'}
                        </span>
                        {Boolean(rfq.hasAlert && !rfq.alertDismissed) && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                          </span>
                        )}
                      </button>

                      {/* Bell Popover Flyout */}
                      {activeAlertPopupRFQId === rfq.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-[#d2d1cf] p-3.5 z-30 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-[#efeeec]">
                            <span className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#006c4a]">notifications</span>
                              RFQ Alert Notification
                            </span>
                            <button
                              onClick={() => setActiveAlertPopupRFQId(null)}
                              className="text-[#76777d] hover:text-[#1a1c1b] text-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </div>

                          {Boolean(rfq.hasAlert && !rfq.alertDismissed) ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  rfq.alertType === 'new_quote' ? 'bg-[#85f8c4]/40 text-[#00422d]' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {rfq.alertType === 'new_quote' ? 'New Quote Added' : 'Status Changed'}
                                </span>
                                <span className="text-[10px] text-[#76777d]">{rfq.alertTime || 'Recently'}</span>
                              </div>
                              <p className="text-xs font-bold text-[#1a1c1b]">{rfq.alertTitle}</p>
                              <p className="text-[11px] text-[#45464d] leading-relaxed">{rfq.alertMessage}</p>

                              <div className="flex items-center justify-between pt-1 border-t border-[#efeeec]">
                                <button
                                  onClick={(e) => handleDismissAlert(rfq.id, e)}
                                  className="text-[11px] text-[#76777d] hover:text-[#1a1c1b] font-semibold cursor-pointer"
                                >
                                  Mark as Read
                                </button>
                                <button
                                  onClick={(e) => handleAlertAction(rfq, rfq.alertType === 'new_quote' ? 'quotes' : 'history', e)}
                                  className="px-2.5 py-1 rounded bg-[#006c4a] hover:bg-[#005137] text-white text-[11px] font-bold cursor-pointer shadow-xs"
                                >
                                  {rfq.alertType === 'new_quote' ? 'Review Quote' : 'View History'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 text-center text-[#76777d]">
                              <p className="text-xs font-semibold text-[#1a1c1b]">All caught up!</p>
                              <p className="text-[10px]">No new alerts on this quote request.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#1a1c1b] block">
                        Target: ₹{rfq.targetUnitPrice.toFixed(2)}/u
                      </span>
                      <span className="text-[10px] text-[#45464d] font-semibold block">
                        ₹{rfq.estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VISUAL ALERT INDICATOR BANNER ON CARD */}
                {Boolean(rfq.hasAlert && !rfq.alertDismissed) && (
                  <div 
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-150 ${
                      rfq.alertType === 'new_quote'
                        ? 'bg-[#e6f7f0] border-[#85f8c4] text-[#00422d]'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        rfq.alertType === 'new_quote' ? 'bg-[#006c4a] text-white' : 'bg-amber-600 text-white'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {rfq.alertType === 'new_quote' ? 'verified' : 'timeline'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs">
                            {rfq.alertTitle || (rfq.alertType === 'new_quote' ? 'New Quote Received!' : 'Status Changed!')}
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">· {rfq.alertTime || 'Recently'}</span>
                        </div>
                        <p className="text-[11px] leading-snug opacity-90 truncate sm:whitespace-normal mt-0.5">
                          {rfq.alertMessage || 'New activity detected on this formulation RFQ.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleAlertAction(rfq, rfq.alertType === 'new_quote' ? 'quotes' : 'history', e)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                          rfq.alertType === 'new_quote'
                            ? 'bg-[#006c4a] hover:bg-[#005137] text-white'
                            : 'bg-amber-700 hover:bg-amber-800 text-white'
                        }`}
                      >
                        <span>{rfq.alertType === 'new_quote' ? 'Review Quote' : 'View History'}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>

                      <button
                        onClick={(e) => handleDismissAlert(rfq.id, e)}
                        className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center text-current opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                        title="Dismiss alert"
                        aria-label="Dismiss alert"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  {rfq.certifications.map((c, i) => (
                    <span key={i} className="text-[10px] bg-[#efeeec] text-[#45464d] px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>

                {/* VISUAL STATUS STEPPER (Draft, Submitted, Negotiating, Approved) */}
                <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#1a1c1b] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#006c4a]">timeline</span>
                      <span>Quote Status:</span>
                      <strong className="text-[#006c4a]">{currentStatus}</strong>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(rfq, 'history');
                      }}
                      className="text-[10px] text-[#006c4a] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="View timestamped status change history log"
                    >
                      <span className="material-symbols-outlined text-[13px]">history</span>
                      <span>History Log ({rfq.statusHistory?.length || 1})</span>
                    </button>
                  </div>

                  {/* Horizontal Stepper UI */}
                  <div className="pt-1 pb-0.5">
                    <div className="grid grid-cols-4 relative items-center">
                      {/* Connecting Line Track */}
                      <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#e3e2e0] -z-0" />
                      <div 
                        className="absolute top-3.5 left-4 h-0.5 bg-[#006c4a] transition-all duration-300 -z-0"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (STEPPER_STAGES.length - 1)) * 82}%`,
                        }}
                      />

                      {STEPPER_STAGES.map((stage, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <button
                            key={stage.key}
                            onClick={(e) => handleUpdateStepper(rfq.id, stage.key, e)}
                            className="group flex flex-col items-center text-center focus:outline-none transition-transform active:scale-95 z-10 cursor-pointer"
                            title={`Click to set status to ${stage.label}`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                                isCompleted
                                  ? 'bg-[#006c4a] text-white ring-2 ring-[#006c4a]/20'
                                  : isCurrent
                                  ? 'bg-[#006c4a] text-white ring-3 ring-[#85f8c4]/60 scale-105'
                                  : 'bg-white text-[#76777d] border-2 border-[#d2d1cf] group-hover:border-[#006c4a]'
                              }`}
                            >
                              {isCompleted ? (
                                <span className="material-symbols-outlined text-[14px]">check</span>
                              ) : (
                                <span className="material-symbols-outlined text-[13px]">{stage.icon}</span>
                              )}
                            </div>
                            <span
                              className={`text-[11px] font-bold mt-1 transition-colors ${
                                isCurrent
                                  ? 'text-[#006c4a]'
                                  : isCompleted
                                  ? 'text-[#1a1c1b]'
                                  : 'text-[#76777d]'
                              }`}
                            >
                              {stage.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* QUICK NOTES (INTERNAL MEMOS) SECTION PREVIEW */}
                <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#efeeec] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#b86f7a]">lock</span>
                      <span className="text-[11px] font-bold text-[#1a1c1b]">
                        Quick Notes ({internalNotes.length})
                      </span>
                      <span className="text-[10px] bg-[#ffd9dd] text-[#3a0915] font-semibold px-1.5 py-0.2 rounded">
                        Internal Brand Only
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInlineNoteOpenRFQId(isInlineNotesOpen ? null : rfq.id)}
                        className="text-[11px] text-[#006c4a] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isInlineNotesOpen ? 'expand_less' : 'add'}
                        </span>
                        <span>{isInlineNotesOpen ? 'Close' : 'Add Memo'}</span>
                      </button>

                      <button
                        onClick={() => openDetailModal(rfq, 'notes')}
                        className="text-[11px] text-[#45464d] hover:text-[#1a1c1b] font-semibold underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  {/* Latest note preview */}
                  {latestNote ? (
                    <div className="bg-white p-2 rounded-lg border border-[#e3e2e0] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#76777d]">
                        <span className="font-semibold text-[#1a1c1b]">
                          {latestNote.author} {latestNote.role ? `· ${latestNote.role}` : ''}
                        </span>
                        <span>{latestNote.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#1a1c1b] leading-tight line-clamp-2">
                        "{latestNote.text}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#76777d] italic">
                      No internal memos added. Brand team notes remain strictly hidden from factories.
                    </p>
                  )}

                  {/* Inline Quick Add Note Box */}
                  {isInlineNotesOpen && (
                    <form 
                      onSubmit={(e) => handleSaveInlineNote(rfq.id, e)}
                      className="pt-2 border-t border-[#efeeec] space-y-2 animate-in fade-in duration-150"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#1a1c1b]">Add Internal Memo:</span>
                        <select
                          value={inlineCategory}
                          onChange={e => setInlineCategory(e.target.value as QuickNote['category'])}
                          className="bg-white border border-[#d2d1cf] rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#1a1c1b] focus:outline-none"
                        >
                          <option value="General">General</option>
                          <option value="Budget">Budget</option>
                          <option value="QC / Formulation">QC / Formulation</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Timeline">Timeline</option>
                        </select>
                      </div>

                      <textarea
                        rows={2}
                        value={inlineNoteText}
                        onChange={e => setInlineNoteText(e.target.value)}
                        placeholder="Append private brand note (e.g. negotiation terms, QC check, budget clearance)..."
                        className="w-full text-xs p-2 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] placeholder:text-[#76777d] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                        autoFocus
                      />

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInlineNoteOpenRFQId(null);
                            setInlineNoteText('');
                          }}
                          className="px-2.5 py-1 text-xs text-[#45464d] hover:bg-[#efeeec] rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!inlineNoteText.trim()}
                          className="px-3 py-1 bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold rounded shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          Save Memo
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Quotes comparison drawer if quotes exist */}
                {rfqQuotes.length > 0 && (
                  <div className="p-3 bg-[#faf9f7] rounded-lg border border-[#e3e2e0] space-y-2">
                    <span className="text-[11px] font-bold text-[#1a1c1b] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#006c4a]">verified</span>
                      Received Factory Quote:
                    </span>
                    {rfqQuotes.map(q => (
                      <div key={q.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-[#efeeec]">
                        <div>
                          <p className="font-bold text-[#1a1c1b]">{q.factoryName}</p>
                          <p className="text-[10px] text-[#45464d]">
                            Lead Time: {q.leadTimeWeeks} Weeks · Min: {q.minimumBatchUnits.toLocaleString()} units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#006c4a] text-sm">₹{q.quotedUnitPrice.toFixed(2)}/u</p>
                          <p className="text-[10px] font-semibold text-[#45464d]">
                            ₹{q.quotedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post-Completion Rating Banner for Approved / Completed RFQs */}
                {isCompleted && (
                  <div className="p-3 bg-[#e6f7f0] rounded-xl border border-[#85f8c4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#00422d]">
                            CDSCO Formulation Batch Completed
                          </span>
                          {hasReviewed && reviewedItem && (
                            <span className="bg-[#006c4a] text-white text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                              <span>★ {reviewedItem.averageRating.toFixed(1)} Reviewed</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#006c4a] leading-tight mt-0.5">
                          {hasReviewed
                            ? 'Your post-completion verified rating on Communication, Lead Time & Quality is live on the factory public profile.'
                            : 'Rate this manufacturer on Communication, Lead Time & Quality to update public profile score.'}
                        </p>
                      </div>
                    </div>

                    {onOpenRateModal && (
                      <button
                        onClick={() => onOpenRateModal(targetFactory, rfq)}
                        className="px-3 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-bold text-xs shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {hasReviewed ? 'edit' : 'rate_review'}
                        </span>
                        <span>{hasReviewed ? 'Update Review' : 'Rate Factory'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-[#efeeec] flex-wrap gap-2">
                  <span className="text-[11px] text-[#45464d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#006c4a]">schedule</span>
                    {rfq.timeAgo} · {rfq.quotesCount} Quote{rfq.quotesCount !== 1 ? 's' : ''} Received
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onOpenRateModal && (isCompleted || rfqQuotes.length > 0) && (
                      <button
                        onClick={() => onOpenRateModal(targetFactory, rfq)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          hasReviewed
                            ? 'bg-[#85f8c4]/30 text-[#00422d] border border-[#85f8c4] hover:bg-[#85f8c4]/50'
                            : 'bg-[#006c4a] hover:bg-[#005137] text-white shadow-xs'
                        }`}
                        title={hasReviewed ? 'View or update your review' : 'Rate factory on Communication, Lead Time & Quality'}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {hasReviewed ? 'star' : 'rate_review'}
                        </span>
                        <span>{hasReviewed ? `Reviewed (★${reviewedItem?.averageRating.toFixed(1) || '5.0'})` : 'Rate Factory'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => openDetailModal(rfq, 'history')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="View Status Change History Log"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#006c4a]">history</span>
                      <span>History ({rfq.statusHistory?.length || 1})</span>
                    </button>

                    <button
                      onClick={() => openDetailModal(rfq, 'overview')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="View Full RFQ Details and Quick Notes"
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      <span>Details & Notes</span>
                    </button>

                    <button
                      onClick={() => onOpenMessage(rfq)}
                      className="px-3 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RFQ Detail Modal with Stepper, Quick Notes & History Log */}
      <RFQDetailModal
        isOpen={Boolean(activeDetailRFQ)}
        onClose={() => setSelectedRFQForDetail(null)}
        rfq={activeDetailRFQ}
        quotes={quotes}
        onOpenMessage={onOpenMessage}
        initialTab={detailModalInitialTab}
        onOpenRateFactory={onOpenRateModal}
      />
    </div>
  );
};
