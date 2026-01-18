import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  const { description } = await req.json();

  if (!description || typeof description !== "string") {
    return Response.json({ error: "Description is required" }, { status: 400 });
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "Genera un título conciso (máximo 8 palabras) que resuma el siguiente evento. Responde solo con el título, sin comillas ni puntuación final.",
      },
      { role: "user", content: description },
    ],
  });

  const title = completion.choices[0].message.content?.trim() ?? "";

  return Response.json({ title });
}
