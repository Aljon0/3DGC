import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'
import authService from '@/services/auth.service'

/**
 * useAuth
 * Wraps auth store + auth service into clean, callable actions.
 * Components never call services directly — always go through hooks.
 */
export function useAuth() {
  const navigate = useNavigate()

  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isCustomer,
    setAuth,
    updateUser,
    logout: clearAuth,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    clearError()
    try {
      const { user, token } = await authService.login({ email, password })
      setAuth(user, token)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)

      // Role-based redirect
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/customer/catalog', { replace: true })
      }
    } catch (err) {
      const msg = err.message ?? 'Login failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuth, setLoading, setError, clearError])

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true)
    clearError()
    try {
      const { user, token } = await authService.register(formData)
      setAuth(user, token)
      toast.success('Account created! Welcome to Double Seven.')
      navigate('/customer/catalog', { replace: true })
    } catch (err) {
      const msg = err.message ?? 'Registration failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuth, setLoading, setError, clearError])

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Fail silently — clear local state regardless
    } finally {
      clearAuth()
      toast.success('Logged out successfully.')
      navigate('/login', { replace: true })
    }
  }, [clearAuth, navigate])

  // ── Update Profile ───────────────────────────────────────
  const updateProfile = useCallback(async (fields) => {
    setLoading(true)
    try {
      const { user: updated } = await authService.updateProfile(fields)
      updateUser(updated)
      toast.success('Profile updated.')
      return true
    } catch (err) {
      toast.error(err.message ?? 'Could not update profile.')
      return false
    } finally {
      setLoading(false)
    }
  }, [updateUser, setLoading])

  // ── Change Password ──────────────────────────────────────
  const changePassword = useCallback(async (passwords) => {
    setLoading(true)
    try {
      await authService.changePassword(passwords)
      toast.success('Password changed successfully.')
      return true
    } catch (err) {
      toast.error(err.message ?? 'Could not change password.')
      return false
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Role helpers (call as functions)
    isAdmin:    isAdmin(),
    isCustomer: isCustomer(),

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  }
}