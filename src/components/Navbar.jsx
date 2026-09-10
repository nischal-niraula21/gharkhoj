import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bookmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useFavorites } from "@/hooks/useFavorites";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { owner, signOut } = useAuth();
  const { favorites } = useFavorites();
  const { lang, setLang, t } = useLang();

  const links = [
    { to: "/search", label: "Browse Rooms" },
    { to: "/list-room", label: "List Your Room" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Get in Touch" },
  ];

  const active = (path) => location.pathname === path;

  const logout = () => {
    signOut();
    toast.success(t("Signed out"));
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <BrandLogo
          to="/"
          textClassName="text-foreground"
          iconSize="h-10 w-10"
        />

        <div className="flex items-center gap-2">
          {/* Desktop navigation */}
          <div className="hidden items-center gap-7 md:flex">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-colors ${active(to)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                  }`}
              >
                {t(label)}
              </Link>
            ))}

            <Link
              to="/favorites"
              className={`relative flex items-center gap-1.5 text-sm font-semibold ${active("/favorites")
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
                }`}
            >
              <Bookmark
                className={`h-4 w-4 ${favorites.length
                    ? "fill-primary text-primary"
                    : ""
                  }`}
              />

              {t("Favourites")}

              {favorites.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Language */}
            <div className="flex items-center rounded-full border border-border bg-background p-0.5">
              {["EN", "NP"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {l === "EN" ? "EN" : "नेपाली"}
                </button>
              ))}
            </div>
          </div>

          {/* 
            Single theme button:
            - Desktop: stays directly in navbar
            - Mobile: stays beside hamburger
            - Never goes inside mobile menu
          */}
          <ThemeToggle />

          {/* Desktop owner controls */}
          <div className="hidden items-center gap-2 md:flex">
            {owner ? (
              <>
                <Link to="/owner/dashboard">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-full"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("Owner Dashboard")}
                  </Button>
                </Link>

                <Button
                  onClick={logout}
                  className="rounded-full bg-teal-dark px-5 text-sm font-bold text-teal-dark-foreground hover:bg-teal-dark/90"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Sign out")}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="rounded-full bg-teal-dark px-6 text-sm font-bold text-teal-dark-foreground hover:bg-teal-dark/90">
                  {t("Owner sign in")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary md:hidden"
            aria-label={t("Toggle menu")}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-foreground/80 transition hover:bg-secondary"
            >
              {t(label)}
            </Link>
          ))}

          <Link
            to="/favorites"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-foreground/80 transition hover:bg-secondary"
          >
            <Bookmark
              className={`h-4 w-4 ${favorites.length
                  ? "fill-primary text-primary"
                  : ""
                }`}
            />

            {t("Favourites")}

            {favorites.length
              ? ` (${favorites.length})`
              : ""}
          </Link>

          {/* Language remains inside mobile menu */}
          <div className="my-2 flex w-fit items-center rounded-full border border-border bg-background p-0.5">
            {["EN", "NP"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                {l === "EN" ? "EN" : "नेपाली"}
              </button>
            ))}
          </div>

          {owner ? (
            <>
              <Link
                to="/owner/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("Owner Dashboard")}
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                {t("Sign out")}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-primary"
            >
              <LogIn className="h-4 w-4" />
              {t("Owner sign in")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;