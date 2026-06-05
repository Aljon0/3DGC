import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Eye, EyeOff, Layers, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * ResetPasswordPage
 * Handles the recovery token from Supabase email link.
 * Supabase fires PASSWORD_RECOVERY on auth state change — we listen for it
 * and unlock the form. Without the token this page shows an invalid-link error.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false); // token arrived
  const [invalid, setInvalid] = useState(false); // no/expired token
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // With HashRouter, query string is in window.location.search
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const type = params.get("type");

    if (accessToken && type === "recovery") {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: params.get("refresh_token") ?? "",
        })
        .then(({ error }) => {
          if (!error) {
            cancelled = true;
            setReady(true);
          }
        });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        cancelled = true;
        setReady(true);
      }
    });

    const timer = setTimeout(() => {
      if (!cancelled) setInvalid(true);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        cancelled = true;
        clearTimeout(timer);
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!password) e.password = "New password is required.";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (password !== confirm) e.confirm = "Passwords do not match.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError("");

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) {
      setGlobalError(error.message);
    } else {
      setDone(true);
      // Auto-redirect to login after 3s
      setTimeout(() => navigate("/login", { replace: true }), 3000);
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
              Reset Password
            </h1>
            <p className="text-sm text-brand-400 font-sans mt-1">
              {done
                ? "Your password has been updated"
                : "Choose a new password for your account"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-float">
          {/* ── Success ── */}
          {done && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="size-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-400" />
              </div>
              <div>
                <p className="text-brand-100 font-sans font-medium">
                  Password updated!
                </p>
                <p className="text-sm text-brand-400 font-sans mt-1">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          )}

          {/* ── Invalid / expired link ── */}
          {!done && invalid && !ready && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div
                className="mb-1 px-4 py-3 rounded-xl bg-red-500/10
                            border border-red-500/20 text-sm text-red-400 font-sans w-full"
              >
                This reset link is invalid or has expired. Please request a new
                one.
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-accent-400 hover:text-accent-300
                           font-medium transition-colors duration-150"
              >
                Request a new link
              </Link>
            </div>
          )}

          {/* ── Loading / waiting for token ── */}
          {!done && !invalid && !ready && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-brand-400 font-sans animate-pulse">
                Verifying reset link…
              </p>
            </div>
          )}

          {/* ── Form ── */}
          {!done && ready && (
            <>
              {globalError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl bg-red-500/10
                              border border-red-500/20 text-sm text-red-400 font-sans"
                >
                  {globalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="New Password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((f) => ({ ...f, password: null }));
                  }}
                  placeholder="At least 8 characters"
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

                <Input
                  label="Confirm Password"
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setFormErrors((f) => ({ ...f, confirm: null }));
                  }}
                  placeholder="Repeat new password"
                  iconLeft={<Lock className="size-4" />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowConf((v) => !v)}
                      className="text-brand-500 hover:text-brand-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showConf ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  }
                  error={formErrors.confirm}
                  autoComplete="new-password"
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
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
