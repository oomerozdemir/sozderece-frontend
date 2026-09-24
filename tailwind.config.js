/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 2026 rebrand: gerçek renk değerleri src/cssFiles/index.css'teki
        // :root CSS değişkenlerinde tanımlı (tek kaynak orası). Eski isimler
        // (page-navy, lime, deep-purple, accent-orange...) className'ler
        // hiç değişmeden yeni turkuaz sisteme aksın diye korunuyor.
        brand: {
          DEFAULT: "var(--color-brand)",
          hover: "var(--color-brand-hover)",
          light: "var(--color-brand-light)",
          // Koyu lacivert zeminde metin/hover için — bkz. index.css'teki not.
          "on-dark": "var(--color-brand-on-dark)",
          orange: "var(--color-brand)", // eski, artık neredeyse kullanılmıyor
          orange2: "var(--color-brand)",
          navy: "var(--color-dark)",
          "navy-dark": "var(--color-dark)",
        },
        cream: "var(--color-background)",

        /* ── Eski "yeni marka" isimleri → yeni token'lara yönlendirildi ── */
        lime: "var(--color-brand)",
        "deep-purple": "var(--color-dark)",
        "page-dark": "var(--color-dark)",
        "page-navy": "var(--color-dark)",
        "accent-orange": "var(--color-brand)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        fredoka: ["Nunito", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        waPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(37,211,102,0.6)" },
          "70%": { boxShadow: "0 0 0 15px rgba(37,211,102,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(37,211,102,0)" },
        },
        floatUpDown: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        modalPop: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
        "fade-in-up": "fadeInUp 0.3s ease forwards",
        "wa-pulse": "waPulse 2s infinite",
        "float-up-down": "floatUpDown 5s ease-in-out infinite",
        "swim-left": "swimLeft 8s linear infinite",
        "rise": "rise 6s infinite ease-in",
        "slide-down": "slideDown 0.3s ease",
        "modal-pop": "modalPop 0.3s ease",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06)",
        "card-md": "0 4px 16px rgba(0,0,0,0.10)",
        orange: "0 4px 14px rgba(228,94,4,0.3)",
      },
    },
  },
  plugins: [],
};
