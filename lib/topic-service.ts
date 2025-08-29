export interface Topic {
  name: string
  popularity: number
  category: string
  trending: boolean
  keywords: string[]
  relatedTopics: string[]
}

export interface Category {
  name: string
  description: string
  engagement: "Low" | "Medium" | "High" | "Very High"
  icon: string
  examples: string[]
  bestTimeToPost: string[]
}

export class TopicService {
  private static instance: TopicService
  private topics: Topic[] = []
  private categories: Category[] = []

  static getInstance(): TopicService {
    if (!TopicService.instance) {
      TopicService.instance = new TopicService()
    }
    return TopicService.instance
  }

  async getTrendingTopics(): Promise<Topic[]> {
    // In a real implementation, this would fetch from an API
    // that analyzes current LinkedIn trends, Google Trends, etc.
    return this.topics.filter((topic) => topic.trending).sort((a, b) => b.popularity - a.popularity)
  }

  async searchTopics(query: string, category?: string): Promise<Topic[]> {
    return this.topics.filter((topic) => {
      const matchesQuery =
        topic.name.toLowerCase().includes(query.toLowerCase()) ||
        topic.keywords.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase()))
      const matchesCategory = !category || topic.category.toLowerCase() === category.toLowerCase()
      return matchesQuery && matchesCategory
    })
  }

  async getRelatedTopics(topicName: string): Promise<Topic[]> {
    const topic = this.topics.find((t) => t.name === topicName)
    if (!topic) return []

    return this.topics.filter((t) => topic.relatedTopics.includes(t.name) || t.category === topic.category).slice(0, 5)
  }

  async getCategoryInsights(categoryName: string): Promise<{
    bestTimeToPost: string[]
    averageEngagement: number
    recommendedHashtags: string[]
  }> {
    // Mock implementation - in real app, this would analyze historical data
    return {
      bestTimeToPost: ["9:00 AM", "1:00 PM", "5:00 PM"],
      averageEngagement: 85,
      recommendedHashtags: [`#${categoryName}`, "#LinkedIn", "#Professional"],
    }
  }
}
