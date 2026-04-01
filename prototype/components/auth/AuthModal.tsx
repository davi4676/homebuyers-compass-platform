'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, saveQuizResults } from '@/lib/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
  trigger?: 'quiz-complete' | 'feature-gate' | 'manual' | 'save-results';
  quizData?: any;
  /** Static redirect after success (e.g. "/"). */
  redirectTo?: string;
  /** If true, after success call GET /api/auth/post-login-redirect and redirect to returned URL (quiz or results). */
  usePostLoginRedirect?: boolean;
  /** Optional transactionType to pass to post-login-redirect (e.g. from hero form). */
  postLoginTransactionType?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialView = 'signup',
  trigger,
  quizData,
  redirectTo,
  usePostLoginRedirect = false,
  postLoginTransactionType,
}: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup' | 'verify-email' | 'forgot-password'>(initialView);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signIn, signInWithGoogle, signInWithApple, resetPassword } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setStep(1);
      setView(initialView);
      // Reset form fields when modal closes
      setUsername('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setAcceptedTerms(false);
      setMarketingOptIn(true);
    }
  }, [isOpen, initialView]);

  const getValueProp = () => {
    switch (trigger) {
      case 'quiz-complete':
        return {
          title: "Save Your Results",
          subtitle: "Create a free account to access your complete analysis and track your progress",
          benefits: [
            "Save and access your results anytime",
            "Get personalized recommendations",
            "Track your homebuying progress",
            "Unlock advanced tools and calculators"
          ]
        };
      case 'feature-gate':
        return {
          title: "Unlock This Feature",
          subtitle: "Create a free account to access this and other powerful tools",
          benefits: [
            "Full access to all calculators",
            "Deal analyzer for unlimited properties",
            "Document vault and organizer",
            "Personalized action plan"
          ]
        };
      case 'save-results':
        return {
          title: "Don't Lose Your Progress",
          subtitle: "Save your analysis and continue where you left off",
          benefits: [
            "Access from any device",
            "Track changes over time",
            "Get notifications on updates",
            "Share with co-borrower or agent"
          ]
        };
      default:
        return {
          title: "Get Started Free",
          subtitle: "Join thousands of smart homebuyers saving money",
          benefits: [
            "Complete homebuying cost analysis",
            "Personalized savings opportunities",
            "Step-by-step action plan",
            "Expert guidance and tools"
          ]
        };
    }
  };

  const valueProp = getValueProp();

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }

      if (quizData) {
        await saveQuizResults(quizData);
      }

      if (usePostLoginRedirect) {
        const url = postLoginTransactionType ? `/api/auth/post-login-redirect?transactionType=${encodeURIComponent(postLoginTransactionType)}` : '/api/auth/post-login-redirect';
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        window.location.href = data?.redirect || '/quiz';
        return;
      }
      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!username?.trim()) {
        setError('Username is required');
        return;
      }
      if (username.trim().length < 2) {
        setError('Username must be at least 2 characters');
        return;
      }
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!acceptedTerms) {
        setError('You must accept the terms and privacy policy');
        return;
      }

      setStep(2);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await signUp({
        username: username.trim(),
        email,
        password,
        firstName,
        lastName,
        phone,
        acceptedTerms,
        acceptedPrivacy: acceptedTerms,
        marketingOptIn,
        referralSource: trigger
      });

      if (quizData) {
        await saveQuizResults(quizData, userData.id);
      }

      if (usePostLoginRedirect) {
        const url = postLoginTransactionType ? `/api/auth/post-login-redirect?transactionType=${encodeURIComponent(postLoginTransactionType)}` : '/api/auth/post-login-redirect';
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        window.location.href = data?.redirect || '/quiz';
        return;
      }
      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);

      if (quizData) {
        await saveQuizResults(quizData);
      }

      if (usePostLoginRedirect) {
        const url = postLoginTransactionType ? `/api/auth/post-login-redirect?transactionType=${encodeURIComponent(postLoginTransactionType)}` : '/api/auth/post-login-redirect';
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        window.location.href = data?.redirect || '/quiz';
        return;
      }
      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setError('');
      alert('Password reset email sent! Check your inbox.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          // Close modal when clicking on the backdrop (not on the modal content)
          const target = e.target as HTMLElement;
          const backdrop = e.currentTarget as HTMLElement;
          // Check if click is on backdrop itself or not inside the white modal content
          const modalContent = backdrop.querySelector('.bg-white');
          if (target === backdrop || (modalContent && !modalContent.contains(target))) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors bg-white shadow-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Left side: Value proposition */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 text-white flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{valueProp.title}</h2>
                  <p className="text-teal-100">{valueProp.subtitle}</p>
                </div>

                <div className="space-y-3">
                  {valueProp.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-white/20 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-teal-50">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Auth form */}
            <div className="p-8 flex flex-col justify-center">
              {view === 'signup' && (
                <SignUpForm
                  step={step}
                  username={username}
                  setUsername={setUsername}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  firstName={firstName}
                  setFirstName={setFirstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  phone={phone}
                  setPhone={setPhone}
                  acceptedTerms={acceptedTerms}
                  setAcceptedTerms={setAcceptedTerms}
                  marketingOptIn={marketingOptIn}
                  setMarketingOptIn={setMarketingOptIn}
                  error={error}
                  loading={loading}
                  onSubmit={handleSignUp}
                  onSocialLogin={handleSocialLogin}
                  onSwitchToLogin={() => setView('login')}
                  onBack={() => setStep(1)}
                />
              )}

              {view === 'login' && (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  error={error}
                  loading={loading}
                  onSubmit={handleLogin}
                  onSocialLogin={handleSocialLogin}
                  onSwitchToSignup={() => setView('signup')}
                  onForgotPassword={() => setView('forgot-password')}
                />
              )}

              {view === 'forgot-password' && (
                <ForgotPasswordForm
                  email={email}
                  setEmail={setEmail}
                  error={error}
                  loading={loading}
                  onSubmit={handleForgotPassword}
                  onBack={() => setView('login')}
                />
              )}

              {view === 'verify-email' && (
                <VerifyEmailView
                  email={email}
                  onClose={onClose}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sign Up Form Component
interface SignUpFormProps {
  step: number;
  username: string;
  setUsername: (u: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  marketingOptIn: boolean;
  setMarketingOptIn: (optIn: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSocialLogin: (provider: 'google' | 'apple') => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

function SignUpForm({
  step,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  acceptedTerms,
  setAcceptedTerms,
  marketingOptIn,
  setMarketingOptIn,
  error,
  loading,
  onSubmit,
  onSocialLogin,
  onSwitchToLogin,
  onBack
}: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold mb-2">Create Account</h3>
        <p className="text-gray-600 text-sm">Sign up to get started</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="johndoe"
                required
                minLength={2}
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="/legal/terms" className="text-teal-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/legal/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => onSocialLogin('apple')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-teal-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="marketing"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="marketing" className="text-sm text-gray-600">
              Send me tips and updates about homebuying (optional)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

// Login Form Component
interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSocialLogin: (provider: 'google' | 'apple') => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  onSocialLogin,
  onSwitchToSignup,
  onForgotPassword
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold mb-2">Welcome Back</h3>
        <p className="text-gray-600 text-sm">Sign in to your account</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div></div>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-teal-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSocialLogin('google')}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => onSocialLogin('apple')}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple
        </button>
      </div>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-teal-600 hover:underline font-medium"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

// Forgot Password Form Component
interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function ForgotPasswordForm({
  email,
  setEmail,
  error,
  loading,
  onSubmit,
  onBack
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold mb-2">Reset Password</h3>
        <p className="text-gray-600 text-sm">Enter your email to receive a password reset link</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
      >
        Back to Sign In
      </button>
    </form>
  );
}

// Verify Email View Component
interface VerifyEmailViewProps {
  email: string;
  onClose: () => void;
}

function VerifyEmailView({ email, onClose }: VerifyEmailViewProps) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-teal-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">Check Your Email</h3>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to verify your account and get started.
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
