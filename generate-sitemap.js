const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 1. AYARLAR
// ------------------------------------
const RAW_BASE = "https://sozderecekocluk.com";
const BASE_URL = RAW_BASE.replace(/\/+$/, ""); // Sondaki slash'ı temizle
const API_BASE = `${BASE_URL}/api/v1`;

// XML Karakterlerini Temizleme (Hata Önleyici)
const escapeXml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
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

// Sitemap Başlangıcı
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const todayIso = new Date().toISOString();

// URL Ekleme Yardımcısı
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

  // 2. SABİT SAYFALAR
  // ------------------------------------
  const staticRoutes = [
    { loc: "/",                           priority: 1.0, changefreq: "daily" },
    { loc: "/hakkimizda",                 priority: 0.8, changefreq: "yearly" },
    { loc: "/ekibimiz",                   priority: 0.7, changefreq: "yearly" },
    { loc: "/paket-detay",                priority: 0.9, changefreq: "daily" },
    { loc: "/sss",                        priority: 0.7, changefreq: "monthly" },
    { loc: "/blog",                       priority: 0.9, changefreq: "weekly" },
    { loc: "/ogretmenler",                priority: 0.9, changefreq: "daily" },
    { loc: "/ucretsiz-on-gorusme",        priority: 0.8, changefreq: "yearly" },
    { loc: "/basvuru",                    priority: 0.6, changefreq: "yearly" },
    { loc: "/lgs-hazirlik",               priority: 0.9, changefreq: "weekly" },
    { loc: "/deneme-kampi",               priority: 0.9, changefreq: "weekly" },
    // Yasal Sayfalar — düzeltilmiş URL'ler
    { loc: "/mesafeli-hizmet-sozlesmesi", priority: 0.3, changefreq: "yearly" },
    { loc: "/gizlilik-politikasi-kvkk",   priority: 0.3, changefreq: "yearly" },
    { loc: "/iade-ve-cayma-politikasi",   priority: 0.3, changefreq: "yearly" },
  ];

  staticRoutes.forEach(pushUrl);
  console.log(`✅ ${staticRoutes.length} statik sayfa eklendi.`);

  // 3. BLOG YAZILARI (Dosyadan Okuma Yöntemi)
  // ------------------------------------
  try {
    // posts.js dosyasını metin olarak okuyoruz (Import hatasını bypass etmek için)
    const postsFilePath = path.join(__dirname, "src", "components", "posts.js");
    
    if (fs.existsSync(postsFilePath)) {
      const fileContent = fs.readFileSync(postsFilePath, "utf8");
      
      // Regex ile "export const blogPosts = [...]" dizisini yakalıyoruz
      const match = fileContent.match(/export const blogPosts = (\[[\s\S]*?\]);/);
      
      if (match && match[1]) {
        // Güvenli bir şekilde string'i array'e çeviriyoruz
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
      console.warn("⚠️ posts.js dosyası bulunamadı.");
    }
  } catch (error) {
    console.error("❌ Blog yazıları işlenirken hata:", error.message);
  }

  // 4. ÖĞRETMENLER (API'den Çekme)
  // ------------------------------------
  try {
    console.log("⏳ Öğretmen verileri API'den çekiliyor...");
    
    // Axios kullanarak veriyi çekiyoruz (Fetch polyfill gerekmez)
    // Tüm öğretmenleri çekmek için limit'i yüksek tutuyoruz
    const response = await axios.get(`${API_BASE}/ogretmenler`, {
      params: { limit: 1000, fields: 'slug', public: 1 },
      validateStatus: () => true // Hata fırlatmasını engelle, biz kontrol edeceğiz
    });

    if (response.status === 200 && response.data) {
      // API yapısına göre uygun diziyi bul
      const teachers = response.data.items || response.data.teachers || response.data.slugs || [];
      
      let count = 0;
      teachers.forEach((item) => {
        // Hem {slug: '...'} objesi hem de düz string slug gelme ihtimaline karşı
        const slug = typeof item === 'string' ? item : item.slug;
        
        if (slug) {
          pushUrl({
            loc: `/ogretmenler/${slug}`,
            changefreq: "weekly",
            priority: 0.7,
          });
          count++;
        }
      });
      console.log(`✅ ${count} öğretmen profili eklendi.`);
    } else {
      console.warn("⚠️ API'den veri dönmedi veya hata kodu aldı:", response.status);
    }
  } catch (error) {
    // API kapalıysa build patlamasın, sadece log düşsün
    console.warn("⚠️ Öğretmen verileri çekilemedi (Sunucu kapalı olabilir):", error.message);
  }

  // 5. KAPANIŞ VE KAYIT
  // ------------------------------------
  xml += `</urlset>\n`;
  
  const publicDir = path.join(__dirname, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  console.log(`🎉 Sitemap başarıyla oluşturuldu: ${path.join(publicDir, "sitemap.xml")}`);
}

generateSitemap();