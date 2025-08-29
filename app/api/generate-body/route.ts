import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category, title } = await request.json()

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `Write an engaging LinkedIn post body for the title "${title}" about "${topic}" in the "${category}" category.

      Guidelines:
      - Write in first person, professional but conversational tone
      - Include 3-5 key points with emojis as bullet points
      - Keep it between 150-300 words
      - Add a question at the end to encourage engagement
      - Use line breaks for readability
      - Make it valuable and actionable for LinkedIn audience
      - Include personal insights or experiences when appropriate
      
      Title: ${title}
      Topic: ${topic}
      Category: ${category}`,
    })

    return NextResponse.json({ body: text })
  } catch (error) {
    console.error("Error generating body:", error)
    return NextResponse.json({ error: "Failed to generate body" }, { status: 500 })
  }
}
