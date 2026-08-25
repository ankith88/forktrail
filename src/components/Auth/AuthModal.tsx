'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '@/lib/firebase/auth';
import { X, LogIn, UserPlus, Mail, Lock, Sparkles, Loader2, Compass } from 'lucide-react';
import { User } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return;

    setIsLoading(true);
    try {
      let user: User | null = null;
      if (mode === 'register') {
        user = await registerWithEmail(email, password);
      } else {
        user = await loginWithEmail(email, password);
      }

      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-md rounded-3xl border border-[#025259]/20 bg-[#FFFFFF] p-6 shadow-2xl space-y-5 text-[#025259]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF3E7] p-1.5 border border-[#025259]/10 shadow-sm">
              <Image
                src="/logo-mark.png"
                alt="Palatero Mark"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#025259]">
                {mode === 'register' ? 'Join Palatero' : 'Welcome Back to Palatero'}
              </h2>
              <p className="text-[11px] font-bold text-[#ff947a]">
                Taste the story.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-[#025259]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF3E7] rounded-xl border border-[#025259]/10 text-xs font-bold">
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-[#ff947a] text-[#025259] shadow-sm' : 'text-[#025259] hover:bg-[#FDF8F0]'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-[#025259] text-white shadow-sm' : 'text-[#025259] hover:bg-[#FDF8F0]'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="auth-email" className="block text-[#025259] font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="foodie@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] pl-9 pr-3 py-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[#025259] font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                id="auth-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] pl-9 pr-3 py-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ff947a] py-2.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'register' ? (
              <>
                <UserPlus className="h-4 w-4" /> Create Free Account
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In to Palatero
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#025259]/15 w-full" />
          <span className="bg-[#FFFFFF] px-3 text-[11px] text-stone-500 font-semibold uppercase">Or</span>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#025259]/20 bg-[#FDF8F0] py-2.5 text-xs font-bold text-[#025259] hover:bg-[#FAF3E7] transition shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </button>

      </div>
    </div>
  );
}
