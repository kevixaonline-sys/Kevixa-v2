import React, { useState } from 'react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const KEVIXA_FAQS: FAQItem[] = [
  {
    id: 'what-is-kevixa',
    category: 'Platform',
    question: 'What is Kevixa?',
    answer:
      'Kevixa is a digital B2B marketplace connecting Indian D2C beauty and cosmetic brands directly with CDSCO-certified contract manufacturers and private label labs.',
  },
  {
    id: 'how-verify-manufacturers',
    category: 'Verification',
    question: 'How does Kevixa verify manufacturers?',
    answer:
      'Factory owners must submit their valid CDSCO COS-8 Manufacturing License and business credentials. Verified factories receive a "CDSCO Verified" badge on their profile.',
  },
  {
    id: 'free-for-d2c-brands',
    category: 'Pricing',
    question: 'Is Kevixa free for D2C Brands?',
    answer:
      'Yes! Searching for factories, filtering by MOQs, and submitting Requests for Quotations (RFQs) is completely free for brands.',
  },
  {
    id: 'quality-and-shipping',
    category: 'Operations',
    question: 'Who handles manufacturing quality and shipping?',
    answer:
      'Quality standards, sample approvals, and transport/shipping logistics are negotiated and agreed upon directly between the brand and the manufacturer. Kevixa facilitates discovery and communications.',
  },
  {
    id: 'factory-order-leads',
    category: 'Factories',
    question: 'How do factory owners receive order leads?',
    answer:
      'Registered manufacturers can view incoming brand RFQs on their Factory Dashboard and submit customized quotes directly through the app.',
  },
];

interface FAQSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  defaultExpandedIndex?: number;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  id = 'faq-section',
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about CDSCO compliance, B2B quoting, and factory matchmaking',
  defaultExpandedIndex = 0,
}) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    [KEVIXA_FAQS[defaultExpandedIndex]?.id || '']: true,
  });

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleToggleAll = () => {
    const allOpen = KEVIXA_FAQS.every(f => openItems[f.id]);
    const newState: Record<string, boolean> = {};
    KEVIXA_FAQS.forEach(f => {
      newState[f.id] = !allOpen;
    });
    setOpenItems(newState);
  };

  const allOpen = KEVIXA_FAQS.every(f => openItems[f.id]);

  return (
    <section id={id} className="w-full space-y-3 pt-2">
      {/* FAQ Header with toggle all */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-lg">
              help_center
            </span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#45464d]">{subtitle}</p>
        </div>

        <button
          onClick={handleToggleAll}
          className="text-[11px] font-semibold text-[#006c4a] hover:text-[#005137] bg-[#85f8c4]/20 hover:bg-[#85f8c4]/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xs">
            {allOpen ? 'unfold_less' : 'unfold_more'}
          </span>
          <span>{allOpen ? 'Collapse All' : 'Expand All'}</span>
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {KEVIXA_FAQS.map((faq, index) => {
          const isOpen = !!openItems[faq.id];
          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white border-[#006c4a]/30 shadow-sm ring-1 ring-[#006c4a]/10'
                  : 'bg-white border-[#efeeec] hover:border-[#c6c6cd]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                className="w-full text-left p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 transition-colors ${
                      isOpen
                        ? 'bg-[#006c4a] text-white'
                        : 'bg-[#efeeec] text-[#45464d] group-hover:bg-[#c6c6cd]/50'
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <div>
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-xs sm:text-sm text-[#1a1c1b] group-hover:text-[#006c4a] transition-colors leading-snug block">
                      {faq.question}
                    </span>
                    <span className="text-[10px] font-medium text-[#76777d] uppercase tracking-wider mt-0.5 inline-block">
                      {faq.category}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-[#85f8c4]/30 text-[#006c4a] rotate-180'
                      : 'bg-[#efeeec] text-[#76777d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    expand_more
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 pt-0 border-t border-[#efeeec]/60 text-xs text-[#45464d] leading-relaxed animate-fadeIn">
                  <div className="p-3 bg-[#faf9f7] rounded-lg border border-[#efeeec] text-[#2c2d33] font-normal">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
