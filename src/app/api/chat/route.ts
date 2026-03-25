import { NextResponse } from "next/server";
import { AI_CONTEXT } from "@/data/ai-context";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "A chave API da Nvidia não foi configurada no servidor (.env.local)." },
        { status: 500 }
      );
    }

    // Faz o fetch para o endpoint OpenAI-compatible da Nvidia NIM (Usando Llama 3.1 70b)
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct", // Modelo ultra-rápido de 8b pra respostas instantâneas
        messages: [
          {
            role: "system",
            content: AI_CONTEXT,
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 150, // Limite forçado rígido
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
    
  } catch (error: any) {
    console.error("Chat API Error:", error.message);
    return NextResponse.json({ error: "Falha ao se comunicar com a IA." }, { status: 500 });
  }
}
