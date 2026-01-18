const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Site Ayarları
const BASE_URL = "https://sozderecekocluk.com";
const API_BASE = `${BASE_URL}/api/v1`;

// XML Karakterlerini Temizleme (Search Console Hatası Önleyici)
const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
    }
  });
};

// Sitemap Şablonu
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// URL Ekleme Fonksiyonu
const todayIso = new Date().toISOString();
function pushUrl({ loc, lastmod = todayIso, changefreq = "daily", priority = 0.7 }) {
  xml += `  <url>
    <loc>${escapeXml(BASE_URL + loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
}

async function generateSitemap() {
  console.log("🔄 Sitemap oluşturuluyor...");

  // 1. STATİK SAYFALAR
  const staticRoutes = [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/hakkimizda", priority: 0.8, changefreq: "monthly" },
    { loc: "/ekibimiz", priority: 0.7, changefreq: "monthly" },
    { loc: "/paket-detay", priority: 0.9, changefreq: "daily" }, // Önemli satış sayfası
    { loc: "/sss", priority: 0.6, changefreq: "yearly" },
    { loc: "/blog", priority: 0.9, changefreq: "weekly" },
    { loc: "/ogretmenler", priority: 0.9, changefreq: "daily" },
    { loc: "/iletisim", priority: 0.6, changefreq: "yearly" },
    // Sözleşme sayfaları (Search Console için gerekli)
    { loc: "/mesafeli-satis-sozlesmesi", priority: 0.3, changefreq: "yearly" },
    { loc: "/gizlilik-politikasi", priority: 0.3, changefreq: "yearly" },
    { loc: "/iade-ve-cayma", priority: 0.3, changefreq: "yearly" },
  ];

  staticRoutes.forEach(pushUrl);
  console.log(`✅ ${staticRoutes.length} statik sayfa eklendi.`);

  // 2. BLOG YAZILARI (Dosyadan Okuma Yöntemi)
  try {
    // posts.js dosyasını metin olarak okuyup veriyi ayıklıyoruz (Import hatasını çözer)
    const postsFilePath = path.join(__dirname, "src", "components", "posts.js");
    if (fs.existsSync(postsFilePath)) {
      const fileContent = fs.readFileSync(postsFilePath, "utf8");
      
      // "export const blogPosts = [...]" kısmını alıp çalıştırılabilir JS'e çeviriyoruz
      // Not: Bu yöntem güvenli bir build ortamında çalışır.
      const match = fileContent.match(/export const blogPosts = (\[[\s\S]*?\]);/);
      
      if (match && match[1]) {
        // eval kullanarak array'i parse ediyoruz (Build scripti olduğu için güvenli)
        const blogPosts = eval(match[1]);
        
        blogPosts.forEach((post) => {
          if (post.slug) {
            pushUrl({
              loc: `/blog/${post.slug}`,
              lastmod: post.date || todayIso,
              changefreq: "weekly",
              priority: 0.8,
            });
          }
        });
        console.log(`✅ ${blogPosts.length} blog yazısı eklendi.`);
      }
    } else {
      console.warn("⚠️ posts.js dosyası bulunamadı, bloglar atlandı.");
    }
  } catch (error) {
    console.error("❌ Blog yazıları işlenirken hata:", error.message);
  }

  // 3. ÖĞRETMENLER (API'den Çekme)
  try {
    console.log("⏳ Öğretmen verileri API'den çekiliyor...");
    // Tüm öğretmenleri çekmek için limit'i yüksek tutuyoruz
    const response = await axios.get(`${API_BASE}/ogretmenler?limit=1000&fields=slug&public=1`);
    
    // API yapına göre items veya teachers dizisini bulma
    const teachers = response.data.items || response.data.teachers || response.data || [];

    if (Array.isArray(teachers)) {
      let count = 0;
      teachers.forEach((teacher) => {
        if (teacher.slug) {
          pushUrl({
            loc: `/ogretmenler/${teacher.slug}`,
            changefreq: "weekly",
            priority: 0.7,
          });
          count++;
        }
      });
      console.log(`✅ ${count} öğretmen profili eklendi.`);
    }
  } catch (error) {
    console.warn("⚠️ Öğretmen verileri çekilemedi (API kapalı olabilir):", error.message);
  }

  // XML'i Kapat ve Kaydet
  xml += `</urlset>\n`;
  
  const publicDir = path.join(__dirname, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  console.log(`🎉 Sitemap başarıyla oluşturuldu: ${path.join(publicDir, "sitemap.xml")}`);
}

generateSitemap();