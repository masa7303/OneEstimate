import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'

type RecommendRequest = {
  seriesName: string
  tsubo: number
  answers: { questionTitle: string; choiceValue: string }[]
  optionCategories: { id: string; name: string; items: { id: string; name: string; price: number }[] }[]
}

// POST /api/ai/recommend — AI推薦（OpenAI gpt-4o）
export async function POST(req: NextRequest) {
  try {
    await requireDbUser()
    const body: RecommendRequest = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // フォールバック: ルールベース推薦
      return NextResponse.json(generateFallbackRecommendation(body))
    }

    try {
      const prompt = buildPrompt(body)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'あなたは住宅建築のプロフェッショナルアドバイザーです。顧客のアンケート回答に基づいて、最適な住宅オプションを推薦してください。必ず指定されたJSON形式で回答してください。',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        return NextResponse.json(generateFallbackRecommendation(body))
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        return NextResponse.json(generateFallbackRecommendation(body))
      }

      const parsed = JSON.parse(content)
      return NextResponse.json({
        summary: parsed.summary || 'お客様のご要望に合わせたおすすめプランです。',
        tags: parsed.tags || [],
        recommendations: parsed.recommendations || [],
      })
    } catch {
      return NextResponse.json(generateFallbackRecommendation(body))
    }
  } catch {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 })
  }
}

function buildPrompt(body: RecommendRequest): string {
  const answersText = body.answers
    .map(a => `- ${a.questionTitle}: ${a.choiceValue}`)
    .join('\n')

  const categoriesText = body.optionCategories
    .map(cat => {
      const items = cat.items.map((item, i) => `  ${i}: ${item.name} (¥${item.price.toLocaleString()})`).join('\n')
      return `【${cat.name}】(categoryId: ${cat.id})\n${items}`
    })
    .join('\n\n')

  return `以下の情報を基に、このお客様に最適なオプションを推薦してください。

## 住宅情報
- シリーズ: ${body.seriesName}
- 坪数: ${body.tsubo}坪

## アンケート回答
${answersText}

## 選択可能なオプション
${categoriesText}

## 出力JSON形式
{
  "summary": "推薦の概要（2-3文）",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "recommendations": [
    {
      "categoryId": "カテゴリID",
      "itemIndex": 0,
      "reason": "推薦理由（1文）"
    }
  ]
}

各カテゴリから最も適切な1つのオプションを推薦してください。推薦しないカテゴリは省略してOKです。`
}

function generateFallbackRecommendation(body: RecommendRequest) {
  const recommendations = body.optionCategories
    .filter(cat => cat.items.length > 0)
    .map(cat => ({
      categoryId: cat.id,
      itemIndex: 0,
      reason: `${cat.name}のスタンダードな選択です。`,
    }))

  return {
    summary: `${body.seriesName}（${body.tsubo}坪）に合わせた基本的なおすすめプランです。`,
    tags: ['スタンダード', body.seriesName],
    recommendations,
  }
}
