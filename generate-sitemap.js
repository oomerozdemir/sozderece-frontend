// generate-sitemap.js
// ESM script: Node 18+ global fetch; değilse node-fetch'e düşer.
// www TLS sorununu önlemek için BASE_URL’i apex’e (www’suz) normalize eder.

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "./src/components/posts.js";

// -------- fetch polyfill (Node <18) --------
let _fetch = globalThis.fetch;
if (typeof _fetch !== "function") {
  _fetch = (await import("node-fetch")).default;
}

// -------- __dirname (ESM) --------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// -------- Base URL helpers --------
function normalizeBaseUrl(input) {
  // Geçerli bir URL bekler; www'yi kaldır, trailing slash'ı at
  try {
    const u = new URL(input);
    u.hostname = u.hostname.replace(/^www\./i, ""); // www → apex
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.origin;
  } catch {
    return "https://sozderecekocluk.com";
  }
}

// ENV’lerden al; yoksa apex domain
const RAW_BASE =
  process.env.SITEMAP_BASE_URL ||
  process.env.PUBLIC_BASE_URL ||
  "https://sozderecekocluk.com";

export const BASE_URL = normalizeBaseUrl(RAW_BASE);
const API_BASE = `${BASE_URL}/api/v1`;

// -------- fetch wrapper (www→apex fallback) --------
async function safeFetch(url, init) {
  try {
    return await _fetch(url, init);
  } catch (e) {
    try {
      const u = new URL(url);
      if (/^www\./i.test(u.hostname)) {
        u.hostname = u.hostname.replace(/^www\./i, "");
        return await _fetch(u.toString(), init);
      }
      throw e;
    } catch {
      throw e;
    }
  }
}

// -------- XML builder helpers --------
const todayIso = new Date().toISOString();
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

function pushUrl({ loc, lastmod = todayIso, changefreq, priority = 0.6 }) {
  xml += `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    <priority>${priority}</priority>
  </url>\n`;
}

// -------- Static routes --------
const staticRoutes = [
  { loc: "/",               priority: 1.0, changefreq: "daily"   },
  { loc: "/hakkimizda",     priority: 0.8, changefreq: "yearly"  },
  { loc: "/paketler",       priority: 0.9, changefreq: "monthly" },
  { loc: "/ekibimiz",       priority: 0.7, changefreq: "yearly"  },
  { loc: "/paket-detay",    priority: 0.7, changefreq: "monthly" },
  { loc: "/sss",            priority: 0.6, changefreq: "yearly"  },
  { loc: "/blog",           priority: 0.9, changefreq: "weekly"  },
  { loc: "/ogretmenler",    priority: 0.9, changefreq: "daily"   },
];

for (const r of staticRoutes) pushUrl(r);

// -------- Blog posts --------
for (const post of blogPosts) {
  if (!post?.slug) continue;
  const last = post.date || todayIso;
  pushUrl({
    loc: `/blog/${post.slug}`,
    lastmod: last,
    changefreq: "weekly",
    priority: 0.8,
  });
}

// -------- Teachers (paginated) --------
async function fetchTeacherSlugs() {
  const slugs = [];
  const pageSize = 500;
  let page = 1;

  while (true) {
    const url = `${API_BASE}/ogretmenler?limit=${pageSize}&page=${page}`;
    try {
      const resp = await safeFetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
      if (!resp.ok) break;
      const data = await resp.json();
      const items = data.items || data.teachers || [];
      for (const t of items) if (t?.slug) slugs.push(t.slug);
      if (items.length < pageSize) break; // last page
      page += 1;
    } catch (err) {
      console.error("Teacher slugs fetch failed:", err);
      break;
    }
  }
  // uniq
  return Array.from(new Set(slugs));
}

const teacherSlugs = await fetchTeacherSlugs();
for (const slug of teacherSlugs) {
  pushUrl({
    loc: `/ogretmenler/${slug}`,
    changefreq: "daily",
    priority: 0.7,
  });
}

xml += `</urlset>\n`;

// -------- Write file to public/sitemap.xml --------
const publicDir = join(__dirname, "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

writeFileSync(join(publicDir, "sitemap.xml"), xml, "utf8");
console.log(`✅ sitemap.xml (${teacherSlugs.length} öğretmen) üretildi @ ${BASE_URL}`);
