import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Sayfa Bulunamadı | Sözderece Koçluk</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="text-center py-20 px-5">
        <h1 className="text-[96px] font-bold mb-4 text-[#f58025]">404</h1>
        <p className="text-xl mb-6">Üzgünüz, aradığınız sayfa bulunamadı.</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-[#f58025] text-white no-underline rounded-md transition-colors hover:bg-[#cf670f]"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </>
  );
};

export default NotFound;
