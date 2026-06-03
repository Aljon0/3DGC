import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, Layers, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// ── Password strength helper ───────────────────────────────────────────────
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "", color: "bg-brand-700" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
}

/**
 * RegisterPage
 * New customer account registration.
 * Includes password strength meter and confirmation.
 */
export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((e) => ({ ...e, [key]: null }));
    clearError();
  };

  const strength = getPasswordStrength(form.password);

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (!form.passwordConfirmation)
      e.passwordConfirmation = "Please confirm your password.";
    else if (form.password !== form.passwordConfirmation)
      e.passwordConfirmation = "Passwords do not match.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await register(form);
  };

  // ── Benefits list ──────────────────────────────────────────────────────
  const benefits = [
    "Free 3D design customizer",
    "Browse design templates",
    "Real-time order tracking",
    "Direct messaging with our team",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 right-1/4
                        w-125 h-125 rounded-full
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
              Create your account
            </h1>
            <p className="text-sm text-brand-400 font-sans mt-1">
              Start designing your monument today
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="size-4 rounded-full bg-accent-500/20
                              flex items-center justify-center shrink-0"
              >
                <Check className="size-2.5 text-accent-400" />
              </div>
              <span className="text-xs text-brand-400 font-sans">{b}</span>
            </div>
          ))}
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
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Juan dela Cruz"
              iconLeft={<User className="size-4" />}
              error={formErrors.name}
              autoComplete="name"
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com"
              iconLeft={<Mail className="size-4" />}
              error={formErrors.email}
              autoComplete="email"
              required
            />

            {/* Password */}
            <div className="space-y-2">
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 8 characters"
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
                autoComplete="new-password"
                required
              />

              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength.score ? strength.color : "bg-brand-700",
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p
                      className={cn(
                        "text-xs font-sans",
                        strength.score <= 1
                          ? "text-red-400"
                          : strength.score === 2
                            ? "text-amber-400"
                            : strength.score === 3
                              ? "text-blue-400"
                              : "text-emerald-400",
                      )}
                    >
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showPass ? "text" : "password"}
              value={form.passwordConfirmation}
              onChange={(e) => set("passwordConfirmation", e.target.value)}
              placeholder="Repeat your password"
              iconLeft={<Lock className="size-4" />}
              error={formErrors.passwordConfirmation}
              autoComplete="new-password"
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
              Create Account
            </Button>
          </form>

          {/* Terms note */}
          <p className="text-xs text-brand-600 font-sans text-center mt-4 leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="text-brand-400 cursor-pointer hover:text-brand-200">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-brand-400 cursor-pointer hover:text-brand-200">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-brand-500 font-sans mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent-400 hover:text-accent-300
                       font-medium transition-colors duration-150"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
