import "../cssFiles/index.css";

function TopBar() {
return (
<div className="top-bar">
  <div className="container">
    <div className="top-bar-left">
      <span>
        <i className="fas fa-envelope"></i> iletisim@sozderecekocluk.com
      </span>
        <span>
        <i className="fas fa-envelope"></i> <a href="https://wa.me/905312546701">+90 531 254 67 01</a>
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