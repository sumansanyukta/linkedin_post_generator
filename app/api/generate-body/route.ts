import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

function getBodyInstructions(category: string, topic: string): string {
  switch (category) {
    case "One-Slide Wisdom":
      return `Act as a data expert creating the body of a LinkedIn for 
              select_category ${category} which is “One-Slide Wisdom”, 
              Your task is to generate a highly skimmable listicle with 3-5
              bullet points. The listicle must:

              - Deliver one main idea related to the topic.
              - Consist of 3-5 unique, valuable insights or actionable tips.
              - Keep each sentence to a maximum of 10 words.
              - Use line breaks between each bullet point to enhance readability on mobile devices.
              - For each point, follow this formula: 
              [Insight/Action]: It [feature/action] so you can [benefit], which means [meaning/impact for the reader].
              - Use simple, professional language that avoids unnecessary jargon.
              Return the response as a valid JSON object with this exact format:
              {
                "body": body text here
              }

              Do not include any extra text or markdown formatting like \`\`\`json.`

    case "Code Snippet of the Week":
      return `Act as a data expert creating the body of a LinkedIn for 
              select_category ${category} which is “Code Snippet of the week”, 
              Your task is to generate a highly skimmable listicle with 3-5
              bullet points. The listicle must:

              - Deliver one main idea related to the topic.
              - Consist of 3-5 unique, valuable insights or actionable tips.
              - Keep each sentence to a maximum of 10 words.
              - Use line breaks between each bullet point to enhance readability on mobile devices.
              - and a placeholder for code snippet
              Return the response as a valid JSON object with this exact format:
              {
                "body": body text here
              }

              Do not include any extra text or markdown formatting like \`\`\`json.`

    case "A week in data":
      return `Act as a data expert creating the body of a LinkedIn for 
              select_category ${category} which is “A week in data”, 
              Your task is to generate a highly skimmable listicle with 3-5
              bullet points. The listicle must:

              - Deliver one main idea related to the topic.
              - Consist of 3 curated link and each one described on valuable insights or actionable tips.
              - Keep each sentence to a maximum of 10 words.
              - Use line breaks between each bullet point to enhance readability on mobile devices.
              - Use simple, professional language that avoids unnecessary jargon.
              Return the response as a valid JSON object with this exact format:
                  {
                    "body": body text here
                  }

                  Do not include any extra text or markdown formatting like \`\`\`json.`

    case "One-Minute Metric":
      return `Act as a data expert creating the body of a LinkedIn post.
              The category is "${category}", and the topic is "${topic}".
              
              Your task is to generate a highly skimmable listicle with 3-5
              bullet points. The listicle must:
              - Deliver one main idea related to the topic.
              - Keep each sentence to a maximum of 10 words.
              - Use line breaks between each bullet point to enhance readability on mobile devices.
              - Use simple, professional language that avoids unnecessary jargon.
              Return the response as a valid JSON object with this exact format:
                  {
                    "body": "Your body content here..."
                  }

                  Do not include any extra text or markdown formatting like \`\`\`json.`

    default:
      return `Generate professional LinkedIn post content that:
              - Delivers valuable insights related to the topic
              - Uses clear, engaging language
              - Provides actionable takeaways for the reader
              - Maintains a professional yet approachable tone
              - Focuses on practical value and real-world applications`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic, category, title } = await request.json()

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

    const categoryInstructions = getBodyInstructions(category, topic)

    const prompt = `Act as a data expert creating the body of a LinkedIn post.
                   The category is "${category}", and the topic is "${topic}".
                   
                   ${categoryInstructions}
                   
                   Return the response as a valid JSON object with this exact format:
                   {
                      "body": "Your body content here..."
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

    // Replace literal newlines and other control characters with proper JSON escape sequences
    text = text
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/\b/g, "\\b")
      // Fix any unescaped quotes within the JSON string values
      .replace(/"([^"]*)"(\s*:\s*)"([^"]*(?:\\.[^"]*)*)"([^"]*)"([^"]*)/g, (match, key, colon, value, after) => {
        // Only escape quotes that are not already escaped
        const escapedValue = value.replace(/(?<!\\)"/g, '\\"')
        return `"${key}"${colon}"${escapedValue}"${after}`
      })

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
