"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, TrendingUp, Hash, ImageIcon, Search, Star, Plus, X, RefreshCw, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const TRENDING_TOPICS = [
  { name: "AI & Machine Learning", popularity: 95, category: "Technology", trending: true },
  { name: "Remote Work", popularity: 88, category: "Workplace", trending: true },
  { name: "Startup Growth", popularity: 82, category: "Business", trending: false },
  { name: "Digital Marketing", popularity: 90, category: "Marketing", trending: true },
  { name: "Leadership", popularity: 85, category: "Professional", trending: false },
  { name: "Tech Innovation", popularity: 92, category: "Technology", trending: true },
  { name: "Career Development", popularity: 87, category: "Professional", trending: false },
  { name: "Productivity", popularity: 80, category: "Lifestyle", trending: false },
  { name: "Industry Insights", popularity: 75, category: "Business", trending: false },
  { name: "Personal Branding", popularity: 83, category: "Marketing", trending: false },
  { name: "Cybersecurity", popularity: 89, category: "Technology", trending: true },
  { name: "Sustainability", popularity: 78, category: "Environment", trending: false },
  { name: "Data Analytics", popularity: 86, category: "Technology", trending: false },
  { name: "Mental Health", popularity: 84, category: "Wellness", trending: false },
  { name: "Blockchain", popularity: 77, category: "Technology", trending: false },
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

export default function LinkedInPostGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [topicSearch, setTopicSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showTrendingOnly, setShowTrendingOnly] = useState(false)
  const [newHashtag, setNewHashtag] = useState("")
  const [isRegeneratingHashtags, setIsRegeneratingHashtags] = useState(false)
  const [selectedThumbnailTemplate, setSelectedThumbnailTemplate] = useState("")
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    titles: [],
    selectedTitle: "",
    body: "",
    cta: "",
    hashtags: [],
    customHashtags: [],
  })

  const filteredTopics = TRENDING_TOPICS.filter((topic) => {
    const matchesSearch = topic.name.toLowerCase().includes(topicSearch.toLowerCase())
    const matchesCategory = categoryFilter === "all" || topic.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesTrending = !showTrendingOnly || topic.trending
    return matchesSearch && matchesCategory && matchesTrending
  }).sort((a, b) => b.popularity - a.popularity)

  const steps = [
    { id: 1, name: "Select Topic", icon: TrendingUp },
    { id: 2, name: "Choose Category", icon: ImageIcon },
    { id: 3, name: "Generate Content", icon: Sparkles },
    { id: 4, name: "Manage Hashtags", icon: Hash },
    { id: 5, name: "Generate Thumbnail", icon: ImageIcon },
    { id: 6, name: "Final Post", icon: ImageIcon },
  ]

  const handleTopicSelect = (topicName: string) => {
    setSelectedTopic(topicName)
    setCurrentStep(2)
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setCurrentStep(3)
  }

  const generateContent = async () => {
    setIsGenerating(true)
    try {
      // Generate titles
      const titlesResponse = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory,
        }),
      })
      const titlesData = await titlesResponse.json()

      if (!titlesData || !titlesData.titles || !Array.isArray(titlesData.titles) || titlesData.titles.length === 0) {
        throw new Error("Invalid titles response")
      }

      // Generate body content
      const bodyResponse = await fetch("/api/generate-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory,
          title: titlesData.titles[0], // Now safe to access
        }),
      })
      const bodyData = await bodyResponse.json()

      if (!bodyData || !bodyData.body) {
        throw new Error("Invalid body response")
      }

      // Generate CTA
      const ctaResponse = await fetch("/api/generate-cta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory,
        }),
      })
      const ctaData = await ctaResponse.json()

      if (!ctaData || !ctaData.cta) {
        throw new Error("Invalid CTA response")
      }

      // Generate hashtags
      const hashtagsResponse = await fetch("/api/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category: selectedCategory,
        }),
      })
      const hashtagsData = await hashtagsResponse.json()

      if (!hashtagsData || !hashtagsData.hashtags || !Array.isArray(hashtagsData.hashtags)) {
        throw new Error("Invalid hashtags response")
      }

      setGeneratedContent({
        titles: titlesData.titles,
        selectedTitle: titlesData.titles[0],
        body: bodyData.body,
        cta: ctaData.cta,
        hashtags: hashtagsData.hashtags,
        customHashtags: [],
      })

      setCurrentStep(4)
    } catch (error) {
      console.error("Error generating content:", error)
      // Fallback to mock data if API fails
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
      setCurrentStep(4)
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
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const selectTitle = (title: string) => {
    setGeneratedContent((prev) => ({ ...prev, selectedTitle: title }))
  }

  const finalizePost = () => {
    setCurrentStep(6)
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
                Select Trending Topic
              </CardTitle>
              <CardDescription>Choose a trending topic for your LinkedIn post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="professional">Professional</option>
                  <option value="workplace">Workplace</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="environment">Environment</option>
                  <option value="wellness">Wellness</option>
                </select>
                <Button
                  variant={showTrendingOnly ? "default" : "outline"}
                  onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending Only
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((topic) => (
                  <Button
                    key={topic.name}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
                    onClick={() => handleTopicSelect(topic.name)}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{topic.name}</span>
                        {topic.trending && (
                          <Badge variant="destructive" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{topic.category}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{topic.popularity}%</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No topics found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Choose Post Category
              </CardTitle>
              <CardDescription>
                Selected topic: <Badge variant="secondary">{selectedTopic}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POST_CATEGORIES.map((category) => (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="h-auto p-6 text-left justify-start bg-white hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
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
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Examples: </span>
                        {category.examples.join(", ")}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Content
              </CardTitle>
              <CardDescription>
                Topic: <Badge variant="secondary">{selectedTopic}</Badge>
                Category: <Badge variant="secondary">{selectedCategory}</Badge>
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

                  <Button onClick={() => setCurrentStep(4)} className="w-full">
                    Continue to Hashtags
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
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
                <Button onClick={() => setCurrentStep(5)} className="flex-1">
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

        {currentStep === 5 && (
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
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back to Hashtags
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 6 && (
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
                {/* Post Content */}
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

                  {/* Post Analytics */}
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

                {/* Thumbnail Preview */}
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

                  {/* Generation Summary */}
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

                  {/* Best Practices Tips */}
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Complete Post
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(5)} className="bg-transparent">
                  Edit Thumbnail
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(4)} className="bg-transparent">
                  Edit Hashtags
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="bg-transparent">
                  Create New Post
                </Button>
              </div>

              {/* Success Message */}
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
