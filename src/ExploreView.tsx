import React, { useState, useEffect } from 'react';
import { rfqDb } from '../services/rfqDb';
import { FactoryListing } from '../types';
import { FooterLegalSection } from './FooterLegalSection';
import { FactoryReviewsModal } from './FactoryReviewsModal';
import { useAuth } from '../context/AuthContext';

interface ExploreViewProps {
  onSelectFactoryForRFQ: (factory: FactoryListing) => void;
  onOpenCertificate: () => void;
  onOpenRateFactory?: (factory: FactoryListing) => void;
}

const STORAGE_KEY_SAVED_FACTORIES = 'kevixa_saved_factories_v1';
const DEFAULT_FACTORY_LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1UvmKFys7v_YGw2g4BRhQ1k31R6ZXL_Bsd9aqVhrWAQS8CrgCtbTomH-aJ-uGInjqPZq5esyCRT3M-hz2a0kRHA1WDDcjjkLccTMmUYEKdMPrShJQE-JzMVrnf-sT5tkJyKNKxuYgStC9MWIVLgVri6AO0VSPOPZQUHQ-0fHX1-M9S6S6PhuGasKSApoQUvfaEpj3VdVlqxLXhjL30pht3uc3CCabJqT3p_E6v_Fmz43kDC73miM_AptGE';

export interface FilterTagItem {
  id: string;
  label: string;
  icon: string;
  category: 'certification' | 'claim' | 'formulation';
  description?: string;
}

