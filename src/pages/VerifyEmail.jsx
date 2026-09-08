import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MailCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const VerifyEmail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { t } = useLang();
  const email = state?.email || localStorage.getItem("gharkhoj-pending-email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return navigate("/auth");
    if (code.length !== 6) return toast.error(t("Enter the 6-digit code."));
    setLoading(true);
    try {
      await verifyEmail(email, code);
      localStorage.removeItem("gharkhoj-pending-email");
      toast.success(t("Email verified successfully."));
      navigate("/owner/dashboard");
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      setSeconds(60);
      toast.success(t("A new verification code has been sent."));
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return (
    <div className="flex min-h-screen flex-col"><Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-14">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-card p-7 text-center md:p-9" style={{ boxShadow: "var(--card-shadow)" }}>
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="h-7 w-7" /></span>
          <h1 className="display text-3xl">{t("Verify Your Email")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("We've sent a 6-digit verification code to")} <strong className="text-foreground">{email}</strong>.</p>
          <div className="my-7 flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} inputMode="numeric">
              <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />)}</InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full font-bold">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("Verify Email")}</Button>
          <div className="mt-5 text-sm text-muted-foreground">
            {seconds > 0 ? `${t("Resend code in")} 00:${String(seconds).padStart(2, "0")}` : <button type="button" onClick={resend} className="font-bold text-primary hover:underline">{t("Resend Code")}</button>}
          </div>
          <Link to="/auth" className="mt-5 inline-block text-sm font-semibold text-foreground hover:text-primary">{t("Back to Owner Login")}</Link>
        </form>
      </main><Footer />
    </div>
  );
};
export default VerifyEmail;
