// Sitede (özellikle ödeme/panel sayfalarında) tekrar tekrar el yazımı olarak
// yazılan "bg-white rounded-2xl border shadow-..." kalıbının paylaşılan hâli.
const Card = ({ padding = "p-6", className = "", children, ...props }) => (
  <div
    className={`bg-white rounded-2xl border border-[#f1f5f9] shadow-card ${padding} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
