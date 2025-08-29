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
}

Do not include any extra text or markdown formatting like \`\`\`json.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Remove markdown code fences if present
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "")

    // Find the JSON object boundaries
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}") + 1
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd)
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    if (!parsedResponse.hashtags || !Array.isArray(parsedResponse.hashtags)) {
      throw new Error("Invalid response format from AI")
    }

    // Add # symbol to each hashtag
    const formattedHashtags = parsedResponse.hashtags.map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))

    return NextResponse.json({ hashtags: formattedHashtags })
  } catch (error) {
    console.error("Error generating hashtags:", error)
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 })
  }
}
