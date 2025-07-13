import "../cssFiles/index.css";

function TopBar() {
return (
<div className="top-bar">
  <div className="container">
    <div className="top-bar-left">
      <span>
        <i className="fas fa-envelope"></i> iletisim@sozderecekocluk.com
      </span>
    </div>
    <div className="top-bar-right">
      <a href="https://www.tiktok.com/@sozderece.com" target="_blank" rel="noreferrer">
        <i className="fab fa-tiktok"></i>
      </a>
      <a href="https://www.instagram.com/sozderece/" target="_blank" rel="noreferrer">
        <i className="fab fa-instagram"></i>
      </a>
    </div>
  </div>
</div>

);
}

export default TopBar;