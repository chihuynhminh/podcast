/**
 * Authentication Service
 * Handles login, logout, and session management
 */

import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session?.user;
  },

  /**
   * Logout current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user
      ? {
          id: data.user.id,
          email: data.user.email || '',
          created_at: new Date().toISOString(),
        }
      : null;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Listen for auth state changes
   * Returns unsubscribe function
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: new Date().toISOString(),
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return data.subscription;
  },
};
