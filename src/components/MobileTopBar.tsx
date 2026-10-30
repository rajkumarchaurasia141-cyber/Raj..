import React from 'react';
import { Menu, Bell, Crown, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from './AppLogo';

interface MobileTopBarProps {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenVip: () => void;
  onOpenAdmin: () => void;
  onOpenGmailAuth?: () => void;
  onGoHome?: () => void;
  unreadCount?: number;
}

export function MobileTopBar({
  onOpenDrawer,
  onOpenNotifications,
  onOpenVip,
  onOpenAdmin,
  onOpenGmailAuth,
  onGoHome,
  unreadCount = 2
}: MobileTopBarProps) {
  const { isVIP, isAdmin, vipDetails, user } = useAuth();
  const daysLeft = vipDetails?.daysRemaining;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EADBB8] px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-xs shrink-0">
      {/* Left: Hamburger Menu Button & Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenDrawer}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#222222] hover:bg-[#FFF4D6] hover:text-[#D8B45A] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-[#EADBB8]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Logo */}
        <div 
          className="flex items-center gap-2 min-w-0 cursor-pointer group" 
          onClick={onGoHome}
          title="होम पर जाएँ"
        >
          <AppLogo className="w-9 h-9 ring-2 ring-[#D8B45A] shadow-sm shrink-0 rounded-xl group-hover:scale-105 transition-transform" />
          <div className="leading-tight min-w-0">
            <span className="text-xs sm:text-sm font-black text-[#222222] tracking-tight block truncate flex items-center gap-1">
              <span>BSEB</span> <span className="text-[#D8B45A] font-black">GURU</span>
            </span>
            <span className="text-[9px] font-extrabold text-[#777777] tracking-wider uppercase block truncate">
              Class 9-10 • Topper
            </span>
          </div>
        </div>
      </div>

      {/* Right: VIP Pill + Notifications + Admin */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* VIP Button */}
        <button
          onClick={onOpenVip}
          className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 ${
            isVIP
              ? 'bg-[#F8E8B5] text-[#222222] border border-[#D8B45A] hover:bg-[#F3DD9C]'
              : vipDetails?.isExpired
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              : 'bg-[#F8E8B5] hover:bg-[#F3DD9C] text-[#222222] border border-[#D8B45A] shadow-xs'
          }`}
          title="VIP प्लान देखें"
        >
          <Crown className="w-3.5 h-3.5 fill-[#D8B45A] text-[#D8B45A] shrink-0" />
          <span className="whitespace-nowrap">
            {isVIP
              ? daysLeft && daysLeft < 999 ? `${daysLeft}d VIP` : 'VIP Active'
              : vipDetails?.isExpired
              ? 'रिन्यू करें'
              : '₹99 VIP'}
          </span>
        </button>

        {/* Notification Bell (Matches user screenshot) */}
        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#222222] hover:bg-[#FFF4D6] hover:text-[#D8B45A] transition-colors relative cursor-pointer shrink-0 border border-transparent hover:border-[#EADBB8]"
          title="सूचनाएं (Notifications)"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Admin Link */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#222222] text-[#F8E8B5] hover:bg-black hover:text-[#D8B45A] transition-colors cursor-pointer shrink-0 shadow-md ring-1 ring-[#D8B45A]/30"
            title="एडमिन पैनल"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
