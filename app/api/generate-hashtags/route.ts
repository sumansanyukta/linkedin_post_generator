import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = ` Extract hasgtags from the ${topic}
              Return the response as a valid JSON object with this exact format:
                  {
                    "body": body text here
                  }

                  

Return the response as a JSON object with this exact format:
{
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}

Do not include any extra text or markdown formatting like \`\`\`json.`

    const result = await model.generateContent(prompt)
    let text = result.response.text()

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
