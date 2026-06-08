import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      data: {
        explanation: `${body.word ?? "该单词"} 的 AI 解释接口已预留。配置 OPENAI_API_KEY 后可接入例句、词义拆解和近义词对比。`,
        example: body.word ? `${body.word}を使った例文を生成できます。` : "",
        synonyms: []
      },
      warning: "OPENAI_API_KEY is not configured."
    });
  }

  return NextResponse.json({
    error: "Model call is intentionally left as an integration point. Add your preferred OpenAI SDK call here."
  });
}
