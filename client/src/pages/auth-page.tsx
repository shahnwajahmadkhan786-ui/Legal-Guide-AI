import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Phone, Chrome, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeSlide = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  // Indian phone: +91 followed by 10 digits, or just 10 digits
  return /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
}

function formatPhone(phone: string) {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  return `+91${cleaned}`;
}

// ─── Email / Password Form ─────────────────────────────────────────────────

function EmailAuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSuccess("Account created! Check your email for confirmation.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} variants={stagger} initial="initial" animate="animate" className="space-y-5">
      {/* Email field */}
      <motion.div variants={fadeSlide} className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </motion.div>

      {/* Password field */}
      <motion.div variants={fadeSlide} className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      {/* Error / Success messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            key="success"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div variants={fadeSlide}>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Toggle sign up / sign in */}
      <motion.div variants={fadeSlide} className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span className="font-semibold underline underline-offset-4">{isSignUp ? "Sign in" : "Sign up"}</span>
        </button>
      </motion.div>
    </motion.form>
  );
}

// ─── Google OAuth ───────────────────────────────────────────────────────────

function GoogleAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeSlide} className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Sign in securely with your Google account. No password needed.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={fadeSlide}>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-3 h-12 text-base font-medium border-2 hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Chrome className="h-5 w-5" />
              Continue with Google
            </>
          )}
        </Button>
      </motion.div>

      <motion.p variants={fadeSlide} className="text-xs text-center text-muted-foreground/70">
        You'll be redirected to Google to complete sign-in
      </motion.p>
    </motion.div>
  );
}

// ─── Phone OTP ──────────────────────────────────────────────────────────────

function PhoneOTPForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone(phoneNumber)) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phoneNumber);
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (otpError) throw otpError;
      setStep("otp");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phoneNumber);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: "sms",
      });
      if (verifyError) throw verifyError;
    } catch (err: any) {
      setError(err?.message ?? "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.form
          key="phone-step"
          onSubmit={handleSendOTP}
          variants={stagger}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-5"
        >
          <motion.div variants={fadeSlide} className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                value={phoneNumber.replace(/^\+91/, "")}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                className="pl-12"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">We'll send a 6-digit OTP to this number</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={fadeSlide}>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.form
          key="otp-step"
          onSubmit={handleVerifyOTP}
          variants={stagger}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-5"
        >
          <motion.div variants={fadeSlide} className="space-y-3">
            <Label>Enter OTP</Label>
            <p className="text-sm text-muted-foreground">
              Code sent to <span className="font-medium text-foreground">+91 {phoneNumber.replace(/^\+91/, "")}</span>
            </p>
            <div className="flex justify-center py-2">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={fadeSlide} className="space-y-3">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify & Sign In
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtpCode("");
                setError(null);
              }}
              className="block mx-auto text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Change phone number
            </button>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

// ─── Main Auth Page ─────────────────────────────────────────────────────────

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left Branding Panel ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative lg:w-[45%] flex flex-col items-center justify-center px-8 py-16 lg:py-0 overflow-hidden bg-primary text-primary-foreground"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-white/5" />
        </div>

        <div className="relative z-10 max-w-md text-center space-y-8">
          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl"
          >
            <Shield className="w-10 h-10 text-accent" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight">
              NyayaSahay
            </h1>
            <div className="w-16 h-1 mx-auto rounded-full bg-accent" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg lg:text-xl text-primary-foreground/80 leading-relaxed font-light"
          >
            Your AI-powered legal assistant for navigating Indian law with confidence.
          </motion.p>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-col gap-3 text-sm text-primary-foreground/60"
          >
            {[
              "Understand your legal rights instantly",
              "Get guidance on IPC, CrPC & more",
              "Available in multiple Indian languages",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right Auth Form Panel ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-background"
      >
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-serif">Welcome</CardTitle>
              <CardDescription>Choose your preferred sign-in method</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="google" className="gap-1.5 text-xs sm:text-sm">
                    <Chrome className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Google</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-1.5 text-xs sm:text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Phone</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <EmailAuthForm />
                </TabsContent>

                <TabsContent value="google">
                  <GoogleAuthForm />
                </TabsContent>

                <TabsContent value="phone">
                  <PhoneOTPForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-center text-muted-foreground mt-6"
          >
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
