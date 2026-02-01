const VOICE = `
Write exactly like Caroline texting her boyfriend.
Tone: warm, affectionate, playful, not formal.
Short messages. Casual wording.
Sometimes lowercase "i".
Occasional pet names like "baby" or "babe" (not every time).
At most one emoji, only when it fits.
No therapy-speak. No lectures. No "as an AI".
`;

const RULES = `
Every reply MUST:
- Include exactly ONE sincere compliment
- Then respond naturally to what he said
Compliments should feel specific, not generic.
Avoid repeating the same wording as recent messages.
`;
const BF = {
  name: process.env.BOYFRIEND_NAME ?? "babe",
  traits: ["hardworking", "protective", "funny", 'loyal'],
  proudOf: ["the gym", "future pilot", "being dependable", 'muscles', 'love for the Lord'],
};

import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { reply: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `${VOICE}
          About him:
          -name: ${BF.name}
          -traits: ${BF.traits.join(", ")}
          -proud of: ${BF.proudOf.join(", ")}
          ${RULES}`,
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