export const SPECIALIZATION_TAGS: FilterTagItem[] = [
  { id: 'Organic', label: 'Organic', icon: 'psychiatry', category: 'claim', description: 'USDA & NPOP Organic Certified formulations' },
  { id: 'Vegan', label: 'Vegan', icon: 'spa', category: 'claim', description: '100% plant-derived & animal-free formulations' },
  { id: 'GMP Certified', label: 'GMP Certified', icon: 'verified', category: 'certification', description: 'CDSCO Good Manufacturing Practices audited cleanrooms' },
  { id: 'Clean Beauty', label: 'Clean Beauty', icon: 'science', category: 'claim', description: 'Toxin-free, paraben & sulfate free formulas' },
  { id: 'Ayush Certified', label: 'Ayush Certified', icon: 'self_improvement', category: 'certification', description: 'Ayush GMP certified botanical extracts & Tailams' },
  { id: 'ISO 22716', label: 'ISO 22716', icon: 'workspace_premium', category: 'certification', description: 'International Cosmetics Good Manufacturing Standard' },
  { id: 'Cruelty Free', label: 'Cruelty Free', icon: 'cruelty_free', category: 'claim', description: 'PETA-compliant, zero animal testing' },
  { id: 'Active Serums', label: 'Active Serums', icon: 'water_drop', category: 'formulation', description: 'Niacinamide, Vitamin C & active peptide blends' },
  { id: 'SPF Sunscreens', label: 'SPF Sunscreens', icon: 'wb_sunny', category: 'formulation', description: 'Hybrid & mineral sunscreen lotions with in-vitro SPF tests' },
  { id: 'Ceramide Creams', label: 'Ceramide Creams', icon: 'sanitizer', category: 'formulation', description: 'Barrier repair & lipid biomimetic emulsion bases' },
  { id: 'Lip Care', label: 'Lip Care', icon: 'face', category: 'formulation', description: 'Balms, lip sleeping masks & tinted butter sticks' },
  { id: 'Cold-Pressed Oils', label: 'Cold-Pressed Oils', icon: 'opacity', category: 'formulation', description: 'Cold-pressed virgin botanical seed oils' },
  { id: 'Color Cosmetics', label: 'Color Cosmetics', icon: 'palette', category: 'formulation', description: 'Pigmented lipsticks, tints & velvet complexion bases' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectFactoryForRFQ,
  onOpenCertificate,
  onOpenRateFactory,
}) => {
  const { userRole } = useAuth();
  const [activeExploreTab, setActiveExploreTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMatchMode, setTagMatchMode] = useState<'all' | 'any'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedFactoryForReviews, setSelectedFactoryForReviews] = useState<FactoryListing | null>(null);

  // Live factories from localDB / Firestore
  const [factories, setFactories] = useState<FactoryListing[]>(() => rfqDb.getFactories());

  useEffect(() => {
    const unsubscribe = rfqDb.subscribe(() => {
      setFactories(rfqDb.getFactories());
    });
    return () => unsubscribe();
  }, []);

  // Persistent Saved / Bookmarked Factory IDs
  const [savedFactoryIds, setSavedFactoryIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_FACTORIES);
      return stored ? JSON.parse(stored) : ['factory-aura']; // Pre-seed Aura as reference default
    } catch {
      return ['factory-aura'];
    }
  });

  // Save to localStorage whenever savedFactoryIds changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_FACTORIES, JSON.stringify(savedFactoryIds));
    } catch (err) {
      console.warn('Failed to save bookmarked factories:', err);
    }
  }, [savedFactoryIds]);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleBookmark = (factory: FactoryListing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlySaved = savedFactoryIds.includes(factory.id);

    if (isCurrentlySaved) {
      setSavedFactoryIds(prev => prev.filter(id => id !== factory.id));
      setToastMessage(`Removed ${factory.name} from Saved Factories`);
    } else {
      setSavedFactoryIds(prev => [...prev, factory.id]);
      setToastMessage(`Saved ${factory.name} to Saved Factories`);
    }
  };

  // Helper to check whether a factory possesses a given tag / certification / specialization
  const factoryMatchesTag = (factory: FactoryListing, tagId: string): boolean => {
    const normTag = tagId.toLowerCase().trim();
    const allFactoryItems = [
      ...(factory.specializations || []),
      ...(factory.certifications || []),
      ...(factory.tags || []),
      factory.cleanroomGrade || '',
      factory.tagline || '',
    ].map(s => s.toLowerCase());

    return allFactoryItems.some(item => 
      item.includes(normTag) || normTag.includes(item)
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  // Base list depending on active tab
  const baseFactories =
    activeExploreTab === 'saved'
      ? factories.filter(f => savedFactoryIds.includes(f.id))
      : factories;

  // Filter factories by Name, Specialty (specializations), Location, and Tag-Based Filter
  const filteredFactories = baseFactories.filter(f => {
    const query = searchQuery.trim().toLowerCase();

    // Check name, location, specialty tags, license number, and cleanroom grade
    const matchesSearch =
      query === '' ||
      f.name.toLowerCase().includes(query) ||
      f.location.toLowerCase().includes(query) ||
      f.specializations.some(s => s.toLowerCase().includes(query)) ||
      (f.certifications && f.certifications.some(c => c.toLowerCase().includes(query))) ||
      f.licenseNumber.toLowerCase().includes(query) ||
      f.cleanroomGrade.toLowerCase().includes(query);

    // Filter chip matching (Specialty or Location)
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      f.specializations.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase())) ||
      f.location.toLowerCase().includes(selectedSpecialty.toLowerCase());

    // Tag-Based Filtering: 'all' (AND) or 'any' (OR)
    const matchesTags =
      selectedTags.length === 0 ||
      (tagMatchMode === 'all'
        ? selectedTags.every(tag => factoryMatchesTag(f, tag))
        : selectedTags.some(tag => factoryMatchesTag(f, tag)));

    return matchesSearch && matchesSpecialty && matchesTags;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('All');
    setSelectedTags([]);
  };

  const getTagCount = (tagId: string) => {
    return baseFactories.filter(f => factoryMatchesTag(f, tagId)).length;
  };

  // Auto-suggest tags when user types in search
  const matchingSuggestedTags = searchQuery.trim().length > 1
    ? SPECIALIZATION_TAGS.filter(tag =>
        tag.label.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedTags.includes(tag.id)
      )
    : [];

  const filterChips = [
    { label: 'All', value: 'All' },
    { label: 'Active Serums', value: 'Active Serums' },
    { label: 'Ceramide Creams', value: 'Ceramide Creams' },
    { label: 'Lip Care', value: 'Lip Care' },
    { label: 'SPF Sunscreens', value: 'Sunscreens' },
    { label: 'Traditional Tailam', value: 'Tailam' },
    { label: 'Baddi (HP)', value: 'Baddi' },
    { label: 'Pune (MH)', value: 'Pune' },
    { label: 'Gujarat', value: 'Gujarat' },
  ];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-2 pb-16 gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#1a1c1b] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-[#85f8c4]/40 animate-fadeIn">
          <span className="material-symbols-outlined text-[#85f8c4] text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Tabs: All Manufacturers vs Saved Factories */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#efeeec] shadow-xs flex items-center gap-1.5">
        <button
          onClick={() => setActiveExploreTab('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeExploreTab === 'all'
              ? 'bg-[#000000] text-white shadow-xs'
              : 'text-[#45464d] hover:bg-[#efeeec] hover:text-[#1a1c1b]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">factory</span>
          <span>All Manufacturers</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeExploreTab === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-[#efeeec] text-[#76777d]'
            }`}
          >
            {factories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveExploreTab('saved')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeExploreTab === 'saved'
              ? 'bg-[#006c4a] text-white shadow-xs'
              : 'text-[#45464d] hover:bg-[#efeeec] hover:text-[#1a1c1b]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[17px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bookmark
          </span>
          <span>Saved Factories</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeExploreTab === 'saved'
                ? 'bg-white/25 text-white'
                : savedFactoryIds.length > 0
                ? 'bg-[#85f8c4] text-[#002114]'
                : 'bg-[#efeeec] text-[#76777d]'
            }`}
          >
            {savedFactoryIds.length}
          </span>
        </button>
      </div>

      {/* Top Search Bar & Header */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#efeeec] shadow-xs">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#1a1c1b]">
              {activeExploreTab === 'saved' ? 'Your Saved Factories' : 'CDSCO Certified Manufacturers'}
            </h2>
            <p className="text-xs text-[#45464d]">
              {activeExploreTab === 'saved'
                ? 'Bookmarked contract manufacturers saved for fast comparison and RFQ dispatch'
                : 'Search vetted Indian cosmetic formulation facilities by name, specialty, or manufacturing hub'}
            </p>
          </div>

          {activeExploreTab === 'saved' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#002114] flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-xs">bookmark</span>
              {savedFactoryIds.length} Saved
            </span>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76777d]">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeExploreTab === 'saved'
                ? 'Search within saved factories by name, specialty, or location...'
                : 'Search by factory name, tags (e.g. Organic, Vegan, GMP), or hub (Baddi, Pune)...'
            }
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#c6c6cd] bg-[#faf9f7] text-xs font-medium text-[#1a1c1b] placeholder:text-[#76777d] outline-none focus:bg-white focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/20 transition-all"
            aria-label="Search factories by name, specialty, or location"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76777d] hover:text-[#1a1c1b] cursor-pointer"
              title="Clear search"
              aria-label="Clear search query"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
            </button>
          )}
        </div>

        {/* Real-Time Tag Suggestion Banner if user types a matching tag */}
        {matchingSuggestedTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap p-2 bg-[#85f8c4]/15 rounded-xl border border-[#85f8c4]/40 text-xs">
            <span className="text-[11px] text-[#006c4a] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">sell</span>
              Matching Tag:
            </span>
            {matchingSuggestedTags.slice(0, 3).map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  toggleTag(tag.id);
                  setSearchQuery('');
                }}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#006c4a]/30 text-[#006c4a] hover:bg-[#006c4a] hover:text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">{tag.icon}</span>
                <span>+ Filter by &apos;{tag.label}&apos; ({getTagCount(tag.id)})</span>
              </button>
            ))}
          </div>
        )}

        {/* Tag-Based Specialization & Certification Filter System */}
        <div className="space-y-2 pt-1 border-t border-[#efeeec]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006c4a] text-[16px]">sell</span>
              <span className="font-bold text-[#1a1c1b] text-xs">
                Specialization & Certification Tags
              </span>
              {selectedTags.length > 0 && (
                <span className="bg-[#85f8c4] text-[#002114] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {selectedTags.length} active
                </span>
              )}
            </div>

            {/* AND / OR Match Mode Toggle when multiple tags are selected */}
            {selectedTags.length > 1 ? (
              <div className="flex items-center gap-1 bg-[#efeeec] p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setTagMatchMode('all')}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                    tagMatchMode === 'all'
                      ? 'bg-white text-[#006c4a] shadow-2xs'
                      : 'text-[#45464d] hover:text-[#1a1c1b]'
                  }`}
                  title="Factory must have all selected tags"
                >
                  All (AND)
                </button>
                <button
                  type="button"
                  onClick={() => setTagMatchMode('any')}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                    tagMatchMode === 'any'
                      ? 'bg-white text-[#006c4a] shadow-2xs'
                      : 'text-[#45464d] hover:text-[#1a1c1b]'
                  }`}
                  title="Factory can have any of the selected tags"
                >
                  Any (OR)
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-[#76777d]">Click tags to narrow down</span>
            )}
          </div>

          {/* Interactive Tag Pills Grid / Carousel */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar py-0.5">
            {SPECIALIZATION_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag.id);
              const count = getTagCount(tag.id);
              const isZero = count === 0;

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  disabled={isZero && !isSelected}
                  title={`${tag.label}: ${tag.description || ''}`}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 select-none ${
                    isSelected
                      ? 'bg-[#006c4a] text-white shadow-xs border border-[#005137] scale-102'
                      : isZero
                      ? 'bg-[#faf9f7] text-[#c6c6cd] border border-[#efeeec] cursor-not-allowed opacity-60'
                      : 'bg-[#faf9f7] text-[#45464d] border border-[#efeeec] hover:border-[#006c4a]/50 hover:bg-[#85f8c4]/15 hover:text-[#006c4a]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      isSelected ? 'text-[#85f8c4]' : isZero ? 'text-[#c6c6cd]' : 'text-[#006c4a]'
                    }`}
                  >
                    {isSelected ? 'check' : tag.icon}
                  </span>
                  <span>{tag.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-[#efeeec] text-[#76777d]'
                    }`}
                  >
                    {count}
                  </span>
                  {isSelected && (
                    <span className="text-[12px] opacity-80 hover:opacity-100 ml-0.5">
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Location & Specialty Chips */}
        <div className="space-y-1.5 pt-1 border-t border-[#efeeec]">
          <div className="flex items-center justify-between text-[11px] text-[#76777d]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter by Hub Location</span>
            <span>
              {filteredFactories.length} {filteredFactories.length === 1 ? 'factory' : 'factories'} matching
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {filterChips.map(chip => {
              const isSelected = selectedSpecialty === chip.value;
              return (
                <button
                  key={chip.label}
                  onClick={() => setSelectedSpecialty(chip.value)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#000000] text-white shadow-xs'
                      : 'bg-[#efeeec] text-[#45464d] hover:bg-[#e3e2e0]'
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Pill indicator if query, tags, or location filter is applied */}
        {(searchQuery.trim() !== '' || selectedSpecialty !== 'All' || selectedTags.length > 0) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#efeeec] text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#76777d] text-[11px] font-semibold">Active filters:</span>

              {/* Active Search Query */}
              {searchQuery.trim() && (
                <span className="bg-[#85f8c4]/40 text-[#002114] text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>&quot;{searchQuery}&quot;</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-red-700 ml-0.5 cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Active Selected Tags */}
              {selectedTags.map(tagId => (
                <span
                  key={tagId}
                  className="bg-[#006c4a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[12px] text-[#85f8c4]">sell</span>
                  <span>{tagId}</span>
                  <button
                    onClick={() => toggleTag(tagId)}
                    className="hover:text-red-200 ml-0.5 cursor-pointer"
                    aria-label={`Remove tag ${tagId}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Active Location/Specialty Chip */}
              {selectedSpecialty !== 'All' && (
                <span className="bg-[#efeeec] text-[#1a1c1b] text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>{selectedSpecialty}</span>
                  <button
                    onClick={() => setSelectedSpecialty('All')}
                    className="hover:text-red-700 ml-0.5 cursor-pointer"
                    aria-label="Remove specialty filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[#006c4a] hover:text-[#005137] text-[11px] font-bold underline cursor-pointer shrink-0"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Factory Dossiers or Empty State */}
      {activeExploreTab === 'saved' && savedFactoryIds.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-[#efeeec] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#85f8c4]/30 text-[#006c4a] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bookmark_border
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
              No saved factories yet
            </h3>
            <p className="text-xs text-[#45464d] max-w-sm mx-auto">
              Click the bookmark icon on any CDSCO-certified factory card to save them here for quick access, MOQ comparison, and direct RFQ submissions.
            </p>
          </div>

          <button
            onClick={() => setActiveExploreTab('all')}
            className="px-5 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 mx-auto transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">explore</span>
            <span>Browse All Manufacturers</span>
          </button>
        </div>
      ) : filteredFactories.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-[#efeeec] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#efeeec] text-[#76777d] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">search_off</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b]">
              No manufacturers found
            </h3>
            <p className="text-xs text-[#45464d] max-w-sm mx-auto">
              {selectedTags.length > 0
                ? `No factories match active tag filters (${selectedTags.join(', ')})${
                    tagMatchMode === 'all' && selectedTags.length > 1 ? ' simultaneously' : ''
                  }${searchQuery ? ` and query "${searchQuery}"` : ''}.`
                : `No ${activeExploreTab === 'saved' ? 'saved' : 'CDSCO certified'} factories match your search for "${searchQuery || selectedSpecialty}".`}
            </p>
          </div>

          {selectedTags.length > 1 && tagMatchMode === 'all' && (
            <button
              onClick={() => setTagMatchMode('any')}
              className="text-xs bg-[#85f8c4]/30 hover:bg-[#85f8c4]/50 text-[#002114] font-bold px-3 py-1.5 rounded-xl border border-[#006c4a]/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              <span>Try matching Any of these tags (OR filter)</span>
            </button>
          )}

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="text-[11px] text-[#76777d] w-full mb-1">Quick tag filters:</span>
            {['Organic', 'Vegan', 'GMP Certified', 'Active Serums', 'SPF Sunscreens'].map(tagId => (
              <button
                key={tagId}
                onClick={() => {
                  setSelectedTags([tagId]);
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                }}
                className="text-xs bg-[#faf9f7] hover:bg-[#85f8c4]/20 hover:text-[#006c4a] text-[#45464d] font-semibold px-3 py-1 rounded-full border border-[#efeeec] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px] text-[#006c4a]">sell</span>
                <span>{tagId} ({getTagCount(tagId)})</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Clear All Filters & Show {activeExploreTab === 'saved' ? 'Saved' : 'All'} Factories
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFactories.map(factory => {
            const isBookmarked = savedFactoryIds.includes(factory.id);

            return (
              <div
                key={factory.id}
                className="p-4 rounded-xl bg-white border border-[#efeeec] shadow-sm space-y-3 hover:border-[#c6c6cd] transition-all"
              >
                {/* Factory Header with Profile Picture / Logo */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      src={factory.logoUrl || DEFAULT_FACTORY_LOGO}
                      alt={factory.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FACTORY_LOGO;
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-1 ring-[#c6c6cd] shadow-2xs shrink-0 bg-white"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1c1b] truncate">
                          {factory.name}
                        </h3>
                        <span className="bg-[#85f8c4]/40 text-[#002114] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          CDSCO COS-8
                        </span>
                      </div>
                      <p className="text-xs text-[#45464d] flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="material-symbols-outlined text-sm text-[#006c4a]">location_on</span>
                        <span className="font-medium">{factory.location}</span>
                        <span className="mx-0.5">·</span>
                        <span className="text-[#006c4a] font-semibold">{factory.cleanroomGrade}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Bookmark Toggle Button */}
                    <button
                      type="button"
                      onClick={e => toggleBookmark(factory, e)}
                      className={`p-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isBookmarked
                          ? 'bg-[#85f8c4]/30 border-[#006c4a]/40 text-[#006c4a] hover:bg-[#85f8c4]/50'
                          : 'bg-[#faf9f7] border-[#efeeec] text-[#76777d] hover:bg-[#efeeec] hover:text-[#1a1c1b]'
                      }`}
                      title={isBookmarked ? 'Remove from Saved Factories' : 'Save Factory to Bookmarks'}
                      aria-label={isBookmarked ? 'Remove from Saved Factories' : 'Save Factory to Bookmarks'}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                      <span className="text-[11px] hidden sm:inline">
                        {isBookmarked ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFactoryForReviews(factory)}
                      className="flex items-center gap-1 text-xs font-bold text-[#1a1c1b] bg-[#faf9f7] hover:bg-[#f2f1ef] px-2 py-1.5 rounded-lg border border-[#efeeec] transition-colors cursor-pointer"
                      title="Click to view verified brand reviews"
                    >
                      <span
                        className="material-symbols-outlined text-sm text-amber-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span>{factory.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-[#45464d] font-normal">
                        ({factory.reviewsCount})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Business Tagline */}
                {factory.tagline && (
                  <p className="text-xs text-[#45464d] italic bg-[#faf9f7] px-3 py-1.5 rounded-lg border border-[#efeeec]">
                    &quot;{factory.tagline}&quot;
                  </p>
                )}

                {/* 3 Criteria Public Rating Breakdown Banner */}
                <div 
                  onClick={() => setSelectedFactoryForReviews(factory)}
                  className="bg-[#faf9f7] hover:bg-[#f2f1ef] p-2 sm:p-2.5 rounded-xl border border-[#efeeec] flex flex-wrap items-center justify-between gap-2 cursor-pointer transition-colors"
                  title="Click to view CDSCO brand reviews & detailed criteria breakdown"
                >
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="font-bold text-[#1a1c1b] flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#efeeec]">
                      <span className="material-symbols-outlined text-amber-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-mono text-xs">{factory.rating.toFixed(1)}</span>
                      <span className="text-[#76777d] font-normal">({factory.reviewsCount})</span>
                    </span>

                    <span className="bg-white text-[#45464d] px-2 py-0.5 rounded border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">chat_bubble</span>
                      <span>Comm:</span>
                      <strong className="text-[#1a1c1b]">★ {factory.ratingBreakdown?.communication?.toFixed(1) || factory.rating.toFixed(1)}</strong>
                    </span>

                    <span className="bg-white text-[#45464d] px-2 py-0.5 rounded border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">schedule</span>
                      <span>Lead Time:</span>
                      <strong className="text-[#1a1c1b]">★ {factory.ratingBreakdown?.leadTime?.toFixed(1) || factory.rating.toFixed(1)}</strong>
                    </span>

                    <span className="bg-white text-[#45464d] px-2 py-0.5 rounded border border-[#efeeec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#006c4a]">verified</span>
                      <span>Quality:</span>
                      <strong className="text-[#1a1c1b]">★ {factory.ratingBreakdown?.quality?.toFixed(1) || factory.rating.toFixed(1)}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#006c4a] flex items-center gap-0.5">
                    <span>Reviews & Dossier</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </span>
                </div>

                {/* License registration block */}
                <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec] flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#45464d] uppercase font-bold">Registration</span>
                    <p className="font-mono font-bold text-[#1a1c1b]">{factory.licenseNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#45464d] uppercase font-bold">Validity</span>
                    <p className="text-[#006c4a] font-semibold">{factory.validity}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#45464d] uppercase font-bold">Base MOQ</span>
                    <p className="font-bold text-[#1a1c1b]">
                      {factory.minOrderQuantity.toLocaleString()} units
                    </p>
                  </div>
                </div>

                {/* Complete Factory Address */}
                {factory.address && (
                  <div className="bg-[#faf9f7] p-2.5 rounded-lg border border-[#efeeec] text-xs space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#1a1c1b]">
                      <span className="material-symbols-outlined text-[15px] text-[#006c4a]">pin_drop</span>
                      <span>Audited Cleanroom Facility Address</span>
                    </div>
                    <p className="text-[#45464d] text-[11px] leading-relaxed pl-5">
                      {factory.address.streetPlot}, {factory.address.industrialArea}, {factory.address.city}, {factory.address.state} - <span className="font-mono font-semibold">{factory.address.pincode}</span>
                    </p>
                  </div>
                )}

                {/* Official B2B Contact Details */}
                {(factory.contactPerson || factory.phone || factory.email || factory.whatsapp) && (
                  <div className="bg-white p-2.5 rounded-lg border border-[#efeeec] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1a1c1b] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#006c4a]">contact_mail</span>
                        <span>Official Contact: {factory.contactPerson || 'Operations Lead'}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {factory.phone && (
                        <a
                          href={`tel:${factory.phone}`}
                          className="inline-flex items-center gap-1 text-[#006c4a] hover:underline bg-[#85f8c4]/20 px-2 py-0.5 rounded border border-[#85f8c4]/50"
                        >
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          <span>{factory.phone}</span>
                        </a>
                      )}
                      {factory.email && (
                        <a
                          href={`mailto:${factory.email}`}
                          className="inline-flex items-center gap-1 text-[#45464d] hover:text-[#1a1c1b] hover:underline bg-[#efeeec] px-2 py-0.5 rounded"
                        >
                          <span className="material-symbols-outlined text-[13px]">mail</span>
                          <span>{factory.email}</span>
                        </a>
                      )}
                      {factory.whatsapp && (
                        <a
                          href={`https://wa.me/${factory.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#006c4a] font-semibold hover:underline bg-[#85f8c4]/30 px-2 py-0.5 rounded border border-[#85f8c4]"
                        >
                          <span className="material-symbols-outlined text-[13px]">chat</span>
                          <span>WhatsApp: {factory.whatsapp}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Specializations & Certifications Interactive Tags */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-[#76777d]">
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#006c4a]">sell</span>
                      Specializations & Standards
                    </span>
                    <span className="text-[10px] text-[#76777d]">Click tag to filter</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Certifications Badges */}
                    {factory.certifications && factory.certifications.map((cert, i) => {
                      const isCertSelected = selectedTags.some(t => t.toLowerCase() === cert.toLowerCase());
                      return (
                        <button
                          key={`cert-${i}`}
                          type="button"
                          onClick={() => toggleTag(cert)}
                          title={`Click to filter factories by certification: ${cert}`}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCertSelected
                              ? 'bg-[#006c4a] text-white shadow-2xs'
                              : 'bg-[#85f8c4]/25 text-[#002114] border border-[#85f8c4]/60 hover:bg-[#85f8c4]/45'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[11px]">
                            {isCertSelected ? 'check' : 'verified'}
                          </span>
                          <span>{cert}</span>
                        </button>
                      );
                    })}

                    {/* Specialization Tags */}
                    {factory.specializations.map((spec, i) => {
                      const isSpecSelected = selectedTags.some(t => t.toLowerCase() === spec.toLowerCase());
                      return (
                        <button
                          key={`spec-${i}`}
                          type="button"
                          onClick={() => toggleTag(spec)}
                          title={`Click to filter factories by specialty: ${spec}`}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            isSpecSelected
                              ? 'bg-[#006c4a] text-white font-bold shadow-2xs'
                              : 'bg-[#efeeec] text-[#45464d] hover:bg-[#85f8c4]/20 hover:text-[#006c4a] hover:border-[#006c4a]/30'
                          }`}
                        >
                          {isSpecSelected && (
                            <span className="material-symbols-outlined text-[11px]">check</span>
                          )}
                          <span>{spec}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#efeeec] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onOpenCertificate}
                      className="text-xs text-[#006c4a] font-semibold underline hover:text-[#005137] cursor-pointer"
                    >
                      Audit Dossier & Certificate
                    </button>

                    {userRole === 'brand' && onOpenRateFactory && (
                      <button
                        onClick={() => onOpenRateFactory(factory)}
                        className="text-xs text-[#006c4a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Submit post-completion rating on Communication, Lead Time & Quality"
                      >
                        <span className="material-symbols-outlined text-[14px]">rate_review</span>
                        <span>Rate Factory</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectFactoryForRFQ(factory)}
                    className="px-4 py-2 rounded-xl bg-[#000000] hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Send Direct RFQ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ & Legal Policies Footer */}
      <FooterLegalSection sourceContext="explore" />

      {/* Factory Reviews & Criteria Breakdown Modal */}
      <FactoryReviewsModal
        isOpen={Boolean(selectedFactoryForReviews)}
        onClose={() => setSelectedFactoryForReviews(null)}
        factory={selectedFactoryForReviews}
        onOpenRateModal={onOpenRateFactory}
      />
    </div>
  );
};

