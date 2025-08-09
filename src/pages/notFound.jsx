import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../cssFiles/notFound.css";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Sayfa Bulunamadı | Sözderece Koçluk</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="not-found-container">
        <h1>404</h1>
        <p>Üzgünüz, aradığınız sayfa bulunamadı.</p>
        <Link to="/" className="go-home">Ana Sayfaya Dön</Link>
      </div>
    </>
  );
};

export default NotFound;
