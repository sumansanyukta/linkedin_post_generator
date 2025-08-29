import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate 3-5 compelling titles for a LinkedIn post about "${topic}" in the "${category}" category.

Guidelines:
- Make them attention-grabbing and professional
- Keep them under 100 characters each
- Include numbers or power words when appropriate
- Make them relevant to the topic and category
- Focus on titles that will encourage clicks and engagement

Topic: ${topic}
Category: ${category}

Return the response as a valid JSON object with this exact format:
{
  "titles": ["Title 1", "Title 2", "Title 3"]
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

    if (!parsedResponse.titles || !Array.isArray(parsedResponse.titles)) {
      throw new Error("Invalid response format from AI")
    }

    return NextResponse.json({ titles: parsedResponse.titles })
  } catch (error) {
    console.error("Error generating titles:", error)
    return NextResponse.json({ error: "Failed to generate titles." }, { status: 500 })
  }
}
