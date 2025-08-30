import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, title } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Act as a data expert creating the body of a LinkedIn post.
                   The topic is "${topic}".
                   
                   Generate professional LinkedIn post content that:
                   - Delivers valuable insights related to the topic
                   - Uses clear, engaging language
                   - Provides actionable takeaways for the reader
                   - Maintains a professional yet approachable tone
                   - Focuses on practical value and real-world applications
                   
                   Return the response as a valid JSON object with this exact format:
                   {
                      "body": "Your body content here..."
                   }

                   Do not include any extra text or markdown formatting like \`\`\`json.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    console.log("[v0] Raw AI response:", text)

    // Remove markdown code fences and any surrounding text
    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim()

    // Find the JSON object boundaries more robustly
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON object found in AI response")
    }

    text = text.substring(jsonStart, jsonEnd)
    console.log("[v0] Cleaned JSON text:", text)

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
