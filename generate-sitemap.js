const fs = require("fs");
const path = require("path");
const { blogPosts } = require("/src/components/posts.js");

const baseUrl = "https://www.sozderecekocluk.com";
const today = new Date().toISOString().split("T")[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Sabit sayfalar
const staticRoutes = [
  { loc: "/", priority: 1.0 },
  { loc: "/hakkimizda", priority: 0.8 },
  { loc: "/paketler", priority: 0.9 },
  { loc: "/ekibimiz", priority: 0.7 },
  { loc: "/paket-detay", priority: 0.7 },
  { loc: "/mesafeli-sozlesme", priority: 0.6 },
  { loc: "/iade-ve-cayma-politikasi", priority: 0.6 },
  { loc: "/gizlilik-politikasi-kvkk", priority: 0.6 },
  { loc: "/sss", priority: 0.6 },
  { loc: "/blog", priority: 0.9 }
];

staticRoutes.forEach(({ loc, priority }) => {
  xml += `  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>\n`;
});

// Blog yazıları
blogPosts.forEach((post) => {
  xml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <priority>0.8</priority>
  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(path.join(__dirname, "public", "sitemap.xml"), xml);

console.log("✅ sitemap.xml başarıyla oluşturuldu.");
