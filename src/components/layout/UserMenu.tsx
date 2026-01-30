import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon, Settings, LogOut, HelpCircle, CreditCard,
  LayoutDashboard, ChevronRight, Sparkles, Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ViewState } from '../../types';
import { cn } from '../common/utils';

interface UserMenuProps {
  onNavigate: (view: ViewState) => void;
}

export const UserMenu = ({ onNavigate }: UserMenuProps) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    onNavigate('landing');
  };

  const handleNavigate = (view: ViewState) => {
    setIsOpen(false);
    onNavigate(view);
  }

  const menuItems = [
    // Admin Link
    ...(user.role === 'admin' ? [{
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      onClick: () => handleNavigate('admin')
    }] : []),

    // User Links
    {
      icon: LayoutDashboard,
      label: 'My Dashboard',
      onClick: () => handleNavigate('dashboard')
    },
    {
      icon: UserIcon,
      label: 'Profile',
      onClick: () => handleNavigate('profile')
    },
    {
      icon: CreditCard,
      label: 'Subscription',
      onClick: () => handleNavigate('settings'),
      badge: (
        <span className="text-[10px] font-bold bg-gradient-to-r from-brand-cyan to-blue-500 text-black px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.3)] flex items-center gap-1">
          <Sparkles size={8} fill="currentColor" /> PRO
        </span>
      )
    },
    { icon: Settings, label: 'Settings', onClick: () => handleNavigate('settings') },
  ];

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-[#0b1121] border border-white/10 p-[2px] shadow-lg transition-transform group-hover:scale-105 group-hover:border-brand-cyan/50">
          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
            {/* Gradient Arc */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover relative z-10" />
            ) : (
              <span className="font-bold text-white relative z-10">{(user.username || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        {/* Status Indicator */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="absolute right-0 top-14 w-72 bg-[#0b1121]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-black/80 border border-white/10 p-2 origin-top-right overflow-hidden ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="relative p-5 bg-white/5 rounded-[1.5rem] mb-2 flex items-center gap-4 border border-white/5 overflow-hidden group/header">
              {/* Animated Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-transparent to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 p-[2px] shadow-lg shadow-brand-cyan/20 shrink-0 relative z-10">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-white">{(user.username || 'U').charAt(0).toUpperCase()}</span>}
                </div>
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <h4 className="font-bold text-base text-white truncate leading-tight mb-0.5">{user.username}</h4>
                <p className="text-xs text-slate-400 truncate font-medium flex items-center gap-1.5">
                  <Mail size={10} /> {user.email}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1 px-1">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan transition-all border border-transparent group-hover:border-brand-cyan/20">
                      <item.icon size={18} strokeWidth={2} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/5 my-2 mx-4"></div>

            <div className="space-y-1 px-1">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan transition-all border border-transparent group-hover:border-brand-cyan/20">
                  <HelpCircle size={18} strokeWidth={2} />
                </div>
                Help Center
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
              >
                <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:bg-red-500/10 group-hover:text-red-400 transition-all border border-transparent group-hover:border-red-500/20">
                  <LogOut size={18} strokeWidth={2} />
                </div>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};