import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/contexts/LanguageContext";
import { api, getErrorMessage } from "@/lib/api";

const faqs = [
  { q: "Is GharKhoj free for tenants?", a: "Yes. Browsing approved room listings, viewing photos, checking prices and contacting owners directly is completely free for tenants. You never pay a broker fee through GharKhoj." },
  { q: "Do tenants need to register?", a: "No account is needed to browse or contact owners. You can save rooms to your favourites using the bookmark icon on each card — those are stored in your browser, so no sign-in is required." },
  { q: "How do property owners list a room?", a: "Owners create an account, verify their email, add at least five room photos and listing details, then submit. Each listing is reviewed by GharKhoj before it appears publicly." },
  { q: "How do I report a fake or misleading listing?", a: "Open the room details page and use Report this listing, or send us a message here. The admin can review reported listings in the admin console." },
];
const details = [{ icon: Mail, label: "Email", value: "info@gharkhoj-nischal-niraula.np" }, { icon: Phone, label: "Phone", value: "+977 9825983379" }, { icon: MapPin, label: "Office", value: "Jhapa, Nepal" }, { icon: Clock, label: "Hours", value: "Sun – Fri, 10am – 6pm" }];

const Contact = () => {
  const { t } = useLang(); const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" }); const [loading, setLoading] = useState(false);
  const submit = async (e) => { e.preventDefault(); if (!form.name || !form.email || !form.message) return toast.error(t("Please fill in your name, email and message.")); setLoading(true); try { const { data } = await api.post("/contact", form); toast.success(t(data.message)); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); } catch (error) { toast.error(getErrorMessage(error)); } finally { setLoading(false); } };
  return <div className="flex min-h-screen flex-col"><Navbar /><section className="border-b border-border/60 bg-secondary/40"><div className="container mx-auto px-4 py-16 md:py-20"><div className="max-w-2xl"><p className="eyebrow mb-3">{t("Get in touch")}</p><h1 className="display text-4xl md:text-5xl">{t("We're here to help you find home.")}</h1><p className="mt-5 text-muted-foreground">{t("Questions about a listing, verification, or listing your own room? Send us a message and a real person from the Ghar Khoj team will reply.")}</p></div></div></section>
    <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[1fr_1.1fr] md:py-20"><div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">{details.map(({ icon: Icon, label, value }) => <div key={label} className="soft-card flex items-start gap-4 p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{t(label)}</p><p className="mt-1 font-semibold">{t(value)}</p></div></div>)}</div>
      <form onSubmit={submit} className="soft-card space-y-5 p-7 md:p-9"><h2 className="text-2xl font-extrabold">{t("Send a message")}</h2><div className="grid gap-5 sm:grid-cols-2"><Field label={t("Your name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Field label={t("Email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} /><Field label={t("Phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /><Field label={t("Subject")} value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} /></div><div><Label>{t("Message")}</Label><Textarea className="mt-1" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("Tell us how we can help...")} /></div><Button disabled={loading} className="rounded-full font-bold">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("Send message")}</Button></form>
    </section>
    <section className="container mx-auto px-4 pb-20"><div className="mx-auto max-w-3xl"><p className="eyebrow mb-3 text-center">
      {t("Common questions")}</p><h2 className="display mb-6 text-center text-3xl">{t("Answers before you ask.")}
      </h2>
      <Accordion type="single" collapsible className="soft-card px-6">{faqs.map((x, i) => <AccordionItem key={i} value={`faq-${i}`}>
        <AccordionTrigger>
          <span className="flex-1 pr-4 text-left">
            {t(x.q)}
          </span>
        </AccordionTrigger>
        <AccordionContent className="leading-relaxed text-muted-foreground">{t(x.a)}
        </AccordionContent></AccordionItem>)}
      </Accordion>
    </div>
    </section>
    <Footer /></div>;
};
const Field = ({ label, type = "text", value, onChange }) => <div><Label>{label}</Label><Input className="mt-1" type={type} value={value}
  onChange={(e) => onChange(e.target.value)} /></div>;
export default Contact;
