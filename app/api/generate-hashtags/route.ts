import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

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

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
    })

    let text = result.text

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
