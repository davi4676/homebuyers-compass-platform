/**
 * Authentication Hook
 * Uses API routes for signup, login, logout, and session.
 * Session is stored in an HTTP-only cookie; user state is synced from GET /api/auth/session.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, RegistrationData } from '@/lib/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      const data = await res.json();
      if (data?.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signUp = useCallback(async (data: RegistrationData): Promise<User> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Registration failed');
    }
    const user = body.user as User;
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    return user;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Login failed');
    }
    const user = body.user as User;
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    throw new Error('Google sign-in not yet implemented');
  }, []);

  const signInWithApple = useCallback(async (): Promise<void> => {
    throw new Error('Apple sign-in not yet implemented');
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    console.log('Password reset requested for:', email);
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    refetchSession: fetchSession,
  };
}

/** Save quiz state for the current user (requires session). */
export async function saveQuizResults(quizData: Record<string, unknown>, _userId?: string): Promise<void> {
  try {
    const transactionType = (quizData.transactionType as string) || 'first-time';
    const res = await fetch('/api/user/quiz-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        transactionType,
        quizAnswers: quizData,
      }),
    });
    if (!res.ok) {
      console.error('Failed to save quiz state:', await res.text());
    }
  } catch (error) {
    console.error('Error saving quiz results:', error);
  }
}
