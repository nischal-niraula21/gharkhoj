import { Link } from "react-router-dom";
import { Check, ImagePlus, MapPin, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const steps = [
  {
    icon: ImagePlus,
    step: "Step 1",
    title: "Add photos & details",
    body: "Title, address, rent, deposit, photos. Takes about 5 minutes.",
  },
  {
    icon: MapPin,
    step: "Step 2",
    title: "Pin location + landmark",
    body: "Give the full address AND the nearest landmark — temple, school, chowk or hospital. Tenants find it faster.",
  },
  {
    icon: Check,
    step: "Step 3",
    title: "Get approved & live",
    body: "Our admin team verifies within 24 hours. Then tenants can call or WhatsApp you directly — no broker.",
  },
];

const ListRoom = () => {
  const { owner } = useAuth();
  const { t } = useLang();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1360px] px-5 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-20 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary">
              {t("For owners only")}
            </p>

            <h1 className="mx-auto mt-5 max-w-[820px] text-[40px] font-extrabold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-[48px] md:text-[56px]">
              {t("Reach thousands of tenants across Nepal — free.")}
            </h1>

            <p className="mx-auto mt-6 max-w-[760px] text-[15px] leading-6 text-muted-foreground md:text-base">
              {t("List your room or flat in minutes. Tenants browse and contact you without signing up — only owners need an account to post and manage listings.")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={owner ? "/owner/list-room" : "/auth?mode=signup"}>
                <Button className="h-11 min-w-[210px] gap-2 rounded-full bg-teal-dark px-7 text-sm font-extrabold text-teal-dark-foreground hover:bg-teal-dark/90">
                  <UserPlus className="h-4 w-4" />
                  {t(owner ? "List a room now" : "Create owner account")}
                </Button>
              </Link>

              <Link to="/search">
                <Button
                  variant="outline"
                  className="h-11 min-w-[148px] rounded-full border-border bg-card px-7 text-sm font-extrabold text-foreground hover:bg-secondary"
                >
                  {t("See live listings")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3 md:gap-6">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <article
                key={step}
                className="min-h-[220px] rounded-[22px] border border-border bg-card p-7 shadow-[0_20px_45px_-34px_rgba(1,47,51,0.28)] md:p-8"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.27em] text-foreground">
                  {t(step)}
                </p>

                <span className="mt-5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
                </span>

                <h2 className="mt-5 text-[19px] font-extrabold tracking-[-0.02em] text-foreground">
                  {t(title)}
                </h2>

                <p className="mt-2 max-w-sm text-[14px] leading-[1.65] text-muted-foreground">
                  {t(body)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-7 rounded-[22px] bg-accent px-6 py-8 text-center md:px-10">
            <h2 className="text-base font-extrabold tracking-[-0.01em] text-foreground">
              {t("Tenants don't need to sign up")}
            </h2>
            <p className="mx-auto mt-2 max-w-4xl text-[13px] leading-6 text-muted-foreground">
              {t("Browsing, filtering, calling and WhatsApping owners is fully open. Accounts are only required for owners who list properties.")}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ListRoom;
