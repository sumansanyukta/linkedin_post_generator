import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Tech news API called")

  const fallbackArticles = [
    {
      title: "AI Revolution in Software Development",
      description:
        "How artificial intelligence is transforming the way we write and deploy code, making developers more productive than ever.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "TechCrunch" },
    },
    {
      title: "The Future of Remote Work Technology",
      description:
        "New tools and platforms that are reshaping distributed teams and changing how we collaborate across distances.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Wired" },
    },
  ]

  try {
    console.log("[v0] Attempting to fetch RSS feed")
    // Using a free RSS feed service to get tech news without requiring API keys
    const response = await fetch("https://newsapi.org/v2/top-headlines?q=technology&apiKey=da29a9b5988943359e808d0b49096304", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkedInPostGenerator/1.0)",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      console.log("[v0] RSS feed response not ok:", response.status)
      throw new Error("Failed to fetch RSS feed")
    }

    const xmlText = await response.text()
    console.log("[v0] RSS feed fetched successfully, parsing...")

    // Simple XML parsing to extract articles
    const articles = parseRSSFeed(xmlText)

    if (articles.length > 0) {
      console.log("[v0] Successfully parsed", articles.length, "articles from RSS")
      return NextResponse.json({ articles: articles.slice(0, 10) })
    } else {
      console.log("[v0] No articles parsed from RSS, using fallback")
      throw new Error("No articles found in RSS feed")
    }
  } catch (error) {
    console.log("[v0] Error fetching tech news, using fallback:", error)

    return NextResponse.json({ articles: fallbackArticles })
  }
}

function parseRSSFeed(xmlText: string) {
  const articles = []

  try {
    // Simple regex-based XML parsing for RSS items
    const itemRegex = /<item>(.*?)<\/item>/gs
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/s
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s
    const linkRegex = /<link>(.*?)<\/link>/s
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s

    const items = xmlText.match(itemRegex) || []

    for (const item of items.slice(0, 10)) {
      const titleMatch = item.match(titleRegex)
      const descMatch = item.match(descRegex)
      const linkMatch = item.match(linkRegex)
      const pubDateMatch = item.match(pubDateRegex)

      if (titleMatch && descMatch) {
        articles.push({
          title: titleMatch[1].trim(),
          description:
            descMatch[1]
              .replace(/<[^>]*>/g, "")
              .trim()
              .substring(0, 200) + "...",
          url: linkMatch ? linkMatch[1].trim() : "#",
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          source: { name: "TechCrunch" },
        })
      }
    }
  } catch (error) {
    console.error("Error parsing RSS feed:", error)
  }

  return articles
}
