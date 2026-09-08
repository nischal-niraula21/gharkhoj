import { Link } from "react-router-dom";
import { Bookmark, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useRooms } from "@/hooks/useRooms";
import { useLang } from "@/contexts/LanguageContext";

const Favorites=()=>{
  const {favorites}=useFavorites(); const {t}=useLang(); const {data:allRooms=[],isLoading}=useRooms();
  const rooms=favorites.map((id)=>allRooms.find((r)=>(r.id||r._id)===id)).filter(Boolean);
  return <div className="flex min-h-screen flex-col"><Navbar/><main className="container mx-auto flex-1 px-4 py-12"><p className="eyebrow mb-3">{t("Saved by you")}</p><h1 className="display mb-2 text-3xl md:text-5xl">{t("Your favourites")}</h1><p className="mb-8 text-muted-foreground">{t("Rooms you tapped the heart on. They stay saved on this device.")}</p>{isLoading&&favorites.length?<div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary"/></div>:rooms.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rooms.map((room)=><RoomCard key={room.id||room._id} {...room}/>)}</div>:<div className="soft-card flex flex-col items-center gap-4 p-14 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><Bookmark className="h-6 w-6 text-primary"/></span><h2 className="text-xl font-extrabold">{t("No favourites yet")}</h2><p className="max-w-md text-sm text-muted-foreground">{t("Browse rooms and tap the heart on any listing to keep it here for later.")}</p><Link to="/search"><Button className="rounded-full px-6 font-bold">{t("Browse rooms")}</Button></Link></div>}</main><Footer/></div>;
};
export default Favorites;
