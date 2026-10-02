import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export type ChatRole = 'brand' | 'factory' | 'platform';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  sources?: { title: string; url: string }[];
  searchQueries?: string[];
  modelUsed?: string;
}

interface KevixaAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: ChatRole;
}

const STARTER_PROMPTS: Record<ChatRole, string[]> = {
  brand: [
    'How do I formulate an RFQ for 10,000 units of 10% Niacinamide serum?',
    'What are the CDSCO stability testing requirements for cosmetic lotions in India?',
    'Compare glass dropper pipettes vs airless pump bottles for active serums',
    'What is the typical cost per unit for 30ml vitamin C serum at 2,500 MOQ?',
  ],
  factory: [
    'What are the mandatory compliance documents for CDSCO Form COS-8 retention?',
    'What are the Schedule M-II cleanroom HVAC pressure requirements for skincare?',
    'How should I structure payment terms and batch changeover wastage in my quote?',
    'What is the difference between Form COS-8 and erstwhile Form 32 licenses?',
  ],
  platform: [
    'How does Kevixa Phase 1 Free Tier work for manufacturers and brands?',
    'How do I bookmark factories and submit a direct RFQ on Kevixa?',
    'Explain the Phase 2 monetization ₹500 Lead Unlock feature',
    'What is Kevixa’s intermediary legal liability under the IT Act 2000?',
  ],
};

