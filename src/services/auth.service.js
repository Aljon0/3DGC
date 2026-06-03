import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/useAuthStore';
import api from './api';

// ── Internal: sync profile row + load into Zustand ────────────────────────────
// Called after every successful Supabase Auth action.
// 1. Attaches JWT to all future api calls
// 2. Creates/updates the profile row in public.profiles
// 3. Fetches the full profile (with role, status) into Zustand
//
async function syncAndLoadProfile({ name, email, accessToken }) {
  // Attach JWT so the next two calls are authenticated
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  // Create or update profile row in public.profiles
  await api.post('/users/sync', { name, email });

  // Fetch full profile — this is what has role: 'admin' | 'customer'
  const response = await api.get('/users/me');
  const profile  = response.data.profile;

  // Store in Zustand — token comes from Supabase session, not our backend
  useAuthStore.getState().setAuth(profile, accessToken);
  return profile;
}

const authService = {

  // ── Login ──────────────────────────────────────────────────────────────────
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { status: 401, message: error.message };
    }

    const accessToken = data.session.access_token;
    const authUser    = data.user;

    const profile = await syncAndLoadProfile({
      name:        authUser.user_metadata?.name || email.split('@')[0],
      email:       authUser.email,
      accessToken,
    });

    return { user: profile, token: accessToken };
  },

  // ── Register ───────────────────────────────────────────────────────────────
  async register({ name, email, password, passwordConfirmation }) {
    if (password !== passwordConfirmation) {
      throw { status: 422, message: 'Passwords do not match.' };
    }
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
  
    if (error) {
      throw { status: 422, message: error.message };
    }
  
    // Email confirmation is ON — session is null until they confirm
    // Just tell the user to check their email, don't try to sync yet
    if (!data.session) {
      throw {
        status: 422,
        message: 'Account created! Please check your email to confirm your account, then log in.',
      };
    }
  
    // Email confirmation is OFF — session exists immediately
    const accessToken = data.session.access_token;
  
    const profile = await syncAndLoadProfile({
      name,
      email:       data.user.email,
      accessToken,
    });
  
    return { user: profile, token: accessToken };
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  async logout() {
    await supabase.auth.signOut();
    // Remove JWT from all future api calls
    delete api.defaults.headers.common['Authorization'];
    useAuthStore.getState().logout();
  },

  // ── Restore session on app boot ────────────────────────────────────────────
  // Called once in App.jsx on mount.
  // Supabase stores the session in localStorage — this reads it back.
  //
  async loadUserFromSession() {
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) {
      useAuthStore.getState().logout();
      return null;
    }
  
    // Attach token to all future api calls
    api.defaults.headers.common['Authorization'] =
      `Bearer ${session.access_token}`;
  
    try {
      // Only fetch profile — do NOT call /users/sync here
      // Sync only needs to run once after registration/login
      // Calling it on every refresh was resetting the role
      const response = await api.get('/users/me');
      const profile  = response.data.profile;
  
      useAuthStore.getState().setAuth(profile, session.access_token);
      return profile;
    } catch (err) {
      if (err.status === 401) {
        await supabase.auth.signOut();
        useAuthStore.getState().logout();
      }
      return null;
    }
  },

  // ── Get profile ────────────────────────────────────────────────────────────
  async getProfile() {
    const response = await api.get('/users/me');
    const profile  = response.data.profile;
    useAuthStore.getState().updateUser(profile);
    return { user: profile };
  },

  // ── Update profile ─────────────────────────────────────────────────────────
  async updateProfile(fields) {
    const response = await api.patch('/users/me', fields);
    const updated  = response.data.profile;
    useAuthStore.getState().updateUser(updated);
    return { user: updated };
  },

  // ── Change password ────────────────────────────────────────────────────────
  // Supabase handles this directly — no backend route needed
  async changePassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw { message: error.message };
    return { message: 'Password updated.' };
  },
};

export default authService;