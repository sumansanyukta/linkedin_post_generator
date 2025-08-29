import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category, title } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Write an engaging LinkedIn post body for the title "${title}" about "${topic}" in the "${category}" category.

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
Category: ${category}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ body: text })
  } catch (error) {
    console.error("Error generating body:", error)
    return NextResponse.json({ error: "Failed to generate body" }, { status: 500 })
  }
}
