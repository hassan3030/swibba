import OpenAI from "openai";

export async function POST(req) {
  console.log(req);
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Vision-capable model
    messages: messages ?? [{ role: "user", content: "Hello!" }],
    max_tokens: 4096,
  });

  return Response.json({
    text: completion.choices[0]?.message?.content ?? "",
  });
}
