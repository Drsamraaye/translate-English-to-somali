import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // MODELKA RASMIGA AH EE HADA SHAQEYA
      messages: [
        { role: "system", content: "Translate English to Somali with grammar and word type." },
        { role: "user", content: text }
      ],
      temperature: 0.2
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Empty response from model" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translated: content
    });

  } catch (err: any) {
    console.error("API Error:", err);

    return NextResponse.json(
      { success: false, error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
