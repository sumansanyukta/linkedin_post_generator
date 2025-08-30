import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, category } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Act as a data expert creating a LinkedIn "one-slide wisdom" post. 
    Your task is to generate a highly engaging hook (title) for the topic: ${topic}.
    Your response should be a single, impactful title (1-2 lines) that:
    Is tailored to the category: ${category}.
    Grabs attention by using a number (e.g., "3 secrets," "5 mistakes").
    Addresses the audience directly using "you."  
    Frames the topic as a problem and agitates it to create curiosity.
    Is specific, simple, and unique.
    Example format: [Number] [Topic] Secrets I Wish I Knew Earlier (They Made Me [Outcome]).
    Return the response as a valid JSON object with this exact format:
    {
      "title": "Your title content here..."
    }

    Do not include any extra text or markdown formatting like \`\`\`json.`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response by removing markdown and isolating the JSON object
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd);
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(text);

    // Validate the parsed response format
    if (!parsedResponse.title) {
      throw new Error("Invalid response format from AI. 'title' key not found.");
    }
    
    // Return the single title
    return NextResponse.json({ title: parsedResponse.title });
    
  } catch (error) {
    console.error("Error generating titles:", error);
    return NextResponse.json({ error: "Failed to generate titles." }, { status: 500 });
  }
}