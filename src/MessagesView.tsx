import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, RFQItem } from '../types';
import { rfqDb } from '../services/rfqDb';
import { useAuth } from '../context/AuthContext';

interface MessagesViewProps {
  selectedRFQ?: RFQItem | null;
  onOpenSpecsTool?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ selectedRFQ, onOpenSpecsTool }) => {
  const { currentUser, userRole } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => rfqDb.getMessages(selectedRFQ?.id));
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(rfqDb.getMessages(selectedRFQ?.id));
    const unsub = rfqDb.subscribe(() => {
      setMessages(rfqDb.getMessages(selectedRFQ?.id));
    });
    return () => unsub();
  }, [selectedRFQ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const senderRole = userRole;
    const senderName = currentUser?.displayName || (senderRole === 'factory' ? 'Aura Formulations QA' : 'Nyra Skin Labs');

    rfqDb.addMessage({
      rfqId: selectedRFQ?.id || 'rfq-nyra-01',
      senderId: currentUser?.uid || (senderRole === 'factory' ? 'factory-aura' : 'brand-nyra'),
      senderName,
      senderRole,
      text: text.trim(),
    });

    setText('');

    // If Brand sent, factory auto-replies after 1.5s with realistic CDSCO assurance
    if (senderRole === 'brand') {
      setTimeout(() => {
        rfqDb.addMessage({
          rfqId: selectedRFQ?.id || 'rfq-nyra-01',
          senderId: 'factory-aura',
          senderName: 'Rajesh Varma (Aura Formulations QA)',
          senderRole: 'factory',
          text: 'Understood. We are reviewing your formula requirements against our CDSCO Schedule M cleanroom standard. We will dispatch the 500ml pre-pilot sample within 48 hours.',
        });
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-4 py-2 pb-6">
      {/* Chat Header */}
      <div className="p-3 bg-white rounded-xl border border-[#efeeec] shadow-sm flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#006c4a] text-white flex items-center justify-center font-bold text-xs">
            {userRole === 'factory' ? 'NS' : 'AF'}
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1a1c1b]">
              {userRole === 'factory' ? 'Nyra Skin Labs (Brand)' : 'Aura Formulations (Factory)'}
            </h3>
            <p className="text-[11px] text-[#006c4a] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
              <span>Active RFQ Thread · 10% Niacinamide Serum</span>
            </p>
          </div>
        </div>

        {onOpenSpecsTool && (
          <button
            onClick={onOpenSpecsTool}
            className="px-2.5 py-1 rounded-lg bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[11px] font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">attachment</span>
            <span>COA Spec</span>
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {messages.map(msg => {
          const isMe = msg.senderRole === userRole;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                isMe ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] text-[#45464d] font-semibold">{msg.senderName}</span>
                <span className="text-[9px] text-[#76777d]">{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-[#000000] text-white rounded-br-none'
                    : 'bg-white border border-[#efeeec] text-[#1a1c1b] rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>

                {msg.hasAttachment && (
                  <div
                    onClick={onOpenSpecsTool}
                    className={`mt-2 p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                      isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-[#faf9f7] border border-[#efeeec] hover:bg-[#efeeec]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#006c4a]">
                      picture_as_pdf
                    </span>
                    <div className="text-[10px] overflow-hidden">
                      <p className="font-bold truncate">{msg.attachmentName}</p>
                      <p className={isMe ? 'text-white/70' : 'text-[#45464d]'}>348 KB · Signed COA Dossier</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="pt-2">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#c6c6cd] shadow-sm">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message ${userRole === 'factory' ? 'Nyra Skin Labs' : 'Aura Formulations'}...`}
            className="flex-1 px-3 py-1.5 text-xs outline-none bg-transparent text-[#1a1c1b]"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-9 h-9 rounded-xl bg-[#006c4a] text-white flex items-center justify-center hover:bg-[#005137] disabled:opacity-40 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
        </div>
      </form>
    </div>
  );
};
