import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero-nepal.jpg";
import { useLang } from "@/contexts/LanguageContext";

const HeroSection=()=>{
  const navigate=useNavigate(); const {t}=useLang(); const [location,setLocation]=useState(""); const [roomType,setRoomType]=useState(""); const [maxPrice,setMaxPrice]=useState("");
  const handleSearch=()=>{const params=new URLSearchParams();if(location)params.set("location",location);if(roomType)params.set("roomType",roomType);if(maxPrice)params.set("maxPrice",maxPrice);navigate(`/search?${params.toString()}`);};
  return <section className="relative isolate overflow-hidden"><img src={heroImg} alt="Kathmandu valley skyline at golden hour with the Himalayas behind" className="absolute inset-0 -z-20 h-full w-full object-cover" width={1920} height={1080}/><div className="absolute inset-0 -z-10" style={{background:"var(--hero-overlay)"}}/><div className="container relative mx-auto px-4 pb-24 pt-20 md:pb-32 md:pt-28"><div className="max-w-4xl animate-fade-in-slow"><p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(181_85%_62%)]">{t("Verified rental listings across Nepal")}</p><h1 className="display text-[2.9rem] leading-[1.03] text-white sm:text-6xl md:text-[4.6rem]">{t("Find a room that")}<span className="block">{t("feels like home.")}</span></h1><p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">{t("Search affordable rooms, flats and student-friendly rentals by location and budget — then contact the owner directly.")}</p>
    <div className="mt-9 grid max-w-4xl gap-2 rounded-3xl bg-card p-3 shadow-2xl sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-center sm:gap-0">
      <div className="px-3 py-1"><label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t("Location")}</label><div className="relative"><Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"/><Input placeholder={t("Search city, area or keyword...")} value={location} onChange={(e)=>setLocation(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleSearch()} className="h-9 border-none bg-transparent pl-7 shadow-none focus-visible:ring-0"/></div></div>
      <div className="border-border px-3 py-1 sm:border-l"><label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t("Room Type")}</label><div className="relative"><Home className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"/><select value={roomType} onChange={(e)=>setRoomType(e.target.value)} className="h-9 w-full appearance-none border-0 bg-transparent pl-7 text-sm outline-none"><option value="">{t("Any type")}</option>{["Single Room","Double Room","Flat","Apartment","Hostel Room","House"].map((x)=><option key={x} value={x}>{t(x)}</option>)}</select></div></div>
      <div className="border-border px-3 py-1 sm:border-l"><label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t("Max price")}</label><Input placeholder="NPR 15,000" type="number" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleSearch()} className="h-9 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"/></div>
      <Button onClick={handleSearch} className="h-14 gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground hover:bg-primary/90">{t("Search rooms")}<ArrowRight className="h-4 w-4"/></Button>
    </div><p className="mt-4 text-sm text-white/75">{t("No tenant account required to browse listings or contact owners.")}</p></div></div></section>;
};
export default HeroSection;
