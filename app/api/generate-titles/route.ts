import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `As a data expert creating a LinkedIn 'one-slide wisdom' post in the Category: ${category} , 
    generate a concise and engaging hook for the Title: ${topic} . Make it 1-2 lines 
    (5-10 words total), designed to grab attention immediately. Include key elements like a number for precision 
    (e.g., '5 ways'), directly address the audience using 'you' to make it personal, 
    state a problem derived from the Topic: ${topic} 
    problem and agitate it (using the Problem-Agitate-Solution framework), and end with a curiosity trigger. 
    Base it on the Topic: ${topic} Ensure it's specific, simple, 
    and unique to appeal to data professionals on LinkedIn, 
    like: '[Number] [Topic] Secrets I Wish I Knew Earlier (And How They Can Transform Your Workflow).

Return the response as a valid JSON object with this exact format:
{
  "body": "Your body content here..."
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
