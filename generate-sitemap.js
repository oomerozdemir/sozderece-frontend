
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "./src/components/posts.js";

/* ---------------------------------------------
 * fetch polyfill (Node <18)
 * --------------------------------------------- */
let _fetch = globalThis.fetch;
if (typeof _fetch !== "function") {
  _fetch = (await import("node-fetch")).default;
}

/* ---------------------------------------------
 * __dirname (ESM)
 * --------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ---------------------------------------------
 * Base URL helpers
 * --------------------------------------------- */
function normalizeBaseUrl(input) {
  try {
    const u = new URL(input);
    // www → apex
    u.hostname = u.hostname.replace(/^www\./i, "");
    // trailing slash temizle
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.origin;
  } catch {
    return "https://sozderecekocluk.com";
  }
}

// ENV → yoksa apex domain
const RAW_BASE =
  process.env.SITEMAP_BASE_URL ||
  process.env.PUBLIC_BASE_URL ||
  "https://sozderecekocluk.com";

export const BASE_URL = normalizeBaseUrl(RAW_BASE);
const API_BASE = `${BASE_URL}/api/v1`;

/* ---------------------------------------------
 * Güvenli fetch yardımcıları
 * --------------------------------------------- */
async function safeFetch(url, init) {
  // www barındırıyorsa apex'e retry
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

// JSON beklerken content-type doğrula; HTML gelirse hata fırlat
async function safeFetchJSON(url, init) {
  const res = await safeFetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    const snippet = await res.text();
    throw new Error(
      `Non-JSON response for ${url}. content-type="${ct}". First chars: ${snippet.slice(0, 80)}`
    );
  }
  return res.json();
}

/* ---------------------------------------------
 * XML builder
 * --------------------------------------------- */
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

/* ---------------------------------------------
 * Sabit sayfalar
 * --------------------------------------------- */
const staticRoutes = [
  { loc: "/",               priority: 1.0, changefreq: "daily"   },
  { loc: "/hakkimizda",     priority: 0.8, changefreq: "yearly"  },
  { loc: "/ekibimiz",       priority: 0.7, changefreq: "yearly"  },
  { loc: "/paket-detay",    priority: 0.7, changefreq: "monthly" },
  { loc: "/sss",            priority: 0.6, changefreq: "yearly"  },
  { loc: "/blog",           priority: 0.9, changefreq: "weekly"  },
  { loc: "/ogretmenler",    priority: 0.9, changefreq: "daily"   }, // liste sayfası
];
for (const r of staticRoutes) pushUrl(r);

/* ---------------------------------------------
 * Blog yazıları
 * --------------------------------------------- */
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

/* ---------------------------------------------
 * Öğretmen slugs — JSON endpoint > fallback
 * --------------------------------------------- */
async function fetchTeacherSlugs() {
  // En sağlıklısı JSON dönen public slugs endpoint’idir.
  // ENV ile override edilebilir.
  const ENV_EP = process.env.SITEMAP_TEACHERS_ENDPOINT;

  const candidates = [
    ENV_EP,                                              // örn: https://.../api/v1/ogretmenler/slugs
    `${API_BASE}/ogretmenler/slugs`,                    // ideal: { slugs: [...] }
    `${API_BASE}/ogretmenler?fields=slug&public=1`,     // alternatif: { items: [{slug}], ... }
  ].filter(Boolean);

  for (const ep of candidates) {
    try {
      const data = await safeFetchJSON(ep, { headers: { accept: "application/json" }, cache: "no-store" });
      if (Array.isArray(data?.slugs) && data.slugs.length) {
        return Array.from(new Set(data.slugs));
      }
      if (Array.isArray(data?.items) && data.items.length) {
        const sl = data.items.map(x => x?.slug).filter(Boolean);
        if (sl.length) return Array.from(new Set(sl));
      }
      // başka shape ise sıradaki adaya geç
    } catch (e) {
      console.error("Teacher slugs fetch failed (single):", e?.message || e);
    }
  }

  // Son çare: paginated JSON liste (hala HTML dönerse yine yakalanır)
  try {
    const acc = [];
    const pageSize = 500;
    let page = 1;
    while (true) {
      const url = `${API_BASE}/ogretmenler?limit=${pageSize}&page=${page}&fields=slug&public=1`;
      const data = await safeFetchJSON(url, { headers: { accept: "application/json" }, cache: "no-store" });
      const items = data.items || data.teachers || [];
      const got = items.map(t => t?.slug).filter(Boolean);
      acc.push(...got);
      if (items.length < pageSize) break; // son sayfa
      page += 1;
    }
    return Array.from(new Set(acc));
  } catch (e) {
    console.error("Teacher slugs fetch failed (paged):", e?.message || e);
    // Build'i kırma: öğretmensiz devam et
    return [];
  }
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

/* ---------------------------------------------
 * Dosyayı yaz
 * --------------------------------------------- */
const publicDir = join(__dirname, "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

writeFileSync(join(publicDir, "sitemap.xml"), xml, "utf8");
console.log(`✅ sitemap.xml (${teacherSlugs.length} öğretmen) üretildi @ ${BASE_URL}`);
