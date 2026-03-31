import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/user';

interface AuthStore {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

// Sync Supabase user into the local user store
function syncUserProfile(user: User | null) {
  if (!user) return;
  const meta = user.user_metadata ?? {};
  const name = (meta.name as string | undefined) ?? (meta.full_name as string | undefined) ?? '';
  const email = user.email ?? '';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || email.slice(0, 2).toUpperCase();

  useUserStore.getState().updateProfile({ name, email, initials });

  // Mark existing users (account > 2 min old) as onboarded so they aren't
  // redirected to the onboarding wizard on every login.
  const createdAt = new Date(user.created_at).getTime();
  const isExistingUser = Date.now() - createdAt > 2 * 60 * 1000;
  if (isExistingUser && !useUserStore.getState().hasCompletedOnboarding) {
    useUserStore.getState().completeOnboarding();
  }
}

export const useAuthStore = create<AuthStore>()((set) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false, initialized: true });
      if (session?.user) syncUserProfile(session.user);
    } catch {
      // Supabase not configured — mark initialized so auth guard can redirect
      set({ session: null, user: null, loading: false, initialized: true });
    }

    // Listen for auth state changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (session?.user) syncUserProfile(session.user);
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      set({ loading: false });
      if (error) return { error: error.message };
      set({ session: data.session, user: data.user });
      if (data.user) syncUserProfile(data.user);
      return { error: null };
    } catch (err) {
      set({ loading: false });
      return { error: 'Unable to connect. Check your internet connection and try again.' };
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });
      set({ loading: false });
      if (error) return { error: error.message, needsVerification: false };

      // If session is null after sign-up, email confirmation is required
      const needsVerification = !data.session;
      if (data.session) {
        set({ session: data.session, user: data.user });
        if (data.user) syncUserProfile(data.user);
      }
      return { error: null, needsVerification };
    } catch (err) {
      set({ loading: false });
      return { error: 'Unable to connect. Check your internet connection and try again.', needsVerification: false };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
    useUserStore.getState().updateProfile({ name: '', email: '', initials: '' });
    useUserStore.getState().completeOnboarding(); // reset so next user sees onboarding
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: 'Unable to connect. Check your internet connection and try again.' };
    }
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  },
}));
