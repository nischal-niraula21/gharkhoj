import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import BrandLogo from "@/components/BrandLogo";
const Footer = () => {
  const { t } = useLang();
  return (<footer className="mt-auto bg-teal-dark text-teal-dark-foreground">
    <div className="container mx-auto grid gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <BrandLogo to="/" iconSize="h-10 w-10" textClassName="text-white" />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-teal-dark-foreground/70">
          {t("A room rental platform connecting tenants with verified owner listings across Nepal.")}
        </p>
      </div>
      <div>
        <p className="mb-4 text-sm font-extrabold text-white">{t("Explore")}</p>
        <ul className="space-y-2.5 text-sm">
          <li><Link to="/search" className="text-teal-dark-foreground/80 hover:text-white">{t("Browse rooms")}</Link></li>
          <li><Link to="/list-room" className="text-teal-dark-foreground/80 hover:text-white">{t("List your room")}</Link></li>
          <li><Link to="/about" className="text-teal-dark-foreground/80 hover:text-white">{t("About")}</Link></li>
        </ul>
      </div>
      <div>
        <p className="mb-4 text-sm font-extrabold text-white">{t("Get in touch")}</p>
        <ul className="space-y-2.5 text-sm text-teal-dark-foreground/80">
          <li><Link to="/contact" className="hover:text-white">{t("Contact Ghar Khoj")}</Link></li>
          <li>info@gharkhoj.nischal-niraula.com.np</li>
          <li>+977 9825983379</li>
          <li>{t("Jhapa, Nepal")}</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs text-teal-dark-foreground/60">
      © {new Date().getFullYear()} GharKhoj · {t("Made in Nepal")}
    </div>
  </footer>);
};
export default Footer;
