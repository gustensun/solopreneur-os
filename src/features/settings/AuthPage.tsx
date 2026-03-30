import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    navigate("/ai-chat");
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    navigate("/ai-chat");
  }

  function handleGuest() {
    navigate("/ai-chat");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        ← Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Solopreneur OS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-muted/60 p-1 mb-5">
          <button
            onClick={() => setTab("signin")}
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
            onClick={() => setTab("signup")}
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

        {/* Card */}
        <div className="glass-card p-6">
          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </span>
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="hello@example.com"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signin-password">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Password
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Full Name
                  </span>
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Jane Smith"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </span>
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="hello@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Password
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Guest button */}
          <Button variant="outline" className="w-full" onClick={handleGuest}>
            Continue as Guest
          </Button>
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
