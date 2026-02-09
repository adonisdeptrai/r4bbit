import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, ShoppingBag, User as UserIcon, Settings, LogOut,
  FileText, Home, Bell, ArrowLeft, Package, Users, Megaphone, MessageSquare,
  GraduationCap, Key, Cpu, Sliders, Gift
} from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cn, Button } from '../components/common';
import { UserMenu } from '../components/layout/UserMenu';

// Import distinct dashboards
import { UserOverview, UserOrders, UserProfile, UserSettings } from './UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { AffiliateView } from './affiliate/AffiliateView';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  initialTab?: string;
}

// Helper Hook for Media Query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

// Animation Variants
const slideVariants = {
  enter: ({ direction, isDesktop }: { direction: number, isDesktop: boolean }) => {
    if (isDesktop) {
      return {
        y: direction > 0 ? '5%' : '-5%',
        x: 0,
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)'
      };
    }
    return {
      x: direction > 0 ? '10%' : '-10%',
      y: 0,
      opacity: 0,
      scale: 0.98,
      filter: 'blur(4px)'
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)'
  },
  exit: ({ direction, isDesktop }: { direction: number, isDesktop: boolean }) => {
    if (isDesktop) {
      return {
        zIndex: 0,
        y: direction > 0 ? '-5%' : '5%',
        x: 0,
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)'
      };
    }
    return {
      zIndex: 0,
      x: direction < 0 ? '10%' : '-10%',
      y: 0,
      opacity: 0,
      scale: 0.98,
      filter: 'blur(4px)'
    };
  },
};

// --- NAVIGATION CONFIGURATION ---

type NavItem = { id: string; label: string; icon: any; badge?: number };
type NavGroup = { title?: string; items: NavItem[] };

const USER_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: 'overview', label: 'Home', icon: Home },
      { id: 'orders', label: 'Orders', icon: FileText },
      { id: 'affiliate', label: 'Affiliate', icon: Gift },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'tools', label: 'Tools', icon: Cpu },
      { id: 'courses', label: 'Courses', icon: GraduationCap },
      { id: 'keys', label: 'License Keys', icon: Key },
    ]
  },
  {
    title: 'Order Management',
    items: [
      { id: 'orders', label: 'Orders & Payments', icon: FileText },
    ]
  },
  {
    title: 'Promotion Management',
    items: [
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    ]
  },
  {
    title: 'User Management',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'affiliates', label: 'Affiliates', icon: Gift },
    ]
  },
  {
    title: 'Support Center',
    items: [
      { id: 'messages', label: 'Support Tickets', icon: MessageSquare, badge: 5 },
    ]
  },
  {
    title: 'System Configuration',
    items: [
      { id: 'settings', label: 'Settings', icon: Sliders },
    ]
  }
];

