import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Extracting content from URL:", url)

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkedInPostGenerator/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log("[v0] Successfully fetched HTML content, length:", html.length)

    // Extract title and description using simple regex patterns
    let title = ""
    let description = ""

    // Try to extract title from various sources
    const titleMatches = [
      html.match(/<title[^>]*>([^<]+)<\/title>/i),
      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i),
      html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i),
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i),
    ]

    for (const match of titleMatches) {
      if (match && match[1]) {
        title = match[1].trim()
        break
      }
    }

    // Try to extract description from various sources
    const descriptionMatches = [
      html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i),
      html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i),
      html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i),
    ]

    for (const match of descriptionMatches) {
      if (match && match[1]) {
        description = match[1].trim()
        break
      }
    }

    // If no description found, try to extract from first paragraph
    if (!description) {
      const paragraphMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i)
      if (paragraphMatch && paragraphMatch[1]) {
        description = paragraphMatch[1].trim().substring(0, 200) + "..."
      }
    }

    // Clean up HTML entities
    title = title
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
    description = description
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")

    console.log("[v0] Extracted title:", title)
    console.log("[v0] Extracted description:", description.substring(0, 100) + "...")

    if (!title && !description) {
      return NextResponse.json(
        { error: "Could not extract title or description from the provided URL" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      title: title || "Untitled Article",
      description: description || "No description available",
      url,
    })
  } catch (error) {
    console.error("[v0] Error extracting content:", error)

    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return NextResponse.json({ error: "Request timeout - URL took too long to respond" }, { status: 408 })
      }
      if (error.message.includes("fetch")) {
        return NextResponse.json({ error: "Unable to access the provided URL" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Failed to extract content from URL" }, { status: 500 })
  }
}
