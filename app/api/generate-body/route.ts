import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, title } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Act as a data expert creating the body of a professional LinkedIn post.
                   The topic is "${topic}".
                   The title of the post is "${title}".

                   constraints:
                  - Consist of 3-5 unique, valuable insights or actionable tips.
                  - Keep each sentence to a maximum of 10 words.
                  - create bullet point or listicles

                   Take inspirations from one of these frameworks
                    Frameworks:
                    The Problem/Agitate/Solve (PAS) Framework:
                    Template:
                    [Start with a common, relatable problem in data, making it specific to your audience's challenges].
                    [Agitate the problem: Explain why it's bad, the costs, side effects, and symptoms, making the pain more vivid and immediate. Use "which means you..." to highlight the negative outcomes].
                    [Present your solution: Introduce your expertise, method, or service as the answer to the agitated problem, offering a clear path to resolution and a positive outcome].
                    Goal: To directly address a pain point, intensify it, and then present your solution as the escape from that pain.

                    The Before/After/Bridge (BAB) Framework:
                    Template:
                    [Describe the painful "Before" (but don't write "before" itself) state: Detail a common, frustrating situation or problem that your data professional audience currently experiences].
                    [Paint a vivid "After" (but don't write "after" itself) picture: Illustrate the ideal, desirable future state where their problems are solved, and their goals are achieved. Use emotional language to show them how life will be better].
                    [Introduce the "Bridge" (but don't write "bridge" itself)): Explain how your specific solution (e.g., your methodology, product, or service) is the bridge that takes them from the "Before" to the "After" state].

                    Goal: To guide the audience from an undesirable current state to an ideal future state, positioning your offer as the crucial link for that transformation.

                    The Storytelling Framework:
                    Template:
                    [Begin with a personal achievement, transformation, or a surprising revelation related to a data challenge or project].
                    [Briefly describe the specific struggle, problem, or obstacle encountered during that journey, making it relatable to common data professional challenges].
                    [Share actionable advice, key insights, or the "aha!" moment that came from overcoming the struggle. Make sure it's tangible and can be applied by the audience].
                    [Conclude with the positive outcome, broader impact, or the moral of the story, reinforcing how this lesson can benefit the reader in their data career].
                    Goal: To build a connection and share valuable, relatable lessons through personal experience.                                                                      
                    
                    Return the response as a valid JSON object with this exact format:
                   {
                      "body": "Your body content here..."
                   }

                   Do not include any extra text or markdown formatting outside of the JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

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
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(text)

    if (!parsedResponse.body) {
      throw new Error("Invalid response format from AI")
    }
    
    // Explicitly remove all asterisks from the final body text
    const cleanedBody = parsedResponse.body.replace(/\*/g, '')

    return NextResponse.json({ body: cleanedBody })
  } catch (error) {
    console.error("Error generating body text:", error)
    return NextResponse.json({ error: "Failed to generate body text." }, { status: 500 })
  }
}
