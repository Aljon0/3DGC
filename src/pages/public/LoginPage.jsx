import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Layers, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// ── Demo credentials hint ──────────────────────────────────────────────────

/**
 * LoginPage
 * Email + password login form.
 * Role-based redirect handled in useAuth hook.
 */
export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    if (!password.trim()) e.password = "Password is required.";
    if (email && !/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    await login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-150 h-150 rounded-full
                        bg-accent-500/5 blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div
            className="size-12 rounded-2xl bg-accent-500/20 border border-accent-500/40
                          flex items-center justify-center"
          >
            <Layers className="size-6 text-accent-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-50">
              Welcome back
            </h1>
            <p className="text-sm text-brand-400 font-sans mt-1">
              Sign in to your Double Seven account
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-float">
          {/* Global error */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10
                            border border-red-500/20 text-sm text-red-400 font-sans"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormErrors((f) => ({ ...f, email: null }));
              }}
              placeholder="you@email.com"
              iconLeft={<Mail className="size-4" />}
              error={formErrors.email}
              autoComplete="email"
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormErrors((f) => ({ ...f, password: null }));
              }}
              placeholder="Enter your password"
              iconLeft={<Lock className="size-4" />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-brand-500 hover:text-brand-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
              error={formErrors.password}
              autoComplete="current-password"
              required
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="solid"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-brand-500 font-sans mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-accent-400 hover:text-accent-300
                       font-medium transition-colors duration-150"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
