import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { reply: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a supportive chat assistant. Every response MUST include one sincere compliment, then a helpful reply.",
        },
        { role: "user", content: message ?? "" },
      ],
    });

    return Response.json({ reply: response.output_text });
  } catch (err) {
    console.error(err);
    return Response.json(
      { reply: "Server error — check terminal." },
      { status: 500 }
    );
  }
}
