import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import { useRooms } from "@/hooks/useRooms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, SlidersHorizontal, X } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const roomTypes = ["Single Room","Double Room","Flat","Apartment","Hostel Room","House"];
const facilitiesList = ["Attached Bathroom","Kitchen","Wi-Fi","Drinking Water","Bike Parking","Car Parking","Balcony"];

const SearchRooms = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const [form, setForm] = useState({ location: searchParams.get("location")||"", maxRent: searchParams.get("maxPrice")||"", roomType:searchParams.get("roomType")||"", district:"", furnishedStatus:"", sort:"newest", facilities:[] });
  const [filters, setFilters] = useState({ location: form.location||undefined, maxRent: form.maxRent||undefined, roomType: form.roomType||undefined });
  const { data: rooms, isLoading } = useRooms(filters);

  useEffect(()=>{
    const location=searchParams.get("location")||""; const maxRent=searchParams.get("maxPrice")||""; const roomType=searchParams.get("roomType")||"";
    setForm((f)=>({...f,location,maxRent,roomType})); setFilters((f)=>({...f,location:location||undefined,maxRent:maxRent||undefined,roomType:roomType||undefined}));
  },[searchParams]);

  const toggleFacility=(name)=>setForm((f)=>({...f,facilities:f.facilities.includes(name)?f.facilities.filter((x)=>x!==name):[...f.facilities,name]}));
  const apply=()=>setFilters({location:form.location||undefined,maxRent:form.maxRent||undefined,roomType:form.roomType||undefined,district:form.district||undefined,furnishedStatus:form.furnishedStatus||undefined,facilities:form.facilities,sort:form.sort});
  const clear=()=>{const empty={location:"",maxRent:"",roomType:"",district:"",furnishedStatus:"",sort:"newest",facilities:[]};setForm(empty);setFilters({});};

  return <div className="flex min-h-screen flex-col"><Navbar />
    <main className="container mx-auto flex-1 px-4 py-12">
      <p className="eyebrow mb-3">{t("All listings")}</p><h1 className="display mb-2 text-3xl md:text-5xl">{t("Find Rooms Across Nepal")}</h1><p className="mb-8 text-muted-foreground">{t("Search approved rooms by location, type, rent and facilities.")}</p>
      <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
        <aside className="soft-card h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-extrabold"><SlidersHorizontal className="h-4 w-4"/>{t("Filters")}</h2><button onClick={clear} className="text-xs font-bold text-primary">{t("Clear All")}</button></div>
          <Filter label={t("Location")}><Input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} placeholder={t("Search city, area or landmark...")}/></Filter>
          <Filter label={t("District")}><Input value={form.district} onChange={(e)=>setForm({...form,district:e.target.value})} placeholder={t("e.g. Jhapa")}/></Filter>
          <Filter label={t("Room Type")}><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.roomType} onChange={(e)=>setForm({...form,roomType:e.target.value})}><option value="">{t("Any type")}</option>{roomTypes.map((x)=><option key={x} value={x}>{t(x)}</option>)}</select></Filter>
          <Filter label={t("Maximum Rent (NPR)")}><Input type="number" value={form.maxRent} onChange={(e)=>setForm({...form,maxRent:e.target.value})} placeholder="15000"/></Filter>
          <Filter label={t("Furnished Status")}><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.furnishedStatus} onChange={(e)=>setForm({...form,furnishedStatus:e.target.value})}><option value="">{t("Any")}</option>{["Furnished","Semi-Furnished","Unfurnished"].map((x)=><option key={x}>{t(x)}</option>)}</select></Filter>
          <Filter label={t("Facilities")}><div className="flex flex-wrap gap-2">{facilitiesList.map((x)=><button type="button" key={x} onClick={()=>toggleFacility(x)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${form.facilities.includes(x)?"border-primary bg-primary text-primary-foreground":"border-border bg-background text-muted-foreground"}`}>{t(x)}</button>)}</div></Filter>
          <Button onClick={apply} className="w-full gap-2 rounded-full font-bold"><Search className="h-4 w-4"/>{t("Search rooms")}</Button>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{isLoading?t("Searching..."):`${rooms?.length||0} ${t((rooms?.length||0)===1?"room found":"rooms found")}`}</p><select value={form.sort} onChange={(e)=>{const sort=e.target.value;setForm({...form,sort});setFilters({...filters,sort});}} className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold"><option value="newest">{t("Newest")}</option><option value="price_asc">{t("Price Low to High")}</option><option value="price_desc">{t("Price High to Low")}</option></select></div>
          {isLoading?<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>:rooms?.length?<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((room,i)=><div key={room.id||room._id} className="animate-fade-in" style={{animationDelay:`${i*60}ms`}}><RoomCard {...room}/></div>)}</div>:<div className="soft-card py-20 text-center"><X className="mx-auto mb-3 h-8 w-8 text-muted-foreground"/><p className="font-bold">{t("No rooms match your search.")}</p><Button variant="outline" onClick={clear} className="mt-4 rounded-full">{t("Clear Filters")}</Button></div>}
        </section>
      </div>
    </main><Footer /></div>;
};
const Filter=({label,children})=><div><label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</label>{children}</div>;
export default SearchRooms;
