import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Act as a data expert creating a LinkedIn "one-slide wisdom" post. 
    Your task is to generate 3 highly engaging hooks (titles) for the topic: ${topic}.
    Your response should be 3 impactful titles (1-2 lines each) that:
    Are tailored to the category: ${category}.
    Grab attention by using numbers (e.g., "3 secrets," "5 mistakes").
    Address the audience directly using "you."  
    Frame the topic as a problem and agitate it to create curiosity.
    Are specific, simple, and unique.
    Example format: [Number] [Topic] Secrets I Wish I Knew Earlier (They Made Me [Outcome]).
    Return the response as a valid JSON object with this exact format:
    {
      "titles": ["Title 1 here...", "Title 2 here...", "Title 3 here..."]
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

    // Find JSON object boundaries more robustly
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON object found in AI response")
    }

    text = text.substring(jsonStart, jsonEnd)
    console.log("[v0] Cleaned JSON text:", text)

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    if (!parsedResponse.titles || !Array.isArray(parsedResponse.titles) || parsedResponse.titles.length === 0) {
      throw new Error("Invalid response format from AI. 'titles' array not found or empty.")
    }

    // Return the titles array
    return NextResponse.json({ titles: parsedResponse.titles })
  } catch (error) {
    console.error("Error generating titles:", error)
    return NextResponse.json({ error: "Failed to generate titles." }, { status: 500 })
  }
}
