import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate 5-10 relevant hashtags for a LinkedIn post about "${topic}" in the "${category}" category.

Guidelines:
- Include a mix of popular and niche hashtags
- Make them relevant to the topic and category
- Include general LinkedIn hashtags like #LinkedIn, #Professional
- Don't include the # symbol in the response
- Focus on hashtags that will increase visibility
- Include industry-specific tags when relevant

Topic: ${topic}
Category: ${category}

Return the response as a JSON object with this exact format:
{
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    // Add # symbol to each hashtag
    const formattedHashtags = parsedResponse.hashtags.map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))

    return NextResponse.json({ hashtags: formattedHashtags })
  } catch (error) {
    console.error("Error generating hashtags:", error)
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 })
  }
}