export const KevixaAIChatModal: React.FC<KevixaAIChatModalProps> = ({
  isOpen,
  onClose,
  initialRole,
}) => {
  const { userRole } = useAuth();

  // Selected persona role
  const [activeRole, setActiveRole] = useState<ChatRole>(() => {
    if (initialRole) return initialRole;
    return userRole === 'factory' ? 'factory' : 'brand';
  });

  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Chat message histories partitioned by role
  const [conversations, setConversations] = useState<Record<ChatRole, ChatMessageItem[]>>({
    brand: [
      {
        id: 'msg-brand-init',
        role: 'model',
        text: 'Hello! I am your Kevixa Brand Copilot. Ask me anything about cosmetic formulations, active ingredients, CDSCO BIS standards, packaging selections, or finding the right manufacturer for your RFQ.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    factory: [
      {
        id: 'msg-factory-init',
        role: 'model',
        text: 'Welcome! I am your Kevixa Factory Advisory AI. I can assist you with CDSCO Form COS-8 licensing, Schedule M-II cGMP compliance, cleanroom standards, and pricing strategies for your quotes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    platform: [
      {
        id: 'msg-platform-init',
        role: 'model',
        text: 'Hi there! I am the Kevixa Platform Guide. Ask me anything about how Kevixa works, our Phase 1 Free Tier, the ₹500 Lead Unlock preview, or how to bookmark and send RFQs.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and scroll to bottom when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isLoading]);

  if (!isOpen) return null;

  const currentMessages = conversations[activeRole];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update conversation state with user message
    const updatedHistory = [...conversations[activeRole], userMsg];
    setConversations(prev => ({
      ...prev,
      [activeRole]: updatedHistory,
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation payload to server endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({
            role: m.role,
            text: m.text,
          })),
          role: activeRole,
          model: selectedModel,
          useSearch: useSearch && selectedModel === 'gemini-3.5-flash',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.groundingSources || [],
        searchQueries: data.webSearchQueries || [],
        modelUsed: data.modelUsed || selectedModel,
      };

      setConversations(prev => ({
        ...prev,
        [activeRole]: [...prev[activeRole], aiMsg],
      }));
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackErrorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'I encountered a temporary connection issue. Please check your query or verify server connectivity, then try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations(prev => ({
        ...prev,
        [activeRole]: [...prev[activeRole], fallbackErrorMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm(`Clear ${activeRole.toUpperCase()} conversation history?`)) {
      setConversations(prev => ({
        ...prev,
        [activeRole]: [
          {
            id: `msg-${activeRole}-reset`,
            role: 'model',
            text:
              activeRole === 'brand'
                ? 'Conversation reset. What formulation or sourcing challenge can I assist you with?'
                : activeRole === 'factory'
                ? 'Conversation reset. Ready to answer your CDSCO regulatory or quoting questions.'
                : 'Conversation reset. How can I help you explore Kevixa today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[90vh] max-h-[820px] flex flex-col shadow-2xl border border-[#c6c6cd]/50 overflow-hidden">
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-[#efeeec] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#006c4a] to-[#85f8c4] text-[#002114] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl font-bold">
                {activeRole === 'brand' && 'spa'}
                {activeRole === 'factory' && 'precision_manufacturing'}
                {activeRole === 'platform' && 'hub'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-chat-title" className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
                  {activeRole === 'brand' && 'Brand Sourcing Copilot'}
                  {activeRole === 'factory' && 'Factory Regulatory AI'}
                  {activeRole === 'platform' && 'Kevixa Platform Guide'}
                </h3>
                <span className="text-[10px] bg-[#85f8c4] text-[#002114] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse"></span>
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-[#76777d]">
                Powered by Google Gemini 3.5 with Live Search Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-[#76777d] hover:text-[#1a1c1b] hover:bg-[#efeeec] rounded-lg transition-colors cursor-pointer"
              title="Clear conversation"
              aria-label="Clear chat history"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-[#c6c6cd]/50 text-[#45464d] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close AI Assistant"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="px-3 pt-2.5 pb-2 bg-[#faf9f7] border-b border-[#efeeec] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveRole('brand')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeRole === 'brand'
                  ? 'bg-[#006c4a] text-white shadow-xs'
                  : 'bg-white text-[#45464d] border border-[#efeeec] hover:border-[#c6c6cd]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">spa</span>
              <span>For Brands</span>
            </button>

            <button
              onClick={() => setActiveRole('factory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeRole === 'factory'
                  ? 'bg-[#006c4a] text-white shadow-xs'
                  : 'bg-white text-[#45464d] border border-[#efeeec] hover:border-[#c6c6cd]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              <span>For Factories</span>
            </button>

            <button
              onClick={() => setActiveRole('platform')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeRole === 'platform'
                  ? 'bg-[#006c4a] text-white shadow-xs'
                  : 'bg-white text-[#45464d] border border-[#efeeec] hover:border-[#c6c6cd]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">hub</span>
              <span>About Kevixa</span>
            </button>
          </div>

          {/* Model / Search Toggle Controls */}
          <div className="flex items-center gap-2 text-[11px] text-[#76777d] shrink-0">
            <button
              onClick={() => setUseSearch(prev => !prev)}
              className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                useSearch
                  ? 'bg-[#85f8c4]/30 border-[#006c4a]/30 text-[#006c4a] font-semibold'
                  : 'bg-white border-[#efeeec] text-[#76777d]'
              }`}
              title="Enable or disable Google Search Grounding for fresh regulatory & web data"
            >
              <span className="material-symbols-outlined text-xs">travel_explore</span>
              <span>Google Search {useSearch ? 'ON' : 'OFF'}</span>
            </button>

            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value as 'gemini-3.5-flash' | 'gemini-3.1-flash-lite')}
              className="bg-white border border-[#efeeec] rounded-lg px-2 py-1 text-[11px] text-[#45464d] outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#faf9f7]/40 text-xs">
          {currentMessages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#006c4a] text-white flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-base">smart_toy</span>
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#000000] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#1a1c1b] border border-[#efeeec] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Grounding Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#efeeec] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c4a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">link</span>
                          Google Search Sources ({msg.sources.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-[#faf9f7] hover:bg-[#efeeec] text-[#006c4a] font-medium px-2 py-0.5 rounded border border-[#efeeec] truncate max-w-[220px] transition-colors inline-block"
                            >
                              {src.title || src.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`text-[10px] text-[#76777d] px-1 flex items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[9px] uppercase">{msg.modelUsed}</span>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#efeeec] text-[#1a1c1b] flex items-center justify-center shrink-0 text-xs mt-0.5 font-bold">
                    <span className="material-symbols-outlined text-base">person</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-center justify-start animate-fadeIn">
              <div className="w-7 h-7 rounded-lg bg-[#006c4a] text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-[#efeeec] shadow-xs flex items-center gap-2 text-[#45464d] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-[#76777d] ml-1">
                  {useSearch ? 'Searching Google & reasoning...' : 'Consulting Gemini AI...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        <div className="px-3 pt-2 bg-white border-t border-[#efeeec] shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-[#76777d] mb-1 font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-xs text-[#006c4a]">lightbulb</span>
            <span>Suggested questions:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {STARTER_PROMPTS[activeRole].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] bg-[#faf9f7] hover:bg-[#efeeec] text-[#45464d] hover:text-[#1a1c1b] px-2.5 py-1 rounded-full border border-[#efeeec] transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white shrink-0"
        >
          <div className="flex items-center gap-2 bg-[#faf9f7] rounded-xl border border-[#c6c6cd] p-1.5 focus-within:border-[#006c4a] focus-within:ring-2 focus-within:ring-[#006c4a]/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={`Ask the ${
                activeRole === 'brand' ? 'Brand Copilot' : activeRole === 'factory' ? 'Factory Regulatory AI' : 'Kevixa Guide'
              }...`}
              disabled={isLoading}
              className="flex-1 bg-transparent px-2.5 text-xs text-[#1a1c1b] placeholder:text-[#76777d] outline-none"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-lg bg-[#006c4a] hover:bg-[#005137] disabled:bg-[#c6c6cd] text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
              aria-label="Send Message"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#76777d] mt-1.5 px-1">
            <span>Ask questions on formulations, CDSCO compliance, and app workflows.</span>
            <span>Esc to exit</span>
          </div>
        </form>
      </div>
    </div>
  );
};
