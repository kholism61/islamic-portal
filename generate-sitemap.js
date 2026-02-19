import { articlesData } from "./js/data.js";
import fs from "fs";

const baseUrl = "https://islamic-portal.vercel.app";

let urls = `
  <url>
    <loc>${baseUrl}/</loc>
  </url>
`;

Object.keys(articlesData).forEach((id) => {
  urls += `
  <url>
    <loc>${baseUrl}/article.html?id=${id}</loc>
  </url>
  `;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap);

console.log("✅ Sitemap berhasil dibuat!");