import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate exactly 3 compelling LinkedIn post titles for the topic "${topic}" in the "${category}" category. 

Guidelines:
- Make them attention-grabbing and professional
- Include numbers or specific benefits when possible
- Keep them under 100 characters
- Make them suitable for LinkedIn's professional audience
- Vary the style (question, list, statement)

Topic: ${topic}
Category: ${category}

Return the response as a JSON object with this exact format:
{
  "titles": ["title1", "title2", "title3"]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    return NextResponse.json({ titles: parsedResponse.titles })
  } catch (error) {
    console.error("Error generating titles:", error)
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 })
  }
}
