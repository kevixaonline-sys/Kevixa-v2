import React, { useState, useEffect } from 'react';
import { RFQItem, RFQQuote, QuickNote, RFQStepperStatus, RFQHistoryEntry, FactoryListing } from '../types';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';

export type DetailTab = 'overview' | 'notes' | 'history' | 'quotes';

interface RFQDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQItem | null;
  quotes: RFQQuote[];
  onOpenMessage: (rfq: RFQItem) => void;
  initialTab?: DetailTab;
  onOpenRateFactory?: (factory: FactoryListing, rfq?: RFQItem) => void;
}

const STEPPER_STEPS: Array<{ key: RFQStepperStatus; label: string; desc: string; icon: string }> = [
  { key: 'Draft', label: 'Draft', desc: 'Brief created', icon: 'edit_document' },
  { key: 'Submitted', label: 'Submitted', desc: 'Live on CDSCO board', icon: 'send' },
  { key: 'Negotiating', label: 'Negotiating', desc: 'Reviewing quotes', icon: 'handshake' },
  { key: 'Approved', label: 'Approved', desc: 'Contract ready', icon: 'verified' },
];

const PRESET_NOTE_PROMPTS = [
  'QC lab sample requested for batch viscosity check',
  'Approved unit target counter-offer at ₹32/u',
  'Management approved expanding batch to 15k units',
  'Awaiting Schedule M compliance certificate from factory',
  'Followed up on custom airless packaging lead time',
];

