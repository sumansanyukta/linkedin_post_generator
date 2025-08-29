import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        hashtags: z.array(z.string()).min(5).max(10).describe("Relevant hashtags for LinkedIn post"),
      }),
      prompt: `Generate 5-10 relevant hashtags for a LinkedIn post about "${topic}" in the "${category}" category.

      Guidelines:
      - Include a mix of popular and niche hashtags
      - Make them relevant to the topic and category
      - Include general LinkedIn hashtags like #LinkedIn, #Professional
      - Don't include the # symbol in the response
      - Focus on hashtags that will increase visibility
      - Include industry-specific tags when relevant
      
      Topic: ${topic}
      Category: ${category}`,
    })

    // Add # symbol to each hashtag
    const formattedHashtags = object.hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))

    return NextResponse.json({ hashtags: formattedHashtags })
  } catch (error) {
    console.error("Error generating hashtags:", error)
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 })
  }
}
