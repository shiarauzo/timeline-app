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
        content: `Analiza el siguiente evento y responde SOLO con un JSON válido (sin markdown, sin backticks):
{"title": "título conciso máximo 8 palabras SIN fechas ni años", "year": "año en formato YYYY o null si no hay fecha"}

Ejemplos:
- "El hombre llegó a la luna en 1969" → {"title": "El hombre llegó a la luna", "year": "1969"}
- "Inventaron la rueda" → {"title": "Invención de la rueda", "year": null}`,
      },
      { role: "user", content: description },
    ],
  });

  const content = completion.choices[0].message.content?.trim() ?? "{}";

  try {
    const parsed = JSON.parse(content);
    return Response.json({
      title: parsed.title || description.slice(0, 50),
      year: parsed.year || null,
    });
  } catch {
    return Response.json({
      title: description.slice(0, 50),
      year: null,
    });
  }
}
