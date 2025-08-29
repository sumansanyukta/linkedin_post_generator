import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        titles: z.array(z.string()).length(3).describe("Three engaging LinkedIn post titles"),
      }),
      prompt: `Generate 3 compelling LinkedIn post titles for the topic "${topic}" in the "${category}" category. 
      
      Guidelines:
      - Make them attention-grabbing and professional
      - Include numbers or specific benefits when possible
      - Keep them under 100 characters
      - Make them suitable for LinkedIn's professional audience
      - Vary the style (question, list, statement)
      
      Topic: ${topic}
      Category: ${category}`,
    })

    return NextResponse.json({ titles: object.titles })
  } catch (error) {
    console.error("Error generating titles:", error)
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 })
  }
}
