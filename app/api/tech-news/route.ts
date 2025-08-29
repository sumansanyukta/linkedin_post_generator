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
      title: "Machine Learning Breakthrough in Healthcare",
      description:
        "New ML algorithms are helping doctors diagnose diseases faster and more accurately than traditional methods.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "MIT Technology Review" },
    },
    {
      title: "Data Science Trends Shaping 2024",
      description:
        "From automated ML to ethical AI, discover the key trends that are defining the future of data science.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Harvard Business Review" },
    },
    {
      title: "The Rise of Large Language Models",
      description:
        "How GPT and similar models are revolutionizing natural language processing and changing entire industries.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Nature" },
    },
    {
      title: "Quantum Computing Meets Machine Learning",
      description:
        "Exploring the intersection of quantum computing and AI, and what it means for the future of computation.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "IEEE Spectrum" },
    },
    {
      title: "Ethics in AI: Building Responsible Systems",
      description: "Best practices for developing AI systems that are fair, transparent, and accountable to society.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "AI Ethics Journal" },
    },
    {
      title: "Deep Learning in Computer Vision",
      description:
        "Latest advances in neural networks are pushing the boundaries of what machines can see and understand.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Computer Vision Research" },
    },
    {
      title: "Data Privacy in the Age of Big Data",
      description:
        "Balancing data utility with privacy protection as organizations collect unprecedented amounts of information.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Privacy International" },
    },
    {
      title: "AutoML: Democratizing Machine Learning",
      description:
        "How automated machine learning tools are making AI accessible to non-experts and transforming industries.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Google AI Blog" },
    },
    {
      title: "The Future of Data Engineering",
      description: "Modern data pipelines and infrastructure that power today's AI and machine learning applications.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Data Engineering Weekly" },
    },
  ]

  try {
    console.log("[v0] Attempting to fetch from NewsAPI.org")

    const queries = ["artificial intelligence", "machine learning", "data science"]
    const randomQuery = queries[Math.floor(Math.random() * queries.length)]

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(randomQuery)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=da29a9b5988943359e808d0b49096304`,
      {
        headers: {
          "User-Agent": "LinkedInPostGenerator/1.0",
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      },
    )

    if (!response.ok) {
      console.log("[v0] NewsAPI response not ok:", response.status, response.statusText)
      throw new Error(`NewsAPI request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] NewsAPI response received, processing articles...")

    if (data.articles && data.articles.length > 0) {
      const processedArticles = data.articles.slice(0, 10).map((article: any) => ({
        title: article.title || "Untitled Article",
        description: article.description
          ? article.description.length > 200
            ? article.description.substring(0, 200) + "..."
            : article.description
          : "No description available.",
        url: article.url || "#",
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: { name: article.source?.name || "Unknown Source" },
      }))

      console.log("[v0] Successfully processed", processedArticles.length, "articles from NewsAPI")
      return NextResponse.json({ articles: processedArticles })
    } else {
      console.log("[v0] No articles found in NewsAPI response, using fallback")
      throw new Error("No articles found in NewsAPI response")
    }
  } catch (error) {
    console.log("[v0] Error fetching from NewsAPI, using fallback:", error)
    return NextResponse.json({ articles: fallbackArticles })
  }
}
