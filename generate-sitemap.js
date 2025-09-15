// generate-sitemap.js
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "./src/components/posts.js";

// Node 18+ ise fetch global; değilse node-fetch'e düş
let _fetch = globalThis.fetch;
if (typeof _fetch !== "function") {
  _fetch = (await import("node-fetch")).default;
}

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tek tip domain KULLAN (www'lu)
const baseHost = "https://www.sozderecekocluk.com";
const apiBase  = `${baseHost}/api/v1`;

const todayIso = new Date().toISOString(); // tam ISO
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// --- Sabit sayfalar ---
const staticRoutes = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/hakkimizda", priority: 0.8, changefreq: "yearly" },
  { loc: "/paketler", priority: 0.9, changefreq: "monthly" },
  { loc: "/ekibimiz", priority: 0.7, changefreq: "yearly" },
  { loc: "/paket-detay", priority: 0.7, changefreq: "monthly" },
  { loc: "/sss", priority: 0.6, changefreq: "yearly" },
  { loc: "/blog", priority: 0.9, changefreq: "weekly" },
  { loc: "/ogretmenler", priority: 0.9, changefreq: "daily" }, // liste sayfası
];

for (const { loc, priority, changefreq } of staticRoutes) {
  xml += `  <url>
    <loc>${baseHost}${loc}</loc>
    <lastmod>${todayIso}</lastmod>
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    <priority>${priority}</priority>
  </url>\n`;
}

// --- Blog yazıları ---
for (const post of blogPosts) {
  if (!post?.slug) continue;
  const last = post.date || todayIso;
  xml += `  <url>
    <loc>${baseHost}/blog/${post.slug}</loc>
    <lastmod>${last}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
}

// --- Öğretmen slug'larını build-time'da çek (pagination'lı) ---
async function fetchTeacherSlugs() {
  const slugs = [];
  const pageSize = 500;
  let page = 1;

  while (true) {
    const url = `${apiBase}/ogretmenler?limit=${pageSize}&page=${page}`;
    try {
      const resp = await _fetch(url, { headers: { "accept": "application/json" } });
      if (!resp.ok) break;
      const data = await resp.json();
      const items = data.items || data.teachers || [];
      for (const t of items) {
        if (t?.slug) slugs.push(t.slug);
      }
      if (items.length < pageSize) break; // son sayfa
      page += 1;
    } catch (err) {
      console.error("Teacher slugs fetch failed:", err);
      break;
    }
  }
  return Array.from(new Set(slugs)); // tekrarı kırp
}

const teacherSlugs = await fetchTeacherSlugs();
for (const slug of teacherSlugs) {
  xml += `  <url>
    <loc>${baseHost}/ogretmenler/${slug}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
}

xml += `</urlset>\n`;

// public klasörünü oluştur (yoksa)
const publicDir = join(__dirname, "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// sitemap'i kaydet
writeFileSync(join(publicDir, "sitemap.xml"), xml, "utf8");
console.log(`✅ sitemap.xml (${teacherSlugs.length} öğretmen) başarıyla oluşturuldu.`);
