/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { FactoryView } from './components/FactoryView';
import { BrandView } from './components/BrandView';
import { ExploreView } from './components/ExploreView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { CreateRFQModal } from './components/CreateRFQModal';
import { QuoteModal } from './components/QuoteModal';
import { LicenseCertificateModal } from './components/LicenseCertificateModal';
import { FormulaCalculatorModal } from './components/FormulaCalculatorModal';
import { SpecsSheetModal } from './components/SpecsSheetModal';
import { ProFormaModal } from './components/ProFormaModal';
import { AuthModal } from './components/AuthModal';
import { FactoryOnboardingModal } from './components/FactoryOnboardingModal';
import { LeadUnlockModal } from './components/LeadUnlockModal';
import { KevixaAIChatModal } from './components/KevixaAIChatModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PostCompletionReviewModal } from './components/PostCompletionReviewModal';
import { rfqDb } from './services/rfqDb';
import { RFQItem, FactoryListing } from './types';

const MainApp: React.FC = () => {
  const { userRole, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('my-rfqs');
  const [rfqs, setRfqs] = useState<RFQItem[]>(() => rfqDb.getRFQs());
  const [quotes, setQuotes] = useState(() => rfqDb.getAllQuotes());

  // Modal visibility states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFactoryOnboardingModalOpen, setIsFactoryOnboardingModalOpen] = useState(false);
  const [isLeadUnlockModalOpen, setIsLeadUnlockModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isCreateRFQModalOpen, setIsCreateRFQModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isFormulaCalculatorModalOpen, setIsFormulaCalculatorModalOpen] = useState(false);
  const [isSpecsSheetModalOpen, setIsSpecsSheetModalOpen] = useState(false);
  const [isProFormaModalOpen, setIsProFormaModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Selected entities for modals
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<RFQItem | null>(null);
  const [selectedRFQForMessage, setSelectedRFQForMessage] = useState<RFQItem | null>(null);
  const [selectedRFQForInvoice, setSelectedRFQForInvoice] = useState<RFQItem | null>(null);
  const [selectedRFQForUnlock, setSelectedRFQForUnlock] = useState<RFQItem | null>(null);
  const [selectedFactoryForReview, setSelectedFactoryForReview] = useState<FactoryListing | null>(null);
  const [selectedRFQForReview, setSelectedRFQForReview] = useState<RFQItem | null>(null);

  // Subscribe to local database changes
  useEffect(() => {
    const unsubscribe = rfqDb.subscribe(() => {
      setRfqs(rfqDb.getRFQs());
      setQuotes(rfqDb.getAllQuotes());
    });
    return () => unsubscribe();
  }, []);

  const handleOpenQuoteModal = (rfq: RFQItem) => {
    setSelectedRFQForQuote(rfq);
    setIsQuoteModalOpen(true);
  };

  const handleOpenMessage = (rfq: RFQItem) => {
    setSelectedRFQForMessage(rfq);
    setActiveTab('messages');
  };

  const handleOpenProForma = (rfq?: RFQItem) => {
    setSelectedRFQForInvoice(rfq || rfqs[0] || null);
    setIsProFormaModalOpen(true);
  };

  const handleDirectRFQFromExplore = (_factory: FactoryListing) => {
    setIsCreateRFQModalOpen(true);
  };

  const handleOpenRateModal = (factory: FactoryListing, rfq?: RFQItem) => {
    setSelectedFactoryForReview(factory);
    setSelectedRFQForReview(rfq || null);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="bg-[#faf9f7] text-[#1a1c1b] min-h-screen flex flex-col font-['Inter'] antialiased">
      {/* Fixed Top Header */}
      <Header
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenNewRFQ={() => setIsCreateRFQModalOpen(true)}
        onOpenFactoryOnboarding={() => setIsFactoryOnboardingModalOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 pb-20">
        {activeTab === 'my-rfqs' && (
          <>
            {userRole === 'factory' ? (
              <FactoryView
                rfqs={rfqs}
                onOpenQuoteModal={handleOpenQuoteModal}
                onOpenMessage={handleOpenMessage}
                onOpenCertificate={() => setIsCertificateModalOpen(true)}
                onOpenFormulaTool={() => setIsFormulaCalculatorModalOpen(true)}
                onOpenSpecsTool={() => setIsSpecsSheetModalOpen(true)}
                onOpenProFormaTool={handleOpenProForma}
                onOpenCreateRFQ={() => setIsCreateRFQModalOpen(true)}
                onOpenFactoryOnboarding={() => setIsFactoryOnboardingModalOpen(true)}
                onOpenLeadUnlock={(rfq) => {
                  setSelectedRFQForUnlock(rfq);
                  setIsLeadUnlockModalOpen(true);
                }}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
              />
            ) : (
              <BrandView
                rfqs={rfqs}
                quotes={quotes}
                onOpenCreateRFQ={() => setIsCreateRFQModalOpen(true)}
                onOpenMessage={handleOpenMessage}
                onOpenRateModal={handleOpenRateModal}
              />
            )}
          </>
        )}

        {activeTab === 'explore' && (
          <ExploreView
            onSelectFactoryForRFQ={handleDirectRFQFromExplore}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
            onOpenRateFactory={(factory) => handleOpenRateModal(factory)}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            selectedRFQ={selectedRFQForMessage}
            onOpenSpecsTool={() => setIsSpecsSheetModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
            onOpenFactoryOnboarding={() => setIsFactoryOnboardingModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        rfqCountBadge={rfqs.length}
        unreadMessagesCount={1}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={userRole}
      />

      <CreateRFQModal
        isOpen={isCreateRFQModalOpen}
        onClose={() => setIsCreateRFQModalOpen(false)}
        onRFQCreated={() => {
          setRfqs(rfqDb.getRFQs());
          if (userRole === 'factory') {
            // Stay in view to see the newly arrived RFQ
          }
        }}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setSelectedRFQForQuote(null);
        }}
        rfq={selectedRFQForQuote}
        onQuoteSubmitted={() => {
          setRfqs(rfqDb.getRFQs());
          setQuotes(rfqDb.getAllQuotes());
        }}
      />

      <LicenseCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />

      <FormulaCalculatorModal
        isOpen={isFormulaCalculatorModalOpen}
        onClose={() => setIsFormulaCalculatorModalOpen(false)}
      />

      <SpecsSheetModal
        isOpen={isSpecsSheetModalOpen}
        onClose={() => setIsSpecsSheetModalOpen(false)}
      />

      <ProFormaModal
        isOpen={isProFormaModalOpen}
        onClose={() => {
          setIsProFormaModalOpen(false);
          setSelectedRFQForInvoice(null);
        }}
        selectedRFQ={selectedRFQForInvoice}
      />

      {/* Phase 1 Free Factory Onboarding Modal */}
      <FactoryOnboardingModal
        isOpen={isFactoryOnboardingModalOpen}
        onClose={() => setIsFactoryOnboardingModalOpen(false)}
        onSuccess={() => {
          setRfqs(rfqDb.getRFQs());
        }}
      />

      {/* Phase 2 Monetization Architecture: Lead Unlock Modal (₹500 Preview) */}
      <LeadUnlockModal
        isOpen={isLeadUnlockModalOpen}
        onClose={() => {
          setIsLeadUnlockModalOpen(false);
          setSelectedRFQForUnlock(null);
        }}
        rfq={selectedRFQForUnlock}
        onLeadUnlocked={() => {
          setRfqs(rfqDb.getRFQs());
        }}
      />

      {/* Kevixa Multi-Role Gemini AI Chatbot Modal (opened via Header AI Copilot) */}
      <KevixaAIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        initialRole={userRole === 'factory' ? 'factory' : 'brand'}
      />

      {/* Factory Settings & Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      {/* Post-Completion Rating & Review Modal (Communication, Lead Time, Quality) */}
      <PostCompletionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedFactoryForReview(null);
          setSelectedRFQForReview(null);
        }}
        factory={selectedFactoryForReview}
        rfq={selectedRFQForReview}
        onReviewSubmitted={() => {
          setRfqs(rfqDb.getRFQs());
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
