import { articlesData } from "./js/data.js";
import fs from "fs";

const baseUrl = "https://islamic-portal.vercel.app";

let urls = "";

// Homepage
urls += `
<url>
  <loc>${baseUrl}</loc>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
`;

// Loop semua artikel
Object.keys(articlesData).forEach((id) => {
  const article = articlesData[id];

  urls += `
  <url>
    <loc>${baseUrl}/article.html?id=${id}</loc>
    <lastmod>${article.createdAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap);

console.log("✅ Sitemap berhasil dibuat!");
