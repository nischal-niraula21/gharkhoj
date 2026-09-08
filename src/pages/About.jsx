import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import storyImg from "@/assets/about-story.jpg";
import { Quote, ShieldCheck, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
const About = () => {
    const { t } = useLang();
    return (<div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-3">{t("About GharKhoj")}</p>
            <h1 className="display text-5xl text-foreground md:text-6xl">
              {t("Built from a problem students know too well.")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {t("GharKhoj started with a simple question: why should finding a room near college be this difficult?")}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center">
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <img src={storyImg} alt="A student standing outside a brick guesthouse in Kathmandu" loading="lazy" width={1400} height={1000} className="h-full w-full object-cover"/>
        </div>
        <div>
          <Quote className="mb-4 h-8 w-8 text-primary" strokeWidth={1.4}/>
          <p className="mb-5 display text-2xl leading-snug text-foreground md:text-3xl">
            {t("When I had to search for a room near my college for my studies, the process was much harder than I expected.")}
          </p>
          <div className="space-y-4 text-muted-foreground">
            <p>
              {t("I had to depend on scattered social-media posts, walk around unfamiliar areas, ask people for contacts, and repeatedly visit rooms that did not match the information I had been given.")}
            </p>
            <p>
              {t("I noticed that many of my friends were facing the same problem. Some rooms were advertised at one price but owners asked for a much higher rent later. In other cases, brokers collected fees but did not genuinely help tenants find a suitable room.")}
            </p>
            <p className="text-foreground">
              <strong className="font-medium">{t("After looking deeper into the issue, I realized this was not only my problem. Finding trustworthy and affordable rental rooms is difficult for students, newcomers, workers and families across Nepal.")}</strong>
            </p>
            <p>
              {t("That experience became the idea behind GharKhoj: one organized place where tenants can compare approved room listings, see the actual price and location, check the nearest landmark, view photos, and contact the owner directly.")}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mb-2">{t("What we believe")}</p>
            <h2 className="display text-4xl text-foreground">{t("A home is more than four walls")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
            { icon: ShieldCheck, title: t("Verified"), body: t("Every listing is reviewed by our team before going live.") },
            { icon: Heart, title: t("No broker fees"), body: t("Tenants connect directly with owners. Always free to browse and contact.") },
            { icon: MapPin, title: t("Local first"), body: t("Built for Nepali cities — neighborhoods, prices, and amenities that actually matter.") },
        ].map(({ icon: Icon, title, body }) => (<div key={title} className="rounded-xl border border-border/60 bg-card p-7" style={{ boxShadow: "var(--card-shadow)" }}>
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2}/>
                </span>
                <h3 className="mb-2 display text-2xl text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mx-auto mb-5 max-w-xl display text-4xl text-foreground">
          {t("Find your next ghar — or help someone find theirs.")}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/search"><Button size="lg">{t("Browse rooms")}</Button></Link>
          <Link to="/list-room"><Button size="lg" variant="outline">{t("List a room")}</Button></Link>
        </div>
      </section>

      <Footer />
    </div>);
};
export default About;
