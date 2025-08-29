import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category, title } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate compelling body content for a LinkedIn post with the title "${title}" about "${topic}" in the "${category}" category.

Guidelines:
- Write 2-4 paragraphs of engaging content
- Include relevant insights, tips, or experiences
- Use a professional but conversational tone
- Include emojis sparingly for visual appeal
- Make it valuable and shareable
- Keep it under 1300 characters (LinkedIn limit)

Title: ${title}
Topic: ${topic}
Category: ${category}

Return the response as a valid JSON object with this exact format:
{
  "body": "Your body content here..."
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

    if (!parsedResponse.body) {
      throw new Error("Invalid response format from AI")
    }

    return NextResponse.json({ body: parsedResponse.body })
  } catch (error) {
    console.error("Error generating body text:", error)
    return NextResponse.json({ error: "Failed to generate body text." }, { status: 500 })
  }
}