export const RFQDetailModal: React.FC<RFQDetailModalProps> = ({
  isOpen,
  onClose,
  rfq,
  quotes,
  onOpenMessage,
  initialTab = 'overview',
  onOpenRateFactory,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickNote['category']>('General');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // History Tab specific states
  const [historyCustomNote, setHistoryCustomNote] = useState('');
  const [historyTargetStatus, setHistoryTargetStatus] = useState<RFQStepperStatus>('Negotiating');
  const [copiedAuditTrail, setCopiedAuditTrail] = useState(false);

  // Sync activeTab if initialTab changes on open
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !rfq) return null;

  const currentStepperStatus: RFQStepperStatus = rfq.stepperStatus || (rfq.quotesCount > 0 ? 'Negotiating' : 'Submitted');
  const currentStepIdx = STEPPER_STEPS.findIndex(s => s.key === currentStepperStatus);
  const rfqQuotes = quotes.filter(q => q.rfqId === rfq.id);
  const internalNotes = rfq.internalNotes || [];
  const statusHistory = rfq.statusHistory || [];

  const handleUpdateStatus = (newStatus: RFQStepperStatus, customReason?: string) => {
    const authorName = currentUser?.displayName || currentUser?.companyName || 'Brand Procurement Team';
    const authorRole = currentUser?.role === 'brand' ? 'Brand Team' : 'Procurement Desk';

    rfqDb.updateRFQStepperStatus(rfq.id, newStatus, authorName, authorRole, customReason);
    showNotice(`Status updated to "${newStatus}" & logged in History`);
  };

  const handleManualHistoryTransition = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateStatus(historyTargetStatus, historyCustomNote.trim() || undefined);
    setHistoryCustomNote('');
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    const authorName = currentUser?.displayName || currentUser?.companyName || 'Brand Procurement';
    const authorRole = currentUser?.role === 'brand' ? 'Brand Team' : 'Procurement Desk';

    rfqDb.addInternalNote(rfq.id, {
      text: newNoteText.trim(),
      author: authorName,
      role: authorRole,
      category: selectedCategory,
    });

    setNewNoteText('');
    setIsSubmittingNote(false);
    showNotice('Internal memo saved securely');
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Delete this internal memo?')) {
      rfqDb.deleteInternalNote(rfq.id, noteId);
      showNotice('Internal memo removed');
    }
  };

  const handleApplyPreset = (preset: string) => {
    setNewNoteText(prev => (prev ? `${prev}. ${preset}` : preset));
  };

  const showNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 2500);
  };

  const handleCopyAuditTrail = () => {
    const lines = [
      `=== RFQ STATUS AUDIT TRAIL: ${rfq.productName.toUpperCase()} ===`,
      `RFQ ID: ${rfq.id}`,
      `Brand: ${rfq.brandName} (${rfq.brandLocation})`,
      `Current Status: ${currentStepperStatus}`,
      `Total Logged Status Changes: ${statusHistory.length}`,
      `Export Timestamp: ${new Date().toLocaleString('en-IN')}`,
      ``,
      `--- TIMELINE OF STATUS CHANGES ---`,
    ];

    statusHistory.forEach((entry, idx) => {
      lines.push(
        `#${statusHistory.length - idx} [${entry.fromStatus || 'Draft'} → ${entry.toStatus}]`,
        `  Timestamp: ${entry.timestamp} (${entry.relativeTime || 'Recorded'})`
      );
      if (entry.durationInPrevStatus) {
        lines.push(`  Time in previous status: ${entry.durationInPrevStatus}`);
      }
      lines.push(
        `  Initiated By: ${entry.changedBy}${entry.role ? ` (${entry.role})` : ''}`,
        `  Note / Reason: ${entry.note || 'No additional note'}`,
        ``
      );
    });

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(lines.join('\n'));
    }
    setCopiedAuditTrail(true);
    showNotice('Audit trail copied to clipboard');
    setTimeout(() => setCopiedAuditTrail(false), 2000);
  };

  const getCategoryBadgeClass = (category?: QuickNote['category']) => {
    switch (category) {
      case 'Budget':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'QC / Formulation':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Negotiation':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Timeline':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getStatusPillClass = (status: RFQStepperStatus | string) => {
    switch (status) {
      case 'Draft':
        return 'bg-zinc-100 text-zinc-700 border-zinc-300';
      case 'Submitted':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Negotiating':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getStatusIcon = (status: RFQStepperStatus | string) => {
    switch (status) {
      case 'Draft':
        return 'edit_document';
      case 'Submitted':
        return 'send';
      case 'Negotiating':
        return 'handshake';
      case 'Approved':
        return 'verified';
      default:
        return 'radio_button_checked';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#faf9f7] w-full max-w-3xl max-h-[94vh] rounded-2xl shadow-2xl border border-[#e3e2e0] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-detail-title"
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#efeeec] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="rfq-detail-title" className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                  {rfq.productName}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#85f8c4]/30 text-[#00422d] px-2 py-0.5 rounded">
                  {rfq.formulationType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPillClass(currentStepperStatus)}`}>
                  {currentStepperStatus}
                </span>
              </div>
              <p className="text-xs text-[#45464d] mt-0.5">
                ID: <span className="font-mono">{rfq.id}</span> · Brand: <strong className="text-[#1a1c1b]">{rfq.brandName}</strong> ({rfq.brandLocation})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#45464d] hover:text-[#1a1c1b] transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Global Action Notice Toast */}
        {actionSuccessMsg && (
          <div className="bg-[#006c4a] text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-1.5 shadow-inner animate-in fade-in slide-in-from-top-1 duration-150 sticky top-0 z-30">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* PERSISTENT VISUAL STATUS STEPPER BANNER */}
        <div className="px-4 py-3 bg-white border-b border-[#efeeec] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">timeline</span>
              <span className="text-xs font-bold text-[#1a1c1b]">RFQ Lifecycle Progress</span>
              <span className="text-[10px] text-[#76777d] hidden sm:inline">(Click any stage to update & log transition)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#45464d]">
                Updated: <strong className="text-[#1a1c1b]">{statusHistory[0]?.relativeTime || 'Recently'}</strong>
              </span>
              <span className="text-[11px] font-bold bg-[#006c4a]/10 text-[#006c4a] px-2.5 py-0.5 rounded-full border border-[#006c4a]/20">
                {currentStepperStatus}
              </span>
            </div>
          </div>

          {/* Stepper Graphic */}
          <div className="grid grid-cols-4 relative pt-1 pb-1">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e3e2e0] -z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-[#006c4a] transition-all duration-300 -z-0"
              style={{
                width: `${(Math.max(0, currentStepIdx) / (STEPPER_STEPS.length - 1)) * 84}%`,
              }}
            />

            {STEPPER_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <button
                  key={step.key}
                  onClick={() => handleUpdateStatus(step.key)}
                  className="group flex flex-col items-center text-center focus:outline-none transition-transform active:scale-95 z-10 cursor-pointer"
                  title={`Click to set stage to ${step.label} (logs timestamped change)`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-[#006c4a] text-white ring-2 ring-[#006c4a]/20'
                        : isCurrent
                        ? 'bg-[#006c4a] text-white ring-4 ring-[#85f8c4]/60 scale-110'
                        : 'bg-white text-[#76777d] border-2 border-[#d2d1cf] group-hover:border-[#006c4a]'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] sm:text-[15px]">{step.icon}</span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] sm:text-[12px] font-bold mt-1 transition-colors ${
                      isCurrent
                        ? 'text-[#006c4a]'
                        : isCompleted
                        ? 'text-[#1a1c1b]'
                        : 'text-[#76777d]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[9px] text-[#45464d] hidden sm:block">
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TABS NAVIGATION BAR */}
        <div className="bg-[#f4f3f1] border-b border-[#efeeec] px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#006c4a] text-[#006c4a] bg-white rounded-t-lg'
                : 'border-transparent text-[#45464d] hover:text-[#1a1c1b] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Overview & Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'notes'
                ? 'border-[#006c4a] text-[#006c4a] bg-white rounded-t-lg'
                : 'border-transparent text-[#45464d] hover:text-[#1a1c1b] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#b86f7a]">lock</span>
            <span>Quick Notes</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'notes' ? 'bg-[#b86f7a]/20 text-[#3a0915]' : 'bg-[#e3e2e0] text-[#45464d]'
            }`}>
              {internalNotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#006c4a] text-[#006c4a] bg-white rounded-t-lg'
                : 'border-transparent text-[#45464d] hover:text-[#1a1c1b] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>History Log</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'history' ? 'bg-[#006c4a]/20 text-[#006c4a]' : 'bg-[#e3e2e0] text-[#45464d]'
            }`}>
              {statusHistory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'quotes'
                ? 'border-[#006c4a] text-[#006c4a] bg-white rounded-t-lg'
                : 'border-transparent text-[#45464d] hover:text-[#1a1c1b] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Quotes</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'quotes' ? 'bg-[#006c4a]/20 text-[#006c4a]' : 'bg-[#e3e2e0] text-[#45464d]'
            }`}>
              {rfqQuotes.length}
            </span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Pricing & Commercial Summary Card */}
              <div className="bg-white p-4 rounded-xl border border-[#efeeec] shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#45464d] tracking-wider block">Commercial Target</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-bold font-mono text-[#006c4a]">
                        ₹{rfq.targetUnitPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#45464d]">/ unit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#45464d] tracking-wider block">Estimated Total</span>
                      <span className="text-base font-bold font-mono text-[#1a1c1b]">
                        ₹{rfq.estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#45464d] tracking-wider block">Batch Quantity</span>
                      <span className="text-base font-bold text-[#1a1c1b]">
                        {rfq.quantity.toLocaleString()} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Formulation Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#efeeec]">
                  <div className="bg-[#f4f3f1] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#45464d] block">Packaging Spec</span>
                    <span className="text-xs font-bold text-[#1a1c1b] truncate block mt-0.5" title={rfq.packageType}>
                      {rfq.packageType}
                    </span>
                  </div>
                  <div className="bg-[#f4f3f1] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#45464d] block">Target Lead Time</span>
                    <span className="text-xs font-bold text-[#1a1c1b] block mt-0.5">
                      {rfq.targetLeadTime}
                    </span>
                  </div>
                  <div className="bg-[#f4f3f1] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#45464d] block">Urgency Level</span>
                    <span className="text-xs font-bold text-[#1a1c1b] block mt-0.5 capitalize">
                      {rfq.urgency.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-[#f4f3f1] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#45464d] block">Verified Quotes</span>
                    <span className="text-xs font-bold text-[#006c4a] block mt-0.5">
                      {rfq.quotesCount} Received
                    </span>
                  </div>
                </div>

                {/* Compliance & Standards */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider block mb-1.5">
                    Certifications & Formulation Attributes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rfq.certifications.map((c, i) => (
                      <span key={i} className="text-[11px] bg-[#efeeec] text-[#1a1c1b] px-2.5 py-0.5 rounded-md font-medium border border-[#e3e2e0]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public Brief */}
                {rfq.notes && (
                  <div className="bg-[#faf9f7] p-3 rounded-lg border border-[#e3e2e0] text-xs text-[#45464d] space-y-1">
                    <span className="font-bold text-[#1a1c1b] flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-[#006c4a]">public</span>
                      Public Brief (Visible to CDSCO Cleanroom Manufacturers):
                    </span>
                    <p className="text-xs text-[#1a1c1b] leading-relaxed">
                      {rfq.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Status & History Quick Preview Box */}
              <div className="bg-white p-4 rounded-xl border border-[#efeeec] shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006c4a]">history</span>
                    Recent Status History ({statusHistory.length} events logged)
                  </h4>
                  <p className="text-[11px] text-[#45464d] mt-0.5">
                    Last moved to <strong className="text-[#1a1c1b]">{currentStepperStatus}</strong> {statusHistory[0]?.relativeTime || 'recently'}
                    {statusHistory[0]?.durationInPrevStatus ? ` (${statusHistory[0].durationInPrevStatus})` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-3 py-1.5 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Open History Log</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              {/* Quick Notes Preview Box */}
              <div className="bg-white p-4 rounded-xl border border-[#efeeec] shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#b86f7a]">lock</span>
                    Internal Brand Notes ({internalNotes.length} memos)
                  </h4>
                  <p className="text-[11px] text-[#45464d] mt-0.5">
                    {internalNotes.length > 0 
                      ? `Latest memo by ${internalNotes[0].author}: "${internalNotes[0].text.slice(0, 50)}..."` 
                      : 'No private notes appended yet. Strictly confidential to brand team.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="px-3 py-1.5 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Open Quick Notes</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK NOTES (INTERNAL MEMOS) */}
          {activeTab === 'notes' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#efeeec] shadow-xs space-y-4 animate-in fade-in duration-150">
              {/* Header with Private Confidential Notice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#efeeec]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px] text-[#b86f7a]">lock</span>
                      Quick Notes (Internal Brand Memos)
                    </h4>
                    <span className="text-[10px] font-bold bg-[#b86f7a]/15 text-[#3a0915] px-2 py-0.5 rounded-full border border-[#b86f7a]/30">
                      Confidential
                    </span>
                  </div>
                  <p className="text-xs text-[#45464d] mt-0.5">
                    Internal notes strictly for your brand team. Never shared or visible to manufacturers.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#85f8c4]/20 border border-[#85f8c4]/40 px-2.5 py-1 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#006c4a]">visibility_off</span>
                  <span className="text-[10px] font-bold text-[#00422d]">Manufacturer View Protected</span>
                </div>
              </div>

              {/* Note Creation Box */}
              <form onSubmit={handleAddNote} className="space-y-3 bg-[#faf9f7] p-3.5 rounded-xl border border-[#e3e2e0]">
                <div className="flex items-center justify-between">
                  <label htmlFor="memo-textarea" className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">edit_note</span>
                    Append New Internal Memo
                  </label>
                  
                  {/* Category Selector */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[11px] text-[#45464d]">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value as QuickNote['category'])}
                      className="text-xs font-semibold bg-white border border-[#d2d1cf] rounded-md px-2 py-1 text-[#1a1c1b] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Budget">Budget</option>
                      <option value="QC / Formulation">QC / Formulation</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Timeline">Timeline</option>
                    </select>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  id="memo-textarea"
                  rows={2}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Append internal memo (e.g. sample viscosity feedback, budget approval status, negotiation counter-offers, team sign-offs)..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#d2d1cf] bg-white text-[#1a1c1b] placeholder:text-[#76777d] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none transition-all"
                />

                {/* Quick Snippet Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#76777d] font-semibold block">Quick Snippets:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_NOTE_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(prompt)}
                        className="text-[10px] bg-white hover:bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b] px-2 py-0.5 rounded-md border border-[#d2d1cf] transition-colors cursor-pointer"
                      >
                        + {prompt.slice(0, 36)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#76777d]">
                    Posting as: <strong className="text-[#1a1c1b]">{currentUser?.displayName || 'Brand Procurement'}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || isSubmittingNote}
                    className="px-3 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold flex items-center gap-1 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Save Internal Memo</span>
                  </button>
                </div>
              </form>

              {/* List of Existing Quick Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1a1c1b] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#45464d]">history_edu</span>
                    Internal Memos ({internalNotes.length})
                  </span>
                  <span className="text-[10px] text-[#76777d]">Newest first</span>
                </div>

                {internalNotes.length === 0 ? (
                  <div className="p-6 text-center bg-[#faf9f7] rounded-xl border border-dashed border-[#d2d1cf] space-y-1">
                    <span className="material-symbols-outlined text-2xl text-[#76777d]">notes</span>
                    <p className="text-xs font-semibold text-[#1a1c1b]">No internal memos appended yet</p>
                    <p className="text-[11px] text-[#76777d]">
                      Add your team's confidential negotiations, QC test observations, or budgeting sign-offs above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {internalNotes.map(note => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] hover:border-[#d2d1cf] transition-colors flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getCategoryBadgeClass(note.category)}`}>
                              {note.category || 'General'}
                            </span>
                            <span className="font-bold text-[#1a1c1b]">
                              {note.author}
                            </span>
                            {note.role && (
                              <span className="text-[10px] text-[#76777d]">
                                · {note.role}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#76777d]">
                              {note.timestamp}
                            </span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-[#76777d] hover:text-[#b86f7a] p-0.5 rounded transition-colors cursor-pointer"
                              title="Delete memo"
                              aria-label="Delete memo"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#1a1c1b] leading-relaxed pl-1 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY LOG (STATUS CHANGE AUDIT TRAIL) */}
          {activeTab === 'history' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#efeeec] shadow-xs space-y-4 animate-in fade-in duration-150">
              {/* Header and Summary KPIs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#efeeec]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px] text-[#006c4a]">history</span>
                      RFQ Status Change History Log
                    </h4>
                    <span className="text-[10px] font-bold bg-[#006c4a]/10 text-[#006c4a] px-2 py-0.5 rounded-full border border-[#006c4a]/20">
                      Audit Trail
                    </span>
                  </div>
                  <p className="text-xs text-[#45464d] mt-0.5">
                    Complete transparency with exact timestamps for when this RFQ moved between Draft, Submitted, Negotiating, and Approved.
                  </p>
                </div>

                <button
                  onClick={handleCopyAuditTrail}
                  className="px-3 py-1.5 bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                  title="Copy full history log to clipboard for procurement documentation"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copiedAuditTrail ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedAuditTrail ? 'Copied!' : 'Copy Audit Trail'}</span>
                </button>
              </div>

              {/* Status KPI Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#faf9f7] p-2.5 rounded-xl border border-[#efeeec]">
                  <span className="text-[10px] uppercase font-bold text-[#45464d] block">Current Stage</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusPillClass(currentStepperStatus)}`}>
                      {currentStepperStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-[#faf9f7] p-2.5 rounded-xl border border-[#efeeec]">
                  <span className="text-[10px] uppercase font-bold text-[#45464d] block">Logged Transitions</span>
                  <span className="text-sm font-bold text-[#1a1c1b] block mt-0.5">
                    {statusHistory.length} State Change{statusHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-[#faf9f7] p-2.5 rounded-xl border border-[#efeeec]">
                  <span className="text-[10px] uppercase font-bold text-[#45464d] block">Last Status Update</span>
                  <span className="text-xs font-bold text-[#1a1c1b] block mt-0.5 truncate" title={statusHistory[0]?.timestamp}>
                    {statusHistory[0]?.relativeTime || 'Recently'}
                  </span>
                </div>

                <div className="bg-[#faf9f7] p-2.5 rounded-xl border border-[#efeeec]">
                  <span className="text-[10px] uppercase font-bold text-[#45464d] block">Pipeline Age</span>
                  <span className="text-xs font-bold text-[#006c4a] block mt-0.5">
                    {rfq.timeAgo || 'Active'}
                  </span>
                </div>
              </div>

              {/* Fast Transition Form with Reason Memo */}
              <form onSubmit={handleManualHistoryTransition} className="bg-[#faf9f7] p-3 rounded-xl border border-[#e3e2e0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1c1b] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c4a]">sync_alt</span>
                    Advance or Transition Status
                  </span>
                  <span className="text-[10px] text-[#76777d]">Records timestamp & user automatically</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4 flex items-center gap-1.5">
                    <label htmlFor="history-target-status" className="text-xs font-semibold text-[#45464d] shrink-0">
                      New Stage:
                    </label>
                    <select
                      id="history-target-status"
                      value={historyTargetStatus}
                      onChange={e => setHistoryTargetStatus(e.target.value as RFQStepperStatus)}
                      className="w-full text-xs font-bold bg-white border border-[#d2d1cf] rounded-md px-2 py-1.5 text-[#1a1c1b] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted (Live on CDSCO)</option>
                      <option value="Negotiating">Negotiating (Quote Review)</option>
                      <option value="Approved">Approved (Ready to Contract)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-8 flex gap-1.5">
                    <input
                      type="text"
                      value={historyCustomNote}
                      onChange={e => setHistoryCustomNote(e.target.value)}
                      placeholder="Optional memo (e.g. quote accepted, batch viscosity verified)..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[#d2d1cf] bg-white text-[#1a1c1b] placeholder:text-[#76777d] focus:border-[#006c4a] focus:ring-1 focus:ring-[#006c4a] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-bold rounded-md shadow-xs shrink-0 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">update</span>
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Vertical Audit Trail Timeline */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1a1c1b] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#45464d]">checklist</span>
                    Timestamped Transition Log ({statusHistory.length})
                  </span>
                  <span className="text-[10px] text-[#76777d]">Chronological (Newest First)</span>
                </div>

                {statusHistory.length === 0 ? (
                  <div className="p-8 text-center bg-[#faf9f7] rounded-xl border border-dashed border-[#d2d1cf] space-y-1">
                    <span className="material-symbols-outlined text-2xl text-[#76777d]">history</span>
                    <p className="text-xs font-semibold text-[#1a1c1b]">No status transitions logged yet</p>
                    <p className="text-[11px] text-[#76777d]">
                      Status updates will appear here with full timestamps whenever this quote advances.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e3e2e0]">
                    {statusHistory.map((entry, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div key={entry.id} className="relative group">
                          {/* Timeline node icon */}
                          <div 
                            className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white ring-4 ring-[#faf9f7] shadow-xs ${
                              isLatest ? 'bg-[#006c4a] scale-110' : 'bg-[#76777d]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {getStatusIcon(entry.toStatus)}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                            isLatest 
                              ? 'bg-white border-[#006c4a]/30 shadow-xs' 
                              : 'bg-[#faf9f7] border-[#e3e2e0]'
                          }`}>
                            {/* Transition Badges & Timestamps */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {entry.fromStatus && (
                                  <>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusPillClass(entry.fromStatus)}`}>
                                      {entry.fromStatus}
                                    </span>
                                    <span className="material-symbols-outlined text-[13px] text-[#76777d]">
                                      arrow_forward
                                    </span>
                                  </>
                                )}
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border shadow-2xs ${getStatusPillClass(entry.toStatus)}`}>
                                  {entry.toStatus}
                                </span>

                                {isLatest && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[#006c4a] text-white px-1.5 py-0.2 rounded">
                                    Current Active
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-[#76777d]">
                                <span className="flex items-center gap-1 font-mono text-[#1a1c1b]">
                                  <span className="material-symbols-outlined text-[13px] text-[#006c4a]">schedule</span>
                                  {entry.timestamp}
                                </span>
                                {entry.relativeTime && (
                                  <span className="text-[10px] text-[#76777d]">
                                    ({entry.relativeTime})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Duration In Previous Status */}
                            {entry.durationInPrevStatus && (
                              <div className="flex items-center gap-1 text-[11px] text-[#45464d] bg-white/70 px-2 py-0.5 rounded border border-[#efeeec] w-fit">
                                <span className="material-symbols-outlined text-[13px] text-amber-600">hourglass_top</span>
                                <span>Elapsed time: <strong>{entry.durationInPrevStatus}</strong></span>
                              </div>
                            )}

                            {/* Note / Reason Description */}
                            {entry.note && (
                              <p className="text-xs text-[#1a1c1b] leading-relaxed pl-0.5">
                                {entry.note}
                              </p>
                            )}

                            {/* Footer / Actor Info */}
                            <div className="flex items-center justify-between text-[10px] text-[#76777d] pt-1 border-t border-[#efeeec]">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">person</span>
                                Action taken by: <strong className="text-[#1a1c1b]">{entry.changedBy}</strong>
                                {entry.role && <span> · {entry.role}</span>}
                              </span>
                              <span className="font-mono text-[9px] text-[#76777d]">
                                Event #{statusHistory.length - idx}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FACTORY QUOTES */}
          {activeTab === 'quotes' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#006c4a]">verified</span>
                  Received Factory Quotes ({rfqQuotes.length})
                </span>
                <span className="text-xs text-[#45464d]">
                  CDSCO Verified Cleanrooms
                </span>
              </div>

              {rfqQuotes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#d2d1cf] space-y-2">
                  <span className="material-symbols-outlined text-3xl text-[#76777d]">hourglass_empty</span>
                  <p className="text-xs font-bold text-[#1a1c1b]">Awaiting manufacturer quotes</p>
                  <p className="text-[11px] text-[#76777d] max-w-sm mx-auto">
                    Cleanrooms in Baddi, Pune, and Haridwar review public specs and typically respond within 24 hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rfqQuotes.map(q => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-white rounded-xl border border-[#efeeec] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#1a1c1b] text-sm">{q.factoryName}</p>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#85f8c4]/30 text-[#00422d]">
                            Schedule M Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-[#45464d]">
                          Lead Time: <strong className="text-[#1a1c1b]">{q.leadTimeWeeks} Weeks</strong> · Min Batch MOQ: <strong className="text-[#1a1c1b]">{q.minimumBatchUnits.toLocaleString()} units</strong>
                        </p>
                        <p className="text-[10px] text-[#76777d]">
                          Payment: {q.paymentTerms}
                        </p>
                        {q.notes && (
                          <p className="text-[11px] text-[#1a1c1b] bg-[#faf9f7] p-2 rounded border border-[#e3e2e0] italic">
                            "{q.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right flex flex-col sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#efeeec]">
                        <div>
                          <span className="font-bold text-[#006c4a] text-lg font-mono">₹{q.quotedUnitPrice.toFixed(2)}/u</span>
                          <p className="text-[10px] font-semibold text-[#45464d]">
                            Total: ₹{q.quotedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleUpdateStatus('Negotiating', `Negotiating commercial terms with ${q.factoryName} (₹${q.quotedUnitPrice}/u)`);
                              setActiveTab('history');
                            }}
                            className="px-2.5 py-1 bg-[#f4f3f1] hover:bg-[#e3e2e0] text-[#1a1c1b] rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Move status to Negotiating and log quote review"
                          >
                            <span className="material-symbols-outlined text-[13px]">handshake</span>
                            <span>Negotiate</span>
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenMessage(rfq);
                            }}
                            className="px-3 py-1 bg-[#006c4a] hover:bg-[#005137] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                            <span>Chat</span>
                          </button>
                          {onOpenRateFactory && (
                            <button
                              onClick={() => {
                                const f = rfqDb.getFactoryById(q.factoryId) || rfqDb.getFactories()[0];
                                onClose();
                                onOpenRateFactory(f, rfq);
                              }}
                              className="px-2.5 py-1 bg-[#85f8c4]/30 hover:bg-[#85f8c4]/50 text-[#00422d] border border-[#85f8c4] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Rate factory on Communication, Lead Time & Quality"
                            >
                              <span className="material-symbols-outlined text-[13px]">rate_review</span>
                              <span>Rate Factory</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-[#efeeec] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMessage(rfq);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Open Factory Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'history' ? 'bg-[#006c4a]/10 text-[#006c4a]' : 'text-[#45464d] hover:bg-[#efeeec]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span className="hidden sm:inline">View Full History ({statusHistory.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1a1c1b] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