export default function Dashboard({ onNavigate, initialTab = 'overview' }: DashboardProps) {
  const { user, logout } = useAuth();

  // Track active tab
  const [activeTab, setActiveTab] = useState(initialTab);
  const [direction, setDirection] = useState(0);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const mainScrollRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // Update active tab when prop changes (for routing updates)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const navGroups = user?.role === 'admin' ? ADMIN_NAV_GROUPS : USER_NAV_GROUPS;

  // Flatten for mobile/logic usage
  const flatNavItems = useMemo(() => {
    return navGroups.flatMap(g => g.items);
  }, [navGroups]);

  const handleTabChange = (newTabId: string) => {
    const currentIndex = flatNavItems.findIndex(item => item.id === activeTab);
    const newIndex = flatNavItems.findIndex(item => item.id === newTabId);
    const newDirection = newIndex > currentIndex ? 1 : -1;

    setDirection(newDirection);
    setActiveTab(newTabId);
  };

  const activeLabel = flatNavItems.find(i => i.id === activeTab)?.label;

  return (
    <div className="min-h-screen bg-[#020617] font-sans flex flex-col md:flex-row relative">

      {/* --- FLOATING DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 fixed left-4 top-4 bottom-4 z-50 rounded-[2.5rem] bg-[#0b1121]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overscroll-behavior-contain">
        {/* Sidebar Header */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer mb-8 group" onClick={() => onNavigate('shop')}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-cyan/20 transition-transform group-hover:scale-105",
              user?.role === 'admin' ? "bg-gradient-to-br from-blue-600 to-indigo-600" : "bg-gradient-to-br from-brand-cyan to-blue-600"
            )}>
              <ArrowLeft size={20} className="hidden group-hover:block" />
              <span className="group-hover:hidden">{user?.role === 'admin' ? 'Q' : 'R'}</span>
            </div>
            <div>
              <span className="font-bold text-xl text-white block leading-none tracking-tight group-hover:text-brand-cyan transition-colors">
                {user?.role === 'admin' ? 'Qcomart' : 'R4B'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {user?.role === 'admin' ? 'Admin Panel' : 'Back to Shop'}
              </span>
            </div>
          </div>

          {/* User Balance Card */}
          {user?.role === 'user' && (
            <div className="bg-brand-dark rounded-2xl p-5 text-white relative overflow-hidden mb-6 shadow-xl shadow-brand-dark/10 group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/20 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-brand-cyan/30 transition-all"></div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
                <h3 className="text-2xl font-mono font-bold tracking-tight">${user.balance.toFixed(2)}</h3>
              </div>
            </div>
          )}
        </div>

        {/* Nav Links (Grouped) - CRITICAL: min-height:0 forces flex item to respect overflow */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 overscroll-behavior-y-contain" style={{ minHeight: 0 }}>
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6 last:mb-0">
              {group.title && (
                <div className="px-5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badge = item.badge;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "text-white shadow-lg shadow-brand-cyan/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-blue-500" />
                      )}
                      <div className="flex items-center gap-3.5 relative z-10">
                        <Icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-brand-cyan transition-colors")} strokeWidth={isActive ? 2.5 : 2} />
                        {item.label}
                      </div>
                      {badge && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center relative z-10",
                          isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                        )}>
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-white/5 backdrop-blur-sm z-10 text-center text-[10px] text-slate-500 border-t border-white/5 flex-shrink-0">
          <p>v3.0.2 • R4B Solutions</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main
        ref={mainScrollRef}
        className="flex-1 min-h-screen overflow-y-auto relative scroll-smooth no-scrollbar md:pl-80"
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-md px-6 py-4 md:px-10 md:py-6 flex justify-between items-center border-b border-transparent md:border-white/5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white/5 px-4 py-2.5 rounded-full border border-white/10 shadow-sm w-64 mr-4">
              <span className="text-slate-400 mr-2"><LayoutGrid size={16} /></span>
              <input type="text" placeholder="Search here..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 text-white" />
            </div>

            <Button size="sm" variant="secondary" onClick={() => onNavigate('shop')} className="hidden md:flex">
              <ShoppingBag size={16} className="mr-2" /> Store
            </Button>

            <div className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617]"></span>
            </div>

            <UserMenu onNavigate={onNavigate} />
          </div>
        </header>

        {/* Content Area */}
        <div className="px-4 md:px-10 pb-40 md:pb-10 pt-6">
          <AnimatePresence mode="popLayout" custom={{ direction, isDesktop }} initial={false}>
            <motion.div
              key={activeTab}
              custom={{ direction, isDesktop }}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 25 },
                y: { type: "spring", stiffness: 400, damping: 25 },
                opacity: { duration: 0.2 }
              }}
            >
              {user?.role === 'admin' ? (
                <AdminDashboard user={user!} activeTab={activeTab as any} />
              ) : (
                /* USER VIEW */
                <>
                  {activeTab === 'overview' && user && <UserOverview user={user} />}
                  {activeTab === 'orders' && <UserOrders />}
                  {activeTab === 'affiliate' && <AffiliateView />}
                  {activeTab === 'profile' && user && <UserProfile user={user} />}
                  {activeTab === 'settings' && user && <UserSettings user={user} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- MOBILE NAV (Simplified) --- */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[320px] z-50 px-4">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-[2.5rem] h-20 flex items-center justify-evenly px-2 relative ring-1 ring-white/50">
          {/* Show top 4 items for mobile */}
          {flatNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="relative w-14 h-14 flex items-center justify-center rounded-full group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="liquidActiveBubble"
                    className="absolute inset-0 bg-gradient-to-tr from-brand-cyan to-blue-500 rounded-full shadow-lg shadow-brand-cyan/30"
                  />
                )}
                <div className="relative z-10">
                  <Icon size={24} className={cn(isActive ? "text-white" : "text-slate-400")} strokeWidth={2.5} />
                </div>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  );
}