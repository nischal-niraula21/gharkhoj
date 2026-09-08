import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const email = sessionStorage.getItem("gharkhoj-reset-email") || "";
  const resetToken = sessionStorage.getItem("gharkhoj-reset-token") || "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (!email || !resetToken) navigate("/forgot-password", { replace: true }); }, [email, resetToken, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) return toast.error(t("Password must be at least 8 characters"));
    if (form.newPassword !== form.confirmPassword) return toast.error(t("Passwords do not match"));
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, resetToken, ...form });
      sessionStorage.removeItem("gharkhoj-reset-email");
      sessionStorage.removeItem("gharkhoj-reset-token");
      setDone(true);
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  return <div className="flex min-h-screen flex-col"><Navbar />
    <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 md:p-9" style={{ boxShadow: "var(--card-shadow)" }}>
        {done ? <div className="text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-primary"/><h1 className="display mt-5 text-3xl">{t("Password Reset Successful")}</h1><p className="mt-3 text-sm text-muted-foreground">{t("Your password has been changed successfully.")}</p><Button onClick={() => navigate("/auth")} className="mt-7 w-full rounded-full font-bold">{t("Back to Owner Login")}</Button></div> : <form onSubmit={submit}>
          <h1 className="display text-3xl">{t("Create New Password")}</h1><p className="mt-3 text-sm text-muted-foreground">{t("Choose a new password for your GharKhoj owner account.")}</p>
          <div className="mt-7 space-y-5"><PasswordField label={t("New Password")} value={form.newPassword} onChange={(v) => setForm({ ...form, newPassword: v })}/><PasswordField label={t("Confirm New Password")} value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })}/></div>
          <p className="mt-3 text-xs text-muted-foreground">{t("Use at least 8 characters.")}</p>
          <Button type="submit" disabled={loading} className="mt-6 w-full rounded-full font-bold">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{t("Reset Password")}</Button>
        </form>}
      </div>
    </main><Footer /></div>;
};
const PasswordField = ({ label, value, onChange }) => <div><Label>{label}</Label><div className="relative mt-1"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input type="password" value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" /></div></div>;
export default ResetPassword;
