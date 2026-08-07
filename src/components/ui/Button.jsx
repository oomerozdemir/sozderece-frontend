import { forwardRef } from "react";
import { Link } from "react-router-dom";

// Tüm sitede tekrarlanan buton stillerinin (her sayfanın kendi .xx-btn class'ı
// veya inline hex'i) tek bir yerde toplandığı hâli. Varyantlar, kod tabanında
// zaten var olan iki ayrı ama tutarlı dilin karşılığı:
//  - "hero"                → pazarlama/navbar CTA'ları (lime, koyu zemin üstünde)
//  - "primary"/"secondary" → form/checkout/auth birincil eylemleri (turuncu/lacivert)
//  - "success"/"danger"/"neutral" → admin panelindeki soft-pill onay/iptal/sil dili
//  - "outline"/"ghost"/"link"     → ikincil/az vurgulu eylemler
const VARIANTS = {
  hero: "bg-lime text-page-dark hover:bg-white shadow-[0_4px_14px_rgba(216,255,79,0.3)]",
  primary: "bg-accent-orange text-white hover:bg-[#e55a2b] shadow-[0_4px_14px_rgba(255,107,53,0.3)]",
  secondary: "bg-page-navy text-white hover:bg-[#151474]",
  outline: "bg-transparent text-page-navy border border-page-navy/30 hover:bg-page-navy hover:text-white",
  ghost: "bg-transparent text-page-navy hover:bg-page-navy/5",
  link: "bg-transparent text-page-navy underline p-0 hover:text-accent-orange",
  success: "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] hover:bg-[#d1fae5]",
  danger: "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fee2e2]",
  neutral: "bg-[#f1f5f9] text-[#475569] border border-transparent hover:bg-[#e2e8f0]",
  info: "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#dbeafe]",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-5 py-2.5 rounded-xl gap-2",
  lg: "text-base px-8 py-4 rounded-2xl gap-2.5",
};

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
);

/**
 * Paylaşılan buton bileşeni. `to` verilirse react-router `<Link>`, `href`
 * verilirse `<a>`, hiçbiri yoksa `<button>` render eder — üçünde de aynı
 * görsel dil kullanılır.
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    to,
    href,
    className = "",
    children,
    ...props
  },
  ref
) {
  const isLinkVariant = variant === "link";
  const base = `inline-flex items-center justify-center font-bold font-nunito transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
    isLinkVariant ? "" : "hover:scale-[1.02] active:scale-[0.98]"
  }`;
  const classes = [
    base,
    VARIANTS[variant] || VARIANTS.primary,
    isLinkVariant ? "" : SIZES[size] || SIZES.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <Spinner />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={`${classes} no-underline`} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={`${classes} no-underline`} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={props.type || "button"} disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
});

export default Button;
