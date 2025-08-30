import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { ctaPrompt } = await request.json()

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Act as a data expert writing a call-to-action (CTA) for a LinkedIn "one-slide wisdom" post. 
                    Your task is to generate a short, engaging CTA that:
                    Is 1-2 lines long.
                    Encourages conversation and community, not promotion.
                    Includes an open-ended question (e.g., "What's your biggest takeaway?").
                    Suggests a non-sales-related next step (e.g., "follow for more," "tag a colleague").
                    Ends on a positive, inclusive note to build rapport.
                    Can optionally include a "stealth close" that subtly points to a free resource.
                    Do not include any other text besides the CTA itself.

                      Return the response as a valid JSON object with this exact format:
                   {
                      "cta": "Your cta content here..."
                    }
                    
                    Do not include any extra text or markdown formatting like \`\`\`json.`

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
    })

    let text = result.text

    console.log("[v0] Raw AI response:", text)

    // Clean the string by removing Markdown code fences
    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim()

    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}") + 1
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd)
    }

    console.log("[v0] Cleaned JSON text:", text)

    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    return NextResponse.json({ cta: parsedResponse.cta })
  } catch (error) {
    console.error("Error generating CTA:", error)
    return NextResponse.json({ error: "Failed to generate CTA." }, { status: 500 })
  }
}
