import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { titlePrompt } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate a short and compelling Title for a LinkedIn post based on the following content: "${titlePrompt}". The CTA should be a single phrase, less than 15 words, and should encourage engagement (e.g., "Learn more," "Leave a comment," "Tag a friend").

Return the response as a valid JSON object with a single key "cta", which is a string. Do not include any extra text or markdown formatting like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the string by removing Markdown code fences
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd);
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(text);

    return NextResponse.json({ cta: parsedResponse.cta });
  } catch (error) {
    console.error("Error generating Title:", error);
    return NextResponse.json({ error: "Failed to generate Title." }, { status: 500 });
  }
}