import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

function getBodyInstructions(category: string): string {
  switch (category) {
    case "One-Slide Wisdom":
      return `Generate a highly skimmable listicle with 3-4 bullet points that:
              - Delivers one main idea with actionable insights
              - Uses the formula: [Insight/Action]: It [feature/action] so you can [benefit], which means [meaning/impact]
              - Keeps each sentence to maximum 10 words
              - Uses line breaks between bullet points for mobile readability
              - Focuses on practical wisdom that can be applied immediately`

    case "Code Snippet of the Week":
      return `Generate technical content that:
              - Provides a clear introduction to the code concept
              - Explains the technical implementation in simple terms
              - Highlights key benefits and use cases
              - Includes practical applications or scenarios
              - Uses developer-friendly language while remaining accessible
              - Focuses on why this code snippet is valuable to learn`

    case "A week in data":
      return `Generate a curated, scannable list that:
              - Presents 3-5 key data points or insights
              - Uses clear, digestible formatting with bullet points
              - Includes specific numbers, percentages, or metrics when relevant
              - Provides context for why each data point matters
              - Maintains a news-like, informative tone
              - Focuses on trends and patterns in the data`

    case "One-Minute Metric":
      return `Generate content focused on a single powerful metric that:
              - Highlights one key performance indicator or statistic
              - Explains the significance and impact of this metric
              - Provides context for why this number matters
              - Includes actionable insights based on the metric
              - Uses clear, compelling language to emphasize importance
              - Connects the metric to broader business or industry implications`

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const categoryInstructions = getBodyInstructions(category)

    const prompt = `Act as a data expert creating the body of a LinkedIn post.
                   The category is "${category}", and the topic is "${topic}".
                   
                   ${categoryInstructions}
                   
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
