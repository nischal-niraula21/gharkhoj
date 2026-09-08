import { useParams, Link } from "react-router-dom";
import { useRoom } from "@/hooks/useRooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, ArrowLeft, Calendar, Loader2, Landmark, Home, Users, Sofa, Droplets, Wifi, Car, CookingPot, Bath, ShieldCheck, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/contexts/LanguageContext";

const facilityIcons={"Attached Bathroom":Bath,"Kitchen":CookingPot,"Wi-Fi":Wifi,"Drinking Water":Droplets,"Bike Parking":Car,"Car Parking":Car,"CCTV":ShieldCheck,"Furnished":Sofa};

const RoomDetails=()=>{
  const {id}=useParams(); const {data:room,isLoading,error}=useRoom(id||""); const [activeImage,setActiveImage]=useState(0); const {t}=useLang();
  const [report,setReport]=useState({reason:"",details:"",reporterEmail:""});
  if(isLoading)return <div className="flex min-h-screen flex-col"><Navbar/><div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div></div>;
  if(error||!room)return <div className="flex min-h-screen flex-col"><Navbar/><div className="flex flex-1 flex-col items-center justify-center gap-4"><p className="text-muted-foreground">{t("Room not found.")}</p><Link to="/search"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/>{t("Back to Search")}</Button></Link></div></div>;
  const images=room.images?.length?room.images:["/placeholder.svg"];
  const owner=room.owner||{}; const phone=room.contact?.phone||owner.phone; const location=[room.area,room.municipality,room.district].filter(Boolean).join(", ");
  const sendReport=async()=>{try{await api.post(`/contact/report/${room.id||room._id}`,report);toast.success(t("Thank you. The listing has been reported for review."));setReport({reason:"",details:"",reporterEmail:""});}catch(e){toast.error(getErrorMessage(e));}};
  return <div className="flex min-h-screen flex-col"><Navbar/><main className="container mx-auto flex-1 px-4 py-8">
    <Link to="/search" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4"/>{t("Back to Search")}</Link>
    <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
      <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-muted"><img src={images[activeImage]} alt={room.title} className="h-full w-full object-cover"/></div>
      <div className="grid grid-cols-2 gap-3">{images.slice(1,5).map((img,i)=><button key={i} onClick={()=>setActiveImage(i+1)} className="overflow-hidden rounded-2xl bg-muted"><img src={img} alt="" className="h-full w-full object-cover"/></button>)}</div>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{t("Available")}</span><h1 className="display text-3xl md:text-5xl">{room.title}</h1><p className="mt-3 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary"/>{location}</p></div><div className="rounded-2xl bg-secondary px-5 py-4 text-right"><p className="text-2xl font-extrabold text-primary">NPR {Number(room.monthlyRent).toLocaleString("en-NP")}</p><p className="text-xs text-muted-foreground">{t("per month")}</p></div></div>
        <section className="mt-8"><h2 className="display mb-4 text-2xl">{t("Property Information")}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Info icon={Home} label={t("Room Type")} value={t(room.roomType)}/><Info icon={Home} label={t("Number of Rooms")} value={room.numberOfRooms}/><Info icon={Sofa} label={t("Furnished Status")} value={t(room.furnishedStatus)}/><Info icon={Users} label={t("Preferred Tenant")} value={t(room.preferredTenant)}/><Info icon={Home} label={t("Floor")} value={room.floor||"—"}/><Info icon={Calendar} label={t("Available From")} value={new Date(room.availableFrom||room.createdAt).toLocaleDateString()}/><Info icon={Home} label={t("Security Deposit")} value={`NPR ${Number(room.securityDeposit||0).toLocaleString("en-NP")}`}/></div></section>
        <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Landmark className="h-6 w-6"/></span><div><p className="eyebrow mb-2">{t("Nearest Landmark")}</p><h2 className="text-2xl font-extrabold">{room.nearestLandmark}</h2><p className="mt-2 text-sm text-muted-foreground">{room.landmarkDistance}</p><p className="mt-3 text-sm"><strong>{t("Address")}:</strong> {room.fullAddress||[room.street,room.area,room.municipality,room.district].filter(Boolean).join(", ")}</p></div></div></section>
        <section className="mt-8"><h2 className="display mb-4 text-2xl">{t("Facilities")}</h2><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{(room.facilities||[]).length?(room.facilities||[]).map((name)=>{const Icon=facilityIcons[name]||Home;return <div key={name} className="soft-card flex items-center gap-3 p-4"><Icon className="h-5 w-5 text-primary"/><span className="text-sm font-semibold">{t(name)}</span></div>}):<p className="text-sm text-muted-foreground">{t("No facilities specified.")}</p>}</div></section>
        <section className="mt-8"><h2 className="display mb-4 text-2xl">{t("Utility Charges")}</h2><div className="grid gap-3 sm:grid-cols-3"><Info icon={Droplets} label={t("Water")} value={t(room.charges?.water||"Separate")}/><Info icon={Home} label={t("Electricity")} value={t(room.charges?.electricity||"Separate")}/><Info icon={Wifi} label={t("Internet")} value={t(room.charges?.internet||"Separate")}/></div></section>
      </div>
      <aside className="h-fit rounded-3xl border bg-card p-6 lg:sticky lg:top-24" style={{boxShadow:"var(--card-shadow)"}}><p className="eyebrow mb-2">{t("Property Owner")}</p><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-extrabold text-primary">{String(room.contact?.name||owner.fullName||"O").slice(0,1)}</span><div><h3 className="font-extrabold">{room.contact?.name||owner.fullName||t("Owner")}</h3><p className="flex items-center gap-1 text-xs text-primary"><ShieldCheck className="h-3.5 w-3.5"/>{t("Verified Owner")}</p></div></div>{room.contact?.showPhone!==false&&phone&&<a href={`tel:${phone}`} onClick={()=>api.post(`/rooms/${room.id||room._id}/contact`).catch(()=>{})} className="mt-5 block"><Button className="w-full gap-2 rounded-full font-bold"><Phone className="h-4 w-4"/>{t("Call Owner")}</Button></a>}<p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("Tenants can contact the owner directly. No tenant login is required.")}</p>
        <Dialog><DialogTrigger asChild><Button variant="ghost" className="mt-4 w-full gap-2 text-destructive"><Flag className="h-4 w-4"/>{t("Report this listing")}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{t("Report this listing")}</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder={t("Reason for report")} value={report.reason} onChange={(e)=>setReport({...report,reason:e.target.value})}/><Input type="email" placeholder={t("Your email (optional)")} value={report.reporterEmail} onChange={(e)=>setReport({...report,reporterEmail:e.target.value})}/><Textarea placeholder={t("Additional details (optional)")} value={report.details} onChange={(e)=>setReport({...report,details:e.target.value})}/><Button onClick={sendReport} className="w-full">{t("Submit Report")}</Button></div></DialogContent></Dialog>
      </aside>
    </div>
  </main><Footer/></div>;
};
const Info=({icon:Icon,label,value})=><div className="soft-card p-4"><Icon className="mb-3 h-5 w-5 text-primary"/><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value||"—"}</p></div>;
export default RoomDetails;
