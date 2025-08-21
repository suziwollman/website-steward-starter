import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) { res.status(400).json({ error: "Missing 'url' query param" }); return; }

    const resp = await fetch(String(url), { headers: { "User-Agent": "Website-Steward" }});
    const html = await resp.text();
    const $ = cheerio.load(html);

    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const og = {
      ogTitle: $('meta[property="og:title"]').attr("content") || "",
      ogDesc: $('meta[property="og:description"]').attr("content") || "",
      ogImage: $('meta[property="og:image"]').attr("content") || "",
      twitterCard: $('meta[name="twitter:card"]').attr("content") || ""
    };
    const imgs = $("img").map((_, el) => ({ src: $(el).attr("src") || "", alt: (($(el).attr("alt")) || "").trim() })).get();
    const missingAlt = imgs.filter(i => !i.alt);
    const links = $("a[href]").map((_, el) => $(el).attr("href")).get();

    res.status(200).json({
      url,
      title, titleLength: title.length,
      metaDesc, metaDescLength: metaDesc.length,
      h1s, h1Count: h1s.length,
      canonical, og,
      imageCount: imgs.length, missingAltCount: missingAlt.length, sampleMissingAlt: missingAlt.slice(0, 15),
      linkCount: links.length
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
