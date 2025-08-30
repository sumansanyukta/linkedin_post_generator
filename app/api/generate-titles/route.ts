import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Act as a data expert creating a LinkedIn post. 
    Your task is to generate 1 highly engaging hooks for the topic: ${topic}.
    Grab attention by using numbers (e.g., "3 secrets," "5 mistakes"), only use it when it is appropriate to use.
    Address the audience directly using "you."  
    Constraint: keep the total number of characters under 60.
    
    Frame the topic as a problem and agitate it to create curiosity.
    Are specific, simple, and unique.
    Rephrase the ${topic}, but not reuse the topic, and the title should be relevant to the user, don't add unneccesay jargons
    The Problem/Solution Amplifier:
    Template: The #1 [Data Problem] Your [Target Audience/Role] Is Making (And How to Fix It in [Timeframe])
    The Benefit-Driven Transformation:
    Template: How to [Achieve Desired Data Outcome] in As Little As [Timeframe], Even If You [Common Objection/Past Failure]
    The Curiosity-Inducing Story:
    Template: A [Unlikely Character/Unexpected Tool] Reveals How to [Achieve Surprising Data Result] Without [Painful Effort/Expensive Resources]
    The Value-Packed Listicle:
    Template: [Odd Number] [Specific Adjective, e.g., "Game-Changing"] [Data Topic] Techniques to [Key Benefit] for [Target Audience/Role]
    The Authoritative Stance:
    Template: My Honest Opinion on [Industry Trend/Controversial Data Topic] (Based on [Specific Achievement/Data])
    The Direct Offer with Authority:
    Template: I Help [Specific Data Market Segment] to [Solve Problem/Achieve Data Goal] (My [Number] Years of Experience Show How)
    The Avoidance of Pain Warning:
    Template: Don’t Even Think About Trying to [Painful Data Action/Mistake] Until You Read This [Key Insight/Solution]
    The Before-After Transformation:
    Template: From [Undesirable "Before" State in Data] to [Desirable "After" State in Data]: The [Specific Method/Product] That Made It Possible
    The Targeted Question & Solution:
    Template: Are You Tired of [Specific Data Problem/Frustration]? Here’s How to [Simple Solution/Benefit]
    The Personal Milestone & Lesson:
    Template: My [Personal Data Achievement/Business Aspect] Just Hit [Impressive Milestone]: [Number] Rules I Wish I Knew When I Started in [Year/Context]

    select the post appropriate template and and write a single title
    Return the response as a valid JSON object with this exact format:
    {
      "titles": ["Title 1 here...", "Title 2 here...", "Title 3 here..."]
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
