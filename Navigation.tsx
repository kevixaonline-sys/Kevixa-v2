import React from 'react';

export type NavTab = 'explore' | 'my-rfqs' | 'messages' | 'profile';

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  rfqCountBadge?: number;
  unreadMessagesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  rfqCountBadge = 3,
  unreadMessagesCount = 1,
}) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#faf9f7]/95 backdrop-blur-xl border-t border-[#efeeec] shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {/* Explore */}
        <button
          onClick={() => onChangeTab('explore')}
          className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${
            activeTab === 'explore'
              ? 'text-[#000000] font-semibold'
              : 'text-[#45464d] hover:text-[#1a1c1b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          <span className="text-[11px] font-['Inter'] mt-0.5">Explore</span>
        </button>

        {/* My RFQs */}
        <button
          onClick={() => onChangeTab('my-rfqs')}
          className={`relative flex flex-col items-center justify-center w-16 h-12 transition-colors ${
            activeTab === 'my-rfqs'
              ? 'text-[#000000] font-semibold'
              : 'text-[#45464d] hover:text-[#1a1c1b]'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
            {rfqCountBadge > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#006c4a] text-white text-[10px] px-1 rounded-full h-4 min-w-[16px] flex items-center justify-center font-bold">
                {rfqCountBadge}
              </span>
            )}
          </div>
          <span className="text-[11px] font-['Inter'] mt-0.5">My RFQs</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => onChangeTab('messages')}
          className={`relative flex flex-col items-center justify-center w-16 h-12 transition-colors ${
            activeTab === 'messages'
              ? 'text-[#000000] font-semibold'
              : 'text-[#45464d] hover:text-[#1a1c1b]'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[24px]">chat</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-white text-[10px] px-1 rounded-full h-4 min-w-[16px] flex items-center justify-center font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-['Inter'] mt-0.5">Messages</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${
            activeTab === 'profile'
              ? 'text-[#000000] font-semibold'
              : 'text-[#45464d] hover:text-[#1a1c1b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="text-[11px] font-['Inter'] mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
