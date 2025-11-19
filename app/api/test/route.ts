// app/api/test/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.OPENAI_API_KEY;
    return NextResponse.json({
      success: true,
      message: "Backend running",
      apiKeyExists: !!key,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
