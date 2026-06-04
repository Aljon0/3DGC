import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Layers, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * ForgotPasswordPage
 * Sends a password reset email via Supabase.
 * On success, shows a confirmation message.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent]         = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    setIsLoading(true);
    setFormError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setFormError(error.message);
    } else {
      setSent(true);
    }
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
              Forgot Password
            </h1>
            <p className="text-sm text-brand-400 font-sans mt-1">
              {sent
                ? "Check your inbox for the reset link"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-float">
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="size-14 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
                <Mail className="size-6 text-accent-400" />
              </div>
              <div>
                <p className="text-brand-100 font-sans font-medium">
                  Reset link sent!
                </p>
                <p className="text-sm text-brand-400 font-sans mt-1">
                  We sent a link to{" "}
                  <span className="text-accent-400 font-medium">{email}</span>.
                  It expires in 1 hour.
                </p>
              </div>
              <p className="text-xs text-brand-500 font-sans mt-1">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-accent-400 hover:text-accent-300 transition-colors font-medium"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {formError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl bg-red-500/10
                              border border-red-500/20 text-sm text-red-400 font-sans"
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError("");
                  }}
                  placeholder="you@email.com"
                  iconLeft={<Mail className="size-4" />}
                  error={formError}
                  autoComplete="email"
                  required
                />

                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  className="mt-2"
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <p className="text-center text-sm text-brand-500 font-sans mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-accent-400
                       hover:text-accent-300 font-medium transition-colors duration-150"
          >
            <ArrowLeft className="size-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}