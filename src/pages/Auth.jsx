import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const initialSignup = { fullName: "", email: "", phone: "", address: "", district: "", password: "", confirmPassword: "" };

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const { t } = useLang();
  const [isLogin, setIsLogin] = useState(() => searchParams.get("mode") !== "signup");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState(initialSignup);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return toast.error(t("Please fill in all fields"));
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success(t("Welcome back!"));
      navigate("/owner/dashboard");
    } catch (error) {
      if (error?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        localStorage.setItem("gharkhoj-pending-email", error.response.data.email || loginForm.email);
        toast.error(t("Please verify your email before signing in."));
        navigate("/verify-email");
      } else toast.error(getErrorMessage(error, t("Authentication failed")));
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (Object.values(signupForm).some((v) => !String(v).trim())) return toast.error(t("Please fill in all fields"));
    if (signupForm.password.length < 8) return toast.error(t("Password must be at least 8 characters"));
    if (signupForm.password !== signupForm.confirmPassword) return toast.error(t("Passwords do not match"));
    setLoading(true);
    try {
      const data = await register(signupForm);
      localStorage.setItem("gharkhoj-pending-email", data.email || signupForm.email);
      toast.success(t("Verification code sent to your email."));
      navigate("/verify-email", { state: { email: data.email || signupForm.email } });
    } catch (error) {
      toast.error(getErrorMessage(error, t("Registration failed")));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className={`w-full ${isLogin ? "max-w-md" : "max-w-2xl"}`}>
          <p className="eyebrow mb-3 text-center">{t("For property owners")}</p>
          <h1 className="display mb-2 text-center text-3xl text-foreground md:text-4xl">
            {isLogin ? t("Owner Login") : t("Create Owner Account")}
          </h1>
          <p className="mb-8 text-center text-muted-foreground">
            {isLogin ? t("Sign in to manage your room listings.") : t("Create an owner account to list and manage rooms. Tenants do not need an account.")}
          </p>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5 rounded-3xl border bg-card p-6 md:p-8" style={{ boxShadow: "var(--card-shadow)" }}>
              <div>
                <Label htmlFor="login-email">{t("Email")}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="pl-10" placeholder="owner@example.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="login-password">{t("Password")}</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="pl-10" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex items-center justify-end text-sm">
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">{t("Forgot Password?")}</Link>
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 rounded-full font-bold">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}{t("Login as Owner")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="grid gap-5 rounded-3xl border bg-card p-6 md:grid-cols-2 md:p-8" style={{ boxShadow: "var(--card-shadow)" }}>
              <Field icon={User} label={t("Full Name")} value={signupForm.fullName} onChange={(v) => setSignupForm({ ...signupForm, fullName: v })} placeholder={t("Your full name")} />
              <Field icon={Mail} label={t("Email")} type="email" value={signupForm.email} onChange={(v) => setSignupForm({ ...signupForm, email: v })} placeholder="owner@example.com" />
              <Field icon={Phone} label={t("Phone Number")} value={signupForm.phone} onChange={(v) => setSignupForm({ ...signupForm, phone: v })} placeholder="98XXXXXXXX" />
              <Field icon={MapPin} label={t("District")} value={signupForm.district} onChange={(v) => setSignupForm({ ...signupForm, district: v })} placeholder={t("e.g. Jhapa")} />
              <div className="md:col-span-2"><Field icon={MapPin} label={t("Address")} value={signupForm.address} onChange={(v) => setSignupForm({ ...signupForm, address: v })} placeholder={t("Municipality, ward, area")}/></div>
              <Field icon={Lock} label={t("Password")} type="password" value={signupForm.password} onChange={(v) => setSignupForm({ ...signupForm, password: v })} placeholder="Minimum 8 characters" />
              <Field icon={Lock} label={t("Confirm Password")} type="password" value={signupForm.confirmPassword} onChange={(v) => setSignupForm({ ...signupForm, confirmPassword: v })} placeholder="Repeat password" />
              <div className="md:col-span-2 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                {t("After signup, a 6-digit verification code will be sent to your email.")}
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 rounded-full font-bold md:col-span-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}{t("Create Owner Account")}
              </Button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isLogin ? t("Don't have an owner account?") : t("Already have an owner account?")} {" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:underline">
              {isLogin ? t("Create Account") : t("Sign In")}
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({ icon: Icon, label, value, onChange, type = "text", placeholder }) => (
  <div>
    <Label>{label}</Label>
    <div className="relative mt-1">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" placeholder={placeholder} />
    </div>
  </div>
);

export default Auth;
