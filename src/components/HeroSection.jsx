import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import heroImage from "@/assets/hero-nepal.jpg";
import { useLang } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("search", location.trim());
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    const query = params.toString();

    navigate(query ? `/browse-rooms?${query}` : "/browse-rooms");
  };

  return (
    <section
      className="relative min-h-[680px] overflow-hidden bg-cover bg-center md:min-h-[720px]"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      {/* Light darkening over IMAGE ONLY */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(3,39,42,0.68) 0%, rgba(5,43,46,0.42) 42%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* Very subtle overall depth */}
      <div className="absolute inset-0 bg-black/5" />

      {/* HERO CONTENT */}
      <div className="container relative z-10 mx-auto flex min-h-[680px] items-center px-4 pb-28 pt-16 md:min-h-[720px] md:px-6">
        <div className="w-full max-w-[930px]">
          <p className="mb-7 text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300 md:text-sm">
            {t("Verified rental listings across Nepal")}
          </p>

          <h1 className="max-w-[850px] text-5xl font-extrabold leading-[0.98] tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)] md:text-6xl lg:text-7xl">
            {t("Find a room that feels")}
            <br />
            {t("like home.")}
          </h1>

          <p className="mt-7 max-w-[760px] text-lg leading-relaxed text-white/95 drop-shadow-[0_2px_5px_rgba(0,0,0,0.25)] md:text-xl">
            {t(
              "Search affordable rooms, flats and student-friendly rentals by location and budget — then contact the owner directly.",
            )}
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-9 flex w-full max-w-[920px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row md:items-stretch"
          >
            {/* Location */}
            <div className="flex flex-1 flex-col justify-center px-7 py-5">
              <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("Location")}
              </label>

              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 shrink-0 text-teal-600" />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("Search city, area or keyword...")}
                  className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="hidden w-px bg-slate-200 md:block" />

            {/* Max Price */}
            <div className="flex min-w-[220px] flex-col justify-center border-t border-slate-200 px-7 py-5 md:border-t-0">
              <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("Max Price")}
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={t("Any price")}
                className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Search Button */}
            <div className="p-3">
              <button
                type="submit"
                className="h-full min-h-[64px] w-full rounded-2xl bg-teal-600 px-8 text-base font-bold text-white shadow-md transition-colors hover:bg-teal-700 md:min-w-[170px]"
              >
                {t("Search rooms")}
              </button>
            </div>
          </form>

          <p className="mt-5 text-sm font-medium text-white md:text-base">
            {t(
              "No tenant account required to browse listings or contact owners.",
            )}
          </p>
        </div>
      </div>

      {/* WHITE FOG / SMOKE ONLY AT THE BOTTOM */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-32 md:h-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.42) 48%, rgba(255,255,255,0.82) 75%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* Extra soft fog variation */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-24 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 45%, transparent 75%)",
        }}
      />
    </section>
  );
};

export default HeroSection;