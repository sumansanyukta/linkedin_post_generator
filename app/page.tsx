"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, TrendingUp, Hash, ImageIcon, Search, Plus, X, RefreshCw, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface TechArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

interface CustomUrlContent {
  title: string
  description: string
  url: string
}

interface GeneratedContent {
  titles: string[]
  selectedTitle: string
  body: string
  cta: string
  hashtags: string[]
  customHashtags: string[]
  thumbnail?: string
  thumbnailStyle?: string
}

const THUMBNAIL_TEMPLATES = [
  {
    id: "gradient-modern",
    name: "Modern Gradient",
    description: "Clean gradient background with bold typography",
    preview: "bg-gradient-to-br from-blue-600 to-purple-600",
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Dark background with white text for professional look",
    preview: "bg-gray-900",
  },
  {
    id: "bright-accent",
    name: "Bright Accent",
    description: "White background with colorful accent elements",
    preview: "bg-white border-l-4 border-blue-500",
  },
  {
    id: "tech-grid",
    name: "Tech Grid",
    description: "Grid pattern background for tech-focused content",
    preview: "bg-slate-800",
  },
]

const POST_CATEGORIES = [
  {
    name: "One Slide Wisdom",
    description: "Share knowledge and teach your audience",
    engagement: "High",
    icon: "📚",
    examples: ["How-to guides", "Industry insights", "Best practices"],
  },
  {
    name: "Code Snippet of the week",
    description: "Motivate and inspire your network",
    engagement: "Very High",
    icon: "✨",
    examples: ["Success stories", "Motivational quotes", "Personal growth"],
  },
  {
    name: "A week in data",
    description: "Share latest developments and trends",
    engagement: "Medium",
    icon: "📰",
    examples: ["Breaking news", "Market updates", "Company announcements"],
  },
  {
    name: "One-Minute Metric",
    description: "Celebrate successes",
    engagement: "Medium",
    icon: "🏆",
    examples: ["Awards", "Certifications", "Company growth"],
  },
]

