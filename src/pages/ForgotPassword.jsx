import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error(t("Please enter your registered email."));
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      sessionStorage.setItem("gharkhoj-reset-email", email.trim().toLowerCase());
      toast.success(data.message);
      navigate("/verify-reset-code");
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  return <div className="flex min-h-screen flex-col"><Navbar />
    <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-card p-7 md:p-9" style={{ boxShadow: "var(--card-shadow)" }}>
        <p className="eyebrow mb-3">{t("Owner account recovery")}</p>
        <h1 className="display text-3xl">{t("Forgot Password")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("Enter the email address associated with your property owner account. We'll send a 6-digit verification code.")}</p>
        <div className="mt-7"><Label>{t("Email Address")}</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="owner@example.com" /></div></div>
        <Button type="submit" disabled={loading} className="mt-6 w-full rounded-full font-bold">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("Send Verification Code")}</Button>
        <Link to="/auth" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4"/>{t("Back to Owner Login")}</Link>
      </form>
    </main><Footer /></div>;
};
export default ForgotPassword;
