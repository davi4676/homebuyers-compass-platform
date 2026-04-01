'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  LogIn,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  Info,
  FileText,
  ChevronRight,
  Crown
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { UserTier } from '@/lib/tiers';
import { normalizeUserTier } from '@/lib/tiers';
import { AuthModal } from './AuthModal';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('signup');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleOpenAuthModal = (view: 'login' | 'signup' = 'signup') => {
    setIsOpen(false);
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getTierBadge = () => {
    const tierConfig: Record<UserTier, { label: string; color: string }> = {
      foundations: { label: 'Foundations', color: 'bg-slate-100 text-slate-800' },
      momentum: { label: 'Momentum', color: 'bg-cyan-100 text-cyan-800' },
      navigator: { label: 'Navigator', color: 'bg-orange-100 text-orange-900' },
      navigator_plus: { label: 'Navigator+', color: 'bg-amber-100 text-amber-900' },
    };

    return tierConfig[normalizeUserTier(user?.subscriptionTier)];
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Menu trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold shadow-sm">
          {isAuthenticated ? getInitials() : <User className="w-5 h-5" />}
        </div>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {isAuthenticated ? (
              <>
                {/* User info section */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierBadge().color}`}>
                          {normalizeUserTier(user?.subscriptionTier) === 'navigator_plus' && (
                            <Crown className="w-3 h-3" />
                          )}
                          {getTierBadge().label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <MenuItem
                    icon={User}
                    label="Profile"
                    onClick={() => handleNavigation('/profile')}
                  />
                  <MenuItem
                    icon={Settings}
                    label="Profile settings"
                    onClick={() => handleNavigation('/profile')}
                  />
                  <MenuItem
                    icon={CreditCard}
                    label="Upgrade plans"
                    onClick={() => handleNavigation('/upgrade')}
                    badge={normalizeUserTier(user?.subscriptionTier) === 'foundations' ? 'Upgrade' : undefined}
                  />
                  <MenuItem
                    icon={Bell}
                    label="Reminder inbox"
                    onClick={() => handleNavigation('/inbox')}
                  />
                  <MenuItem
                    icon={Shield}
                    label="Privacy & Security"
                    onClick={() => handleNavigation('/privacy')}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Help & About section */}
                <div className="py-2">
                  <MenuItem
                    icon={HelpCircle}
                    label="Resources"
                    onClick={() => handleNavigation('/resources')}
                  />
                  <MenuItem
                    icon={Info}
                    label="Home"
                    onClick={() => handleNavigation('/')}
                  />
                  <MenuItem
                    icon={FileText}
                    label="Privacy"
                    onClick={() => handleNavigation('/privacy')}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Sign out */}
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not authenticated - show login/signup options */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to access your account and unlock all features
                  </p>
                  <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium mb-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuthModal('signup')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Create Account
                  </button>
                </div>

                <div className="border-t border-gray-100" />

                {/* Help & About for non-authenticated users */}
                <div className="py-2">
                  <MenuItem
                    icon={HelpCircle}
                    label="Resources"
                    onClick={() => handleNavigation('/resources')}
                  />
                  <MenuItem
                    icon={Info}
                    label="Home"
                    onClick={() => handleNavigation('/')}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
        trigger="manual"
      />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  badge?: string;
}

function MenuItem({ icon: Icon, label, onClick, badge }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
        <span className="text-gray-700 group-hover:text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </button>
  );
}
