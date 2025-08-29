import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: z.object({
        cta: z.string().describe("A compelling call-to-action for LinkedIn engagement"),
      }),
      prompt: `Generate a compelling call-to-action (CTA) for a LinkedIn post about "${topic}" in the "${category}" category.

      Guidelines:
      - Encourage engagement (comments, shares, connections)
      - Keep it under 50 words
      - Use emojis appropriately
      - Make it conversational and inviting
      - Ask for specific actions or opinions
      - Match the professional LinkedIn tone
      
      Topic: ${topic}
      Category: ${category}`,
    })

    return NextResponse.json({ cta: object.cta })
  } catch (error) {
    console.error("Error generating CTA:", error)
    return NextResponse.json({ error: "Failed to generate CTA" }, { status: 500 })
  }
}