export default function LinkedInPostGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("One Slide Wisdom") // Set default category
  const [topicSearch, setTopicSearch] = useState("")
  const [techArticles, setTechArticles] = useState<TechArticle[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [articlesError, setArticlesError] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [isLoadingCustomUrl, setIsLoadingCustomUrl] = useState(false)
  const [customUrlError, setCustomUrlError] = useState("")
  const [customUrlContent, setCustomUrlContent] = useState<CustomUrlContent | null>(null)
  const [newHashtag, setNewHashtag] = useState("")
  const [isRegeneratingHashtags, setIsRegeneratingHashtags] = useState(false)
  const [isRegeneratingContent, setIsRegeneratingContent] = useState(false) // Add state for content regeneration
  const [selectedThumbnailTemplate, setSelectedThumbnailTemplate] = useState("")
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    titles: [],
    selectedTitle: "",
    body: "",
    cta: "",
    hashtags: [],
    customHashtags: [],
  })

  useEffect(() => {
    fetchTechNews()
  }, [])

  const fetchTechNews = async () => {
    setIsLoadingArticles(true)
    setArticlesError("")
    console.log("[v0] Starting to fetch tech news")

    try {
      const response = await fetch("/api/tech-news")
      console.log("[v0] Tech news API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Tech news API response data:", data)

      if (data.articles && Array.isArray(data.articles)) {
        console.log("[v0] Successfully loaded", data.articles.length, "articles")
        setTechArticles(data.articles)
      } else {
        console.log("[v0] Invalid response format:", data)
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("[v0] Error fetching tech news:", error)
      setArticlesError("Error fetching data")
      setTechArticles([])
    } finally {
      setIsLoadingArticles(false)
    }
  }

  const fetchCustomUrlContent = async () => {
    if (!customUrl.trim()) return

    setIsLoadingCustomUrl(true)
    setCustomUrlError("")
    console.log("[v0] Fetching content from custom URL:", customUrl)

    try {
      const response = await fetch("/api/extract-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: customUrl }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Custom URL content extracted:", data)

      if (data.title && data.description) {
        setCustomUrlContent({
          title: data.title,
          description: data.description,
          url: customUrl,
        })
        setCustomUrlError("")
      } else {
        throw new Error("Failed to extract content from URL")
      }
    } catch (error) {
      console.error("[v0] Error fetching custom URL content:", error)
      setCustomUrlError("Failed to extract content from URL. Please check the URL and try again.")
      setCustomUrlContent(null)
    } finally {
      setIsLoadingCustomUrl(false)
    }
  }

  const filteredArticles = techArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
      article.description.toLowerCase().includes(topicSearch.toLowerCase())
    return matchesSearch
  })

  const steps = [
    { id: 1, name: "Select Topic", icon: TrendingUp },
    { id: 2, name: "Generate Content", icon: Sparkles },
    { id: 3, name: "Manage Hashtags", icon: Hash },
    { id: 4, name: "Generate Thumbnail", icon: ImageIcon },
    { id: 5, name: "Final Post", icon: ImageIcon },
  ]

  const handleTopicSelect = (articleTitle: string, isCustom = false) => {
    setSelectedTopic(articleTitle)
    setCurrentStep(2) // Skip category selection, go directly to content generation
  }

  const regenerateContent = async (newCategory: string) => {
    setIsRegeneratingContent(true)
    setSelectedCategory(newCategory)

    try {
      const bodyResponse = await fetch("/api/generate-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: newCategory,
          title: generatedContent.selectedTitle,
        }),
      })
      const bodyData = await bodyResponse.json()

      if (bodyData.error) {
        throw new Error(`Body API error: ${bodyData.error}`)
      }

      if (!bodyData || !bodyData.body) {
        throw new Error("Invalid body response: Expected body content")
      }

      const ctaResponse = await fetch("/api/generate-cta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: newCategory,
        }),
      })
      const ctaData = await ctaResponse.json()

      if (ctaData.error) {
        throw new Error(`CTA API error: ${ctaData.error}`)
      }

      if (!ctaData || !ctaData.cta) {
        throw new Error("Invalid CTA response: Expected CTA content")
      }

      setGeneratedContent((prev) => ({
        ...prev,
        body: bodyData.body,
        cta: ctaData.cta,
      }))
    } catch (error) {
      console.error("Error regenerating content:", error)
      // Keep existing content on error
    } finally {
      setIsRegeneratingContent(false)
    }
  }

  const generateContent = async () => {
    setIsGenerating(true)
    try {
      const titlesResponse = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory, // Use default category
        }),
      })
      const titlesData = await titlesResponse.json()

      if (titlesData.error) {
        throw new Error(`Titles API error: ${titlesData.error}`)
      }

      if (!titlesData || !titlesData.titles || !Array.isArray(titlesData.titles) || titlesData.titles.length === 0) {
        throw new Error("Invalid titles response: Expected array of titles")
      }

      const bodyResponse = await fetch("/api/generate-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory, // Use default category
          title: titlesData.titles[0],
        }),
      })
      const bodyData = await bodyResponse.json()

      if (bodyData.error) {
        throw new Error(`Body API error: ${bodyData.error}`)
      }

      if (!bodyData || !bodyData.body) {
        throw new Error("Invalid body response: Expected body content")
      }

      const ctaResponse = await fetch("/api/generate-cta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory, // Use default category
        }),
      })
      const ctaData = await ctaResponse.json()

      if (ctaData.error) {
        throw new Error(`CTA API error: ${ctaData.error}`)
      }

      if (!ctaData || !ctaData.cta) {
        throw new Error("Invalid CTA response: Expected CTA content")
      }

      const hashtagsResponse = await fetch("/api/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory, // Use default category
        }),
      })
      const hashtagsData = await hashtagsResponse.json()

      if (hashtagsData.error) {
        throw new Error(`Hashtags API error: ${hashtagsData.error}`)
      }

      if (!hashtagsData || !hashtagsData.hashtags || !Array.isArray(hashtagsData.hashtags)) {
        throw new Error("Invalid hashtags response: Expected array of hashtags")
      }

      setGeneratedContent({
        titles: titlesData.titles,
        selectedTitle: titlesData.titles[0],
        body: bodyData.body,
        cta: ctaData.cta,
        hashtags: hashtagsData.hashtags,
        customHashtags: [],
      })

      setCurrentStep(3) // Skip to step 3 (hashtags) instead of step 4
    } catch (error) {
      console.error("Error generating content:", error)
      if (error instanceof Error) {
        console.log("[v0] Using fallback content due to error:", error.message)
      } else {
        console.log("[v0] Using fallback content due to an unknown error.")
      }

      setGeneratedContent({
        titles: [
          `5 Game-Changing ${selectedTopic} Trends You Can't Ignore`,
          `Why ${selectedTopic} is Reshaping the Future of Work`,
          `The Ultimate Guide to ${selectedTopic} Success`,
        ],
        selectedTitle: `5 Game-Changing ${selectedTopic} Trends You Can't Ignore`,
        body: `Here's what I've learned about ${selectedTopic} after years in the industry...\n\n🔥 Key insights that changed my perspective\n💡 Practical tips you can implement today\n🚀 Future trends to watch\n\nWhat's your experience with ${selectedTopic}?`,
        cta: "What's your take on this? Share your thoughts below! 👇",
        hashtags: ["#" + selectedTopic.replace(/\s+/g, ""), "#LinkedIn", "#CareerGrowth", "#Innovation"],
        customHashtags: [],
      })
      setCurrentStep(3)
    } finally {
      setIsGenerating(false)
    }
  }

  const addCustomHashtag = () => {
    if (newHashtag.trim() && !getAllHashtags().includes(formatHashtag(newHashtag))) {
      setGeneratedContent((prev) => ({
        ...prev,
        customHashtags: [...prev.customHashtags, formatHashtag(newHashtag)],
      }))
      setNewHashtag("")
    }
  }

  const removeHashtag = (hashtag: string, isCustom: boolean) => {
    if (isCustom) {
      setGeneratedContent((prev) => ({
        ...prev,
        customHashtags: prev.customHashtags.filter((h) => h !== hashtag),
      }))
    } else {
      setGeneratedContent((prev) => ({
        ...prev,
        hashtags: prev.hashtags.filter((h) => h !== hashtag),
      }))
    }
  }

  const formatHashtag = (hashtag: string) => {
    const cleaned = hashtag.trim().replace(/\s+/g, "")
    return cleaned.startsWith("#") ? cleaned : `#${cleaned}`
  }

  const getAllHashtags = () => {
    return [...generatedContent.hashtags, ...generatedContent.customHashtags]
  }

  const regenerateHashtags = async () => {
    setIsRegeneratingHashtags(true)
    try {
      const hashtagsResponse = await fetch("/api/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory,
        }),
      })
      const hashtagsData = await hashtagsResponse.json()

      setGeneratedContent((prev) => ({
        ...prev,
        hashtags: hashtagsData.hashtags,
      }))
    } catch (error) {
      console.error("Error regenerating hashtags:", error)
    } finally {
      setIsRegeneratingHashtags(false)
    }
  }

  const formatFinalPost = () => {
    const allHashtags = getAllHashtags()
    return `${generatedContent.selectedTitle}\n\n${generatedContent.body}\n\n${generatedContent.cta}\n\n${allHashtags.join(" ")}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatFinalPost())
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const selectTitle = (title: string) => {
    setGeneratedContent((prev) => ({ ...prev, selectedTitle: title }))
  }

  const finalizePost = () => {
    setCurrentStep(5)
  }

  const generateThumbnail = (templateId: string) => {
    setSelectedThumbnailTemplate(templateId)
    setGeneratedContent((prev) => ({
      ...prev,
      thumbnailStyle: templateId,
    }))
  }

  const ThumbnailPreview = ({ template, title }: { template: any; title: string }) => {
    const getBackgroundStyle = () => {
      switch (template.id) {
        case "gradient-modern":
          return "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
        case "minimal-dark":
          return "bg-gray-900 text-white"
        case "bright-accent":
          return "bg-white text-gray-900 border-l-8 border-blue-500"
        case "tech-grid":
          return "bg-slate-800 text-white relative overflow-hidden"
        default:
          return "bg-gray-100 text-gray-900"
      }
    }

    return (
      <div className={`w-full h-48 rounded-lg p-6 flex items-center justify-center relative ${getBackgroundStyle()}`}>
        {template.id === "tech-grid" && (
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
        <div className="text-center z-10">
          <h3 className="text-lg font-bold mb-2 line-clamp-3">{title || "Your Post Title"}</h3>
          <div className="text-sm opacity-80">{selectedTopic}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LinkedIn Post Generator</h1>
          <p className="text-lg text-gray-600">Create engaging LinkedIn posts with AI-powered content generation</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    currentStep >= step.id ? "bg-blue-600 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Select Tech News Topic
              </CardTitle>
              <CardDescription>Choose from the latest tech news articles or provide your own URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Or, enter a custom URL</h3>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="https://example.com/article"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1"
                    disabled={isLoadingCustomUrl}
                  />
                  <Button
                    onClick={fetchCustomUrlContent}
                    disabled={!customUrl.trim() || isLoadingCustomUrl}
                    className="flex items-center gap-2"
                  >
                    {isLoadingCustomUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch"
                    )}
                  </Button>
                </div>

                {isLoadingCustomUrl && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-blue-700">Fetching content...</span>
                  </div>
                )}

                {customUrlError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{customUrlError}</p>
                  </div>
                )}

                {customUrlContent && (
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 text-left justify-start bg-white hover:bg-blue-50 border-2 hover:border-blue-300 transition-all"
                    onClick={() => handleTopicSelect(customUrlContent.title, true)}
                  >
                    <div className="w-full space-y-2">
                      <h4 className="font-bold text-gray-900 text-balance leading-tight">{customUrlContent.title}</h4>
                      <p className="text-sm text-gray-600 text-pretty line-clamp-3">{customUrlContent.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Source: </span>
                        {customUrlContent.url}
                      </div>
                    </div>
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={fetchTechNews}
                  disabled={isLoadingArticles}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingArticles ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {isLoadingArticles && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Fetching latest topics...</span>
                </div>
              )}

              {articlesError && (
                <div className="text-center py-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-medium">Error fetching data</p>
                    <p className="text-red-500 text-sm mt-1">Please try refreshing or check your connection</p>
                  </div>
                </div>
              )}

              {!isLoadingArticles && filteredArticles.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      Top Story
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-6 text-left justify-start bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 transition-all"
                      onClick={() => handleTopicSelect(filteredArticles[0].title)}
                    >
                      <div className="w-full space-y-3">
                        <h4 className="text-xl font-bold text-gray-900 text-balance leading-tight">
                          {filteredArticles[0].title}
                        </h4>
                        <p className="text-base text-gray-700 text-pretty line-clamp-3">
                          {filteredArticles[0].description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="font-medium">{filteredArticles[0].source.name}</span>
                          <span>{new Date(filteredArticles[0].publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Button>
                  </div>

                  {filteredArticles.length > 1 && (
                    <>
                      <div className="border-t border-gray-200 my-6"></div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">More Articles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredArticles.slice(1).map((article, index) => (
                          <Button
                            key={index + 1}
                            variant="outline"
                            className="h-auto p-4 text-left justify-start bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
                            onClick={() => handleTopicSelect(article.title)}
                          >
                            <div className="w-full space-y-2">
                              <h3 className="font-bold text-gray-900 text-balance leading-tight">{article.title}</h3>
                              <p className="text-sm text-gray-600 text-pretty line-clamp-2">{article.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{article.source.name}</span>
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {!isLoadingArticles && filteredArticles.length === 0 && !articlesError && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No articles found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Content
              </CardTitle>
              <CardDescription>
                Topic: <Badge variant="secondary">{selectedTopic}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isGenerating && generatedContent.titles.length === 0 && (
                <Button onClick={generateContent} className="w-full" size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              )}

              {isGenerating && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Generating amazing content...</span>
                </div>
              )}

              {generatedContent.titles.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Choose a title:</h3>
                    <div className="space-y-2">
                      {generatedContent.titles.map((title, index) => (
                        <Button
                          key={index}
                          variant={generatedContent.selectedTitle === title ? "default" : "outline"}
                          className="w-full text-left justify-start h-auto p-4"
                          onClick={() => selectTitle(title)}
                        >
                          {title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Post Category:</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Change the category to regenerate the body and CTA with a different style:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {POST_CATEGORIES.map((category) => (
                        <Button
                          key={category.name}
                          variant={selectedCategory === category.name ? "default" : "outline"}
                          className="h-auto p-3 text-left justify-start"
                          onClick={() => regenerateContent(category.name)}
                          disabled={isRegeneratingContent}
                        >
                          <div className="w-full space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className="font-medium text-sm">{category.name}</span>
                            </div>
                            <Badge
                              variant={
                                category.engagement === "Very High"
                                  ? "default"
                                  : category.engagement === "High"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {category.engagement} Engagement
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                    {isRegeneratingContent && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Regenerating content...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Generated Body:</h3>
                    <Textarea
                      value={generatedContent.body}
                      onChange={(e) => setGeneratedContent((prev) => ({ ...prev, body: e.target.value }))}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Call to Action:</h3>
                    <Textarea
                      value={generatedContent.cta}
                      onChange={(e) => setGeneratedContent((prev) => ({ ...prev, cta: e.target.value }))}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Continue to Hashtags
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Manage Hashtags
              </CardTitle>
              <CardDescription>Customize your hashtags to maximize reach and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">AI Generated Hashtags:</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateHashtags}
                    disabled={isRegeneratingHashtags}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRegeneratingHashtags ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((hashtag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
                    >
                      <span className="text-blue-700 text-sm font-medium">{hashtag}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-blue-100"
                        onClick={() => removeHashtag(hashtag, false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Add Custom Hashtags:</h3>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter hashtag (e.g., TechTrends)"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomHashtag()}
                    className="flex-1"
                  />
                  <Button onClick={addCustomHashtag} disabled={!newHashtag.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {generatedContent.customHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.customHashtags.map((hashtag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1"
                      >
                        <span className="text-green-700 text-sm font-medium">{hashtag}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-green-100"
                          onClick={() => removeHashtag(hashtag, true)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Total Hashtags:</span>
                  <Badge variant={getAllHashtags().length <= 10 ? "default" : "destructive"}>
                    {getAllHashtags().length}/10
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  LinkedIn recommends using 3-5 hashtags for optimal reach. You can use up to 10 hashtags maximum.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Post Preview:</h3>
                <div className="bg-white border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                  <h4 className="font-bold text-lg">{generatedContent.selectedTitle}</h4>
                  <div className="whitespace-pre-wrap text-gray-700 text-sm">{generatedContent.body}</div>
                  <div className="text-blue-600 font-medium text-sm">{generatedContent.cta}</div>
                  <div className="flex flex-wrap gap-1">
                    {getAllHashtags().map((hashtag, index) => (
                      <span key={index} className="text-blue-600 text-sm">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setCurrentStep(4)} className="flex-1">
                  Continue to Thumbnail
                </Button>
                <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2 bg-transparent">
                  <Copy className="w-4 h-4" />
                  Copy Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Generate Thumbnail
              </CardTitle>
              <CardDescription>Choose a thumbnail style for your LinkedIn post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Choose Thumbnail Style:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {THUMBNAIL_TEMPLATES.map((template) => (
                    <div key={template.id} className="space-y-3">
                      <Button
                        variant={selectedThumbnailTemplate === template.id ? "default" : "outline"}
                        className="w-full h-auto p-0 overflow-hidden"
                        onClick={() => generateThumbnail(template.id)}
                      >
                        <ThumbnailPreview template={template} title={generatedContent.selectedTitle} />
                      </Button>
                      <div className="text-center">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedThumbnailTemplate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Selected Thumbnail Preview:</h3>
                  <div className="max-w-md mx-auto">
                    <ThumbnailPreview
                      template={THUMBNAIL_TEMPLATES.find((t) => t.id === selectedThumbnailTemplate)!}
                      title={generatedContent.selectedTitle}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={finalizePost} className="flex-1" disabled={!selectedThumbnailTemplate}>
                  Finalize Post
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back to Hashtags
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Your LinkedIn Post is Ready!
              </CardTitle>
              <CardDescription>
                Complete post generated with AI-powered content and professional thumbnail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-bold text-balance">{generatedContent.selectedTitle}</h2>
                    <div className="whitespace-pre-wrap text-gray-700 text-pretty">{generatedContent.body}</div>
                    <div className="text-blue-600 font-medium">{generatedContent.cta}</div>
                    <div className="flex flex-wrap gap-2">
                      {getAllHashtags().map((hashtag, index) => (
                        <span key={index} className="text-blue-600 text-sm">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Post Insights</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Character Count:</span>
                        <div className="text-blue-600">{formatFinalPost().length} characters</div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Hashtags:</span>
                        <div className="text-blue-600">{getAllHashtags().length} tags</div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Category:</span>
                        <div className="text-blue-600">{selectedCategory}</div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Topic:</span>
                        <div className="text-blue-600">{selectedTopic}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedThumbnailTemplate && (
                    <div>
                      <h3 className="font-semibold mb-3">Generated Thumbnail</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ThumbnailPreview
                          template={THUMBNAIL_TEMPLATES.find((t) => t.id === selectedThumbnailTemplate)!}
                          title={generatedContent.selectedTitle}
                        />
                        <div className="mt-3 text-center">
                          <Badge variant="secondary">
                            {THUMBNAIL_TEMPLATES.find((t) => t.id === selectedThumbnailTemplate)?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Generation Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">Topic selected: {selectedTopic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">Category: {selectedCategory}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">{generatedContent.titles.length} titles generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">AI-powered content created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">Hashtags optimized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">Professional thumbnail designed</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">LinkedIn Best Practices</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Post during business hours for maximum engagement</li>
                      <li>• Respond to comments within the first hour</li>
                      <li>• Use native video when possible for higher reach</li>
                      <li>• Tag relevant people to increase visibility</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Complete Post
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(4)} className="bg-transparent">
                  Edit Thumbnail
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="bg-transparent">
                  Edit Hashtags
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="bg-transparent">
                  Create New Post
                </Button>
              </div>

              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Your LinkedIn post is ready to publish!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
