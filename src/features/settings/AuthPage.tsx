import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, updatePassword, loading, session } = useAuthStore();

  const [tab, setTab] = useState<Tab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sign In
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Reset password (arrived via email link)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle query params from email links
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setTab("signin");
      setSuccess("Email verified! You can now sign in.");
    }
    if (searchParams.get("reset") === "true") {
      setTab("reset");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!signInEmail || !signInPassword) {
      setError("Please fill in all fields.");
      return;
    }
    const { error } = await signIn(signInEmail, signInPassword);
    if (error) {
      setError(
        error.includes("Invalid login") || error.includes("invalid_credentials")
          ? "Incorrect email or password."
          : error
      );
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const { error, needsVerification: needsVerify } = await signUp(
      signUpEmail,
      signUpPassword,
      signUpName
    );
    if (error) {
      setError(
        error.includes("already registered") || error.includes("already been registered")
          ? "An account with this email already exists."
          : error
      );
    } else if (needsVerify) {
      setNeedsVerification(true);
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail) {
      setError("Please enter your email.");
      return;
    }
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      setError(error);
    } else {
      setForgotSent(true);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (error) {
      setError(error);
    } else {
      setSuccess("Password updated! Signing you in…");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    }
  }

  // ── Email verification pending ──────────────────────────────────────────────
  if (needsVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-1">
            We sent a verification link to
          </p>
          <p className="font-medium mb-6">{signUpEmail}</p>
          <p className="text-muted-foreground text-xs mb-6">
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setNeedsVerification(false); setTab("signin"); }}
          >
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link
        to="/"
        className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        ← Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Solopreneur OS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tab === "signin" && "Welcome back"}
            {tab === "signup" && "Create your account"}
            {tab === "forgot" && "Reset your password"}
            {tab === "reset" && "Set a new password"}
          </p>
        </div>

        {/* Tab switcher — only for signin/signup */}
        {(tab === "signin" || tab === "signup") && (
          <div className="flex rounded-lg bg-muted/60 p-1 mb-5">
            <button
              onClick={() => { setTab("signin"); clearMessages(); }}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                tab === "signin"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); clearMessages(); }}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                tab === "signup"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700 dark:text-green-400"
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <div className="glass-card p-6">
          <AnimatePresence mode="wait">

            {/* ── Sign In ─────────────────────────────────────── */}
            {tab === "signin" && (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="hello@example.com"
                    autoFocus
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Password
                      </span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => { setTab("forgot"); clearMessages(); setForgotEmail(signInEmail); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </motion.form>
            )}

            {/* ── Sign Up ─────────────────────────────────────── */}
            {tab === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </span>
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Jane Smith"
                    autoFocus
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="hello@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Password
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="pr-10"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {loading ? "Creating account…" : "Create Account"}
                </Button>
              </motion.form>
            )}

            {/* ── Forgot Password ──────────────────────────────── */}
            {tab === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {forgotSent ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">Reset link sent</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Check <span className="font-medium">{forgotEmail}</span> for a password reset link.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => { setTab("signin"); setForgotSent(false); }}>
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you a reset link.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="forgot-email">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> Email
                        </span>
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="hello@example.com"
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {loading ? "Sending…" : "Send Reset Link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setTab("signin"); clearMessages(); }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* ── Reset Password ───────────────────────────────── */}
            {tab === "reset" && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Choose a new password for your account.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" /> New Password
                    </span>
                  </Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Confirm Password
                    </span>
                  </Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? "Hide" : "Show"} password
                </button>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Updating…" : "Set New Password"}
                </Button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">
            Terms of Service
          </span>
          .
        </p>
      </motion.div>
    </div>
  );
}
