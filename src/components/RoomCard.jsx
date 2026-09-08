import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, ArrowRight, Bookmark, Home, Landmark } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useLang } from "@/contexts/LanguageContext";

const RoomCard = ({ id, _id, title, monthlyRent, roomType, numberOfRooms, district, municipality, area, nearestLandmark, images }) => {
  const roomId = id || _id;
  const imageUrl = images?.[0] || "/placeholder.svg";
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLang();
  const favorite = isFavorite(roomId);
  const location = [area, municipality, district].filter(Boolean).join(", ");

  return <Link to={`/room/${roomId}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1" style={{boxShadow:"var(--card-shadow)"}}>
    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
      <img src={imageUrl} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"/>
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur"><BadgeCheck className="h-3.5 w-3.5"/>{t("Available")}</span>
      <button type="button" aria-label={favorite?t("Remove from favourites"):t("Add to favourites")} onClick={(e)=>{e.preventDefault();e.stopPropagation();toggleFavorite(roomId);}} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-transform hover:scale-110" style={{boxShadow:"var(--card-shadow)"}}><Bookmark className={`h-4.5 w-4.5 ${favorite?"fill-primary text-primary":"text-muted-foreground"}`} strokeWidth={2.2}/></button>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-semibold text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary"/>{location}</span>
      </div>
      <h3 className="text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Home className="h-3.5 w-3.5"/>{t(roomType || "Room")} · {numberOfRooms || 1}</span>
        {nearestLandmark && <span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5"/>{nearestLandmark}</span>}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><p className="text-sm font-bold text-primary">NPR {Number(monthlyRent||0).toLocaleString("en-NP")}<span className="font-medium text-muted-foreground">{t(" / month")}</span></p><span className="inline-flex items-center gap-1 text-sm font-bold text-foreground transition-all group-hover:gap-2">{t("Details")}<ArrowRight className="h-4 w-4"/></span></div>
    </div>
  </Link>;
};
export default RoomCard;
