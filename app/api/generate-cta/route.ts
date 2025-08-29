import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate a compelling call-to-action (CTA) for a LinkedIn post about "${topic}" in the "${category}" category.

Guidelines:
- Encourage engagement (comments, shares, connections)
- Keep it under 50 words
- Use emojis appropriately
- Make it conversational and inviting
- Ask for specific actions or opinions
- Match the professional LinkedIn tone

Topic: ${topic}
Category: ${category}

Return the response as a JSON object with this exact format:
{
  "cta": "your call-to-action text here"
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    return NextResponse.json({ cta: parsedResponse.cta })
  } catch (error) {
    console.error("Error generating CTA:", error)
    return NextResponse.json({ error: "Failed to generate CTA" }, { status: 500 })
  }
}
