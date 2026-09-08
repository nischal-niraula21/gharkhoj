import { Fragment } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RoomCard from "@/components/RoomCard";
import Footer from "@/components/Footer";
import { useRooms } from "@/hooks/useRooms";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
const Index = () => {
    const { data: rooms, isLoading } = useRooms();
    const { t } = useLang();
    const steps = [
        { n: "01", title: t("List"), body: t("Owners post their room with photos, price, address and contact details.") },
        { n: "02", title: t("Approve"), body: t("Our admin reviews each listing before it becomes publicly searchable.") },
        { n: "03", title: t("Find"), body: t("Tenants browse, compare and contact the owner directly — no broker required.") },
    ];
    return (<div className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />

      {/* Listings */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow mb-3">{t("Recently approved")}</p>
            <h2 className="display text-3xl md:text-5xl">{t("Available rooms right now")}</h2>
          </div>
          <p className="text-muted-foreground md:pb-2">
            {t("Preview recently approved rooms. Browse the full listings page for more filters and options.")}
          </p>
        </div>

        {isLoading ? (<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>) : rooms && rooms.length > 0 ? (<>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.slice(0, 6).map((room, i) => (<div key={room.id} className="animate-fade-in" style={{ animationDelay: `${i * 90}ms` }}>
                  <RoomCard {...room}/>
                </div>))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/search">
                <Button variant="outline" className="gap-2 rounded-full border-primary/40 px-6 font-bold text-primary hover:bg-primary hover:text-primary-foreground">
                  {t("Browse all rooms")} <ArrowRight className="h-4 w-4"/>
                </Button>
              </Link>
            </div>
          </>) : (<div className="soft-card py-20 text-center">
            <p className="mb-4 text-muted-foreground">{t("No approved listings yet. Be the first.")}</p>
            <Link to="/list-room"><Button className="rounded-full font-bold">{t("List a room")}</Button></Link>
          </div>)}
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="rounded-[32px] bg-teal-dark px-6 py-12 text-teal-dark-foreground shadow-lg md:px-14 md:py-16">
          <h2 className="display mb-10 text-3xl text-white md:text-5xl">{t("How GharKhoj works")}</h2>
          <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {steps.map((s, i) => (<Fragment key={s.n}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <p className="mb-4 text-sm font-extrabold text-highlight">{s.n}</p>
                  <h3 className="mb-2 text-2xl font-extrabold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-teal-dark-foreground/75">{s.body}</p>
                </div>
                {i < steps.length - 1 && (<div className="hidden items-center justify-center md:flex">
                    <ArrowRight className="h-5 w-5 text-highlight"/>
                  </div>)}
              </Fragment>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="grid gap-8 rounded-[32px] bg-teal-dark px-6 py-12 text-teal-dark-foreground md:grid-cols-[1.2fr_auto] md:items-center md:px-14 md:py-14">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(181_85%_62%)]">{t("For owners")}</p>
            <h2 className="display mb-4 text-3xl text-white md:text-4xl">{t("Have a room sitting empty?")}</h2>
            <p className="max-w-xl text-teal-dark-foreground/80">
              {t("List it free. We verify it and put it in front of the students and families already searching your neighbourhood.")}
            </p>
          </div>
          <Link to="/list-room" className="md:justify-self-end">
            <Button size="lg" className="gap-2 rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90">
              {t("List your room")} <ArrowRight className="h-4 w-4"/>
            </Button>
          </Link>
        </div>
      </section>


      <Footer />
    </div>);
};
export default Index;
