import { Link } from "react-router-dom";

const BrandLogo = ({ to = "/", className = "", textClassName = "", iconSize = "h-10 w-10" }) => {
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/gharkhoj-logo-icon.png"
        alt="GharKhoj logo"
        className={`${iconSize} shrink-0 object-contain`}
      />
      <span className={`text-xl font-extrabold tracking-tight ${textClassName}`.trim()}>
        Ghar<span className="text-primary">Khoj</span>
      </span>
    </Link>
  );
};

export default BrandLogo;
