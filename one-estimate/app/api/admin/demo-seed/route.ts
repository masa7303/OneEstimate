import { NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// ==================================================
// demo-app から移植したデモデータ
// ==================================================

const SERIES = [
  { name: 'スタンダードシリーズ', description: 'コストパフォーマンスに優れた基本仕様', baseCost: 10920000, marginRate: 0.22, basePrice: 14000000, sortOrder: 0 },
  { name: 'コンフォートシリーズ', description: '快適性と機能性を両立したミドルグレード', baseCost: 13416000, marginRate: 0.22, basePrice: 17200000, sortOrder: 1 },
  { name: 'プレミアムシリーズ', description: '上質な素材と高性能を追求したハイグレード', baseCost: 15600000, marginRate: 0.22, basePrice: 20000000, sortOrder: 2 },
  { name: 'ラグジュアリーシリーズ', description: '最高級の仕様と特別なデザイン', baseCost: 18720000, marginRate: 0.22, basePrice: 24000000, sortOrder: 3 },
]

const SPEC_LABELS = [
  '耐震等級', '断熱性', '気密性', '構造', '基礎', '外壁', '断熱材', '屋根', '窓', 'キッチン', '浴室', 'トイレ', '床材', '壁', '保証',
]

const SPEC_VALUES: Record<number, string[]> = {
  0: ['耐震等級3', 'UA値 0.6', 'C値 0.8', '木造軸組工法', 'ベタ基礎', '窯業系サイディング 14mm', 'グラスウール16k', 'カラーベスト', 'アルミサッシ（ペアガラス）', 'システムキッチン 2550mm', 'ユニットバス 1616サイズ', '温水洗浄便座付き', '複合フローリング', 'ビニールクロス', '10年保証'],
  1: ['耐震等級3', 'UA値 0.6', 'C値 0.8', '木造軸組工法（耐震等級3）', 'ベタ基礎（配筋強化）', '窯業系サイディング 16mm', 'グラスウール24k', 'ガルバリウム鋼板', '樹脂サッシ（Low-Eペアガラス）', 'システムキッチン 2700mm（対面式）', 'ユニットバス 1620サイズ（浴室暖房乾燥機付）', 'タンクレストイレ', '無垢フローリング', '珪藻土', '20年保証'],
  2: ['耐震等級3', 'UA値 0.6', 'C値 0.8', '木造軸組工法（耐震等級3 + 制震装置）', 'ベタ基礎（高強度コンクリート）', '窯業系サイディング 18mm + 外断熱', 'ウレタンフォーム', 'ガルバリウム鋼板（遮熱塗装）', '樹脂サッシ（トリプルガラス）', 'システムキッチン 3000mm（造作対面式）', 'ユニットバス 1624サイズ（ジェットバス付）', 'タンクレストイレ（自動開閉）', '無垢フローリング（広葉樹）', '漆喰・珪藻土', '30年保証'],
  3: ['耐震等級3', 'UA値 0.6', 'C値 0.8', '木造軸組工法（耐震等級3 + 制震 + 免震）', 'ベタ基礎（高強度コンクリート + 地盤改良）', 'タイル外壁 + 外断熱', 'フェノールフォーム', 'ガルバリウム鋼板（断熱材一体型）', '樹脂サッシ（トリプル Low-E アルゴンガス入）', 'オーダーメイドキッチン 3600mm', 'オーダーメイドバスルーム（ミストサウナ付）', 'タンクレストイレ（全自動）', '無垢フローリング（銘木）', '漆喰・珪藻土・エコカラット', '50年保証'],
}

const TSUBO_COEFFICIENTS: [number, number][] = [
  [15,0.615],[16,0.641],[17,0.667],[18,0.692],[19,0.718],
  [20,0.744],[21,0.770],[22,0.795],[23,0.821],[24,0.847],
  [25,0.872],[26,0.898],[27,0.924],[28,0.949],[29,0.975],
  [30,1.000],[31,1.026],[32,1.052],[33,1.077],[34,1.103],
  [35,1.128],[36,1.154],[37,1.180],[38,1.205],[39,1.231],
  [40,1.256],[41,1.282],[42,1.308],[43,1.333],[44,1.359],
  [45,1.384],
]

const ATRIUM_PRICES = [
  { label: 'なし', cost: 0, price: 0 },
  { label: '小', cost: 150000, price: 200000 },
  { label: '中', cost: 225000, price: 300000 },
  { label: '大', cost: 300000, price: 400000 },
]

const VARIATION_TYPES = [
  {
    slug: 'layout', name: '建物形状', items: [
      { name: '長方形・正方形タイプ', cost: 0, price: 0 },
      { name: 'L字型タイプ', cost: 200000, price: 256000 },
      { name: 'コの字型タイプ', cost: 400000, price: 512000 },
      { name: '複雑型タイプ', cost: 550000, price: 700000 },
      { name: 'ロの字型タイプ', cost: 500000, price: 640000 },
    ],
  },
  {
    slug: 'roof', name: '屋根形状', items: [
      { name: '切妻屋根', cost: -40000, price: -50000 },
      { name: '寄棟屋根', cost: 0, price: 0 },
      { name: '片流れ屋根', cost: 40000, price: 50000 },
      { name: '方形屋根', cost: 80000, price: 100000 },
      { name: '半切妻屋根', cost: 120000, price: 150000 },
      { name: '差しかけ屋根', cost: 240000, price: 300000 },
      { name: '入母屋屋根', cost: 360000, price: 450000 },
      { name: '陸屋根', cost: 320000, price: 400000 },
    ],
  },
  {
    slug: 'outdoor', name: '外部空間', items: [
      { name: '標準（なし）', cost: 0, price: 0 },
      { name: 'くつろぎデッキプラン', cost: 140000, price: 180000 },
      { name: 'テラスプラン', cost: 250000, price: 320000 },
    ],
  },
]

const OPTION_CATEGORIES = [
  { name: 'キッチン', items: [
    { name: '標準 LIXIL シエラS 2550mm', cost: 0, price: 0 },
    { name: 'LIXIL ノクト（旧アレスタ）', cost: 195000, price: 250000 },
    { name: 'クリナップ ステディア', cost: 320000, price: 410000 },
    { name: 'パナソニック Lクラス', cost: 663000, price: 850000 },
  ]},
  { name: '食洗器', items: [
    { name: '標準 パナソニック NP-45シリーズ（浅型）', cost: 0, price: 0 },
    { name: 'パナソニック NP-45MD9S（深型）', cost: 47000, price: 60000 },
    { name: 'BOSCH SMV4ZDX016JP（海外製）', cost: 183000, price: 234000 },
    { name: 'Miele G7104SCi（ミーレ）', cost: 296000, price: 380000 },
  ]},
  { name: '水栓', items: [
    { name: '標準 シングルレバー混合水栓', cost: 0, price: 0 },
    { name: 'タッチレス水栓 LIXIL ナビッシュ', cost: 36000, price: 46300 },
    { name: '浄水器ビルトイン一体型＋ハンズフリー', cost: 91000, price: 117000 },
    { name: 'GROHE Minta', cost: 77000, price: 98600 },
  ]},
  { name: '洗面化粧台', items: [
    { name: '標準 LIXIL ピアラ 750mm', cost: 0, price: 0 },
    { name: 'LIXIL ルミシス', cost: 51000, price: 65333 },
    { name: 'LIXIL クレヴィ セラミックカウンター', cost: 87000, price: 112000 },
    { name: '造作洗面カウンター仕様', cost: 197000, price: 252000 },
  ]},
  { name: '収納', items: [
    { name: '標準 LIXIL すっきり棚', cost: 0, price: 0 },
    { name: 'LIXIL ぴったり棚パントリープラン', cost: 11500, price: 14800 },
    { name: '造作収納（可動棚＋引き出し）', cost: 70000, price: 90000 },
    { name: 'ファミリークローク仕様', cost: 133000, price: 170000 },
  ]},
  { name: 'カップボード', items: [
    { name: '標準 LIXIL シエラS W1800', cost: 0, price: 0 },
    { name: 'LIXIL シエラS 家電収納タイプ', cost: 39000, price: 50000 },
    { name: 'LIXIL リシェルSI 吊戸＋ゴミ箱スペース', cost: 86000, price: 110000 },
    { name: '造作カップボードプラン', cost: 156000, price: 200000 },
  ]},
  { name: '断熱性', items: [
    { name: '標準仕様（等級5相当）グラスウール16K', cost: 0, price: 0 },
    { name: 'あたたか快適プラン', cost: 500000, price: 640000 },
    { name: '高断熱ECOプラン（等級7相当）', cost: 1060000, price: 1360000 },
    { name: 'プレミアム断熱プラン', cost: 1716000, price: 2200000 },
  ]},
  { name: '床暖房', items: [
    { name: '標準仕様（床暖なし）', cost: 0, price: 0 },
    { name: 'LDK床暖プラン（電気式）', cost: 218000, price: 280000 },
    { name: '温水式床暖プラン（LDK＋和室）', cost: 468000, price: 600000 },
    { name: '全館床暖プラン', cost: 905000, price: 1160000 },
  ]},
  { name: '空調/換気', items: [
    { name: '標準 各室個別換気（第3種）', cost: 0, price: 0 },
    { name: '熱交換換気（第1種）ロスナイ', cost: 218000, price: 280000 },
    { name: '熱交換＋高性能フィルタ', cost: 343000, price: 440000 },
    { name: '全館空調 ウイズエアー', cost: 1061000, price: 1360000 },
  ]},
  { name: 'カーポート', items: [
    { name: '標準仕様（なし）', cost: 0, price: 0 },
    { name: '1台用 LIXIL ネスカR', cost: 117000, price: 150000 },
    { name: '2台用 LIXIL ネスカF', cost: 172000, price: 220000 },
    { name: '耐風/積雪対応 LIXIL フーゴF', cost: 273000, price: 350000 },
    { name: 'サイクルポート付きセット', cost: 211000, price: 270000 },
  ]},
  { name: '外壁グレード', items: [
    { name: '標準 ニチハ モエンエクセラード16', cost: 0, price: 0 },
    { name: '高耐久塗装 KMEW 光セラ18', cost: 476000, price: 610000 },
    { name: 'フラットモダンプラン', cost: 530000, price: 680000 },
    { name: 'タイル外壁 LIXIL ベルニュータイル', cost: 998000, price: 1280000 },
  ]},
  { name: '壁', items: [
    { name: '標準仕様', cost: 0, price: 0 },
    { name: '機能性クロス サンゲツ', cost: 70000, price: 90000 },
    { name: 'デザインアクセントクロス', cost: 133000, price: 170000 },
    { name: '高級クロス（輸入・織物調）', cost: 257000, price: 330000 },
  ]},
  { name: '床', items: [
    { name: '標準 複合フローリング', cost: 0, price: 0 },
    { name: '高耐久フローリング', cost: 156000, price: 200000 },
    { name: '突板ナチュラルフロア', cost: 312000, price: 400000 },
    { name: '無垢フローリング', cost: 624000, price: 800000 },
  ]},
]

const QUESTIONS = [
  { title: 'ご家族構成を教えてください', choices: ['夫婦のみ', '夫婦＋子ども1人', '夫婦＋子ども2人以上', '三世代（親と同居を含む）'] },
  { title: 'お子さまの年齢層を教えてください', choices: ['未就学児', '小学生', '中高生', '社会人または独立予定'] },
  { title: '希望している建築エリアはどのような場所ですか？', advice: '土地選びで"安く見えて高くつく土地"がある！土地は価格より「建てやすさ」が重要です。', choices: ['職場・学校に近い', '実家の近く', '自然が多い環境', '土地価格を重視'] },
  { title: '総予算イメージを教えてください', inputType: 'CHOICE', choices: ['2,500万円以下', '2,500〜3,000万円', '3,000〜3,500万円', '3,500万円以上'] },
  { title: 'コストのかけ方の優先順位は？', choices: ['性能（断熱・耐震）', 'デザイン・素材', '設備（キッチン・お風呂）', '外構・庭'] },
  { title: '大切にしたい時間は？', choices: ['家族団らん', '一人の時間', '趣味・作業', '在宅ワーク'] },
  { title: 'キッチンの理想は？', choices: ['対面式で家族と会話', '独立型で集中', 'アイランドでおしゃれに', '使いやすさ重視'] },
  { title: '洗面スペースの理想は？', choices: ['朝の渋滞解消（2ボウル）', 'コンパクトで十分', '造作でおしゃれに', '収納重視'] },
  { title: '収納の考え方は？', choices: ['各部屋に分散', 'ファミリークローク集約', 'ウォークイン重視', 'パントリー重視'] },
  { title: '室内のテイストは？', choices: ['ナチュラル・木の温もり', 'モダン・スタイリッシュ', '和モダン', 'シンプル・ミニマル'] },
  { title: '光熱費・快適性について', choices: ['初期費用優先', 'ランニングコスト重視', '快適性最優先', 'バランス型'] },
  { title: '外構・駐車スペースについて', choices: ['駐車1台で十分', '駐車2台以上必要', '庭・ガーデニング重視', 'シンプルに抑えたい'] },
]

const INITIAL_SETTINGS = [
  // B: 付帯工事費
  { section: 'B', itemName: '屋外給排水工事', defaultAmount: 650000, sortOrder: 0 },
  { section: 'B', itemName: '残土処分費', defaultAmount: 450000, sortOrder: 1 },
  { section: 'B', itemName: '近隣保全対策費', defaultAmount: 600000, sortOrder: 2 },
  { section: 'B', itemName: '仮設工事費', defaultAmount: 150000, sortOrder: 3 },
  { section: 'B', itemName: '設計管理費', defaultAmount: 500000, sortOrder: 4 },
  { section: 'B', itemName: '小運搬費', defaultAmount: 1200000, sortOrder: 5 },
  // C: その他工事費
  { section: 'C', itemName: '照明工事', defaultAmount: 200000, sortOrder: 0 },
  { section: 'C', itemName: 'カーテン工事', defaultAmount: 150000, sortOrder: 1 },
  { section: 'C', itemName: 'エアコン工事', defaultAmount: 450000, sortOrder: 2 },
  // D: その他諸経費
  { section: 'D', itemName: '引越代', defaultAmount: 0, sortOrder: 0 },
  { section: 'D', itemName: '仮住まい費用', defaultAmount: 0, sortOrder: 1 },
  // E: 事務手数料
  { section: 'E', itemName: '請負契約印紙代', defaultAmount: 12000, sortOrder: 0 },
  { section: 'E', itemName: '保存登記', defaultAmount: 190000, sortOrder: 1 },
  { section: 'E', itemName: '設計審査・工事検査立会費', defaultAmount: 50000, sortOrder: 2 },
  { section: 'E', itemName: '電気線防護管費用', defaultAmount: 100000, sortOrder: 3 },
  // F: 土地費用
  { section: 'F', itemName: '土地購入費', defaultAmount: 0, sortOrder: 0 },
  { section: 'F', itemName: '仲介手数料', defaultAmount: 0, sortOrder: 1 },
]

const FUNDING_TEMPLATES = [
  { section: 'G', itemName: 'ZEH支援事業', defaultAmount: 0, sortOrder: 0 },
  { section: 'G', itemName: '自治体補助金', defaultAmount: 0, sortOrder: 1 },
]

const COMPANY_INFO = {
  name: '株式会社 サンプル工務店',
  address: '〒000-0000 東京都○○区○○1-2-3',
  tel: '03-0000-0000',
  fax: '03-0000-0001',
  notes: 'info@sample-koumuten.co.jp',
}

// ==================================================
// POST /api/admin/demo-seed — デモデータ投入
// ==================================================
export async function POST() {
  try {
    const user = await requireDbUser()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: '管理者のみ実行可能です' }, { status: 403 })
    }
    const cid = user.companyId

    // 既存データを先に全削除（クリーンな状態で投入）
    await prisma.$transaction([
      prisma.estimateVariation.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateOption.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionB.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionC.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionD.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateAnswer.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateAiResult.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.fundingPlan.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimate.deleteMany({ where: { companyId: cid } }),
      prisma.customer.deleteMany({ where: { companyId: cid } }),
      prisma.seriesSpecValue.deleteMany({ where: { series: { companyId: cid } } }),
      prisma.series.deleteMany({ where: { companyId: cid } }),
      prisma.specLabel.deleteMany({ where: { companyId: cid } }),
      prisma.optionItem.deleteMany({ where: { category: { companyId: cid } } }),
      prisma.optionCategory.deleteMany({ where: { companyId: cid } }),
      prisma.variationItem.deleteMany({ where: { variationType: { companyId: cid } } }),
      prisma.variationType.deleteMany({ where: { companyId: cid } }),
      prisma.tsuboCoefficient.deleteMany({ where: { companyId: cid } }),
      prisma.atriumPrice.deleteMany({ where: { companyId: cid } }),
      prisma.roomPriceSetting.deleteMany({ where: { companyId: cid } }),
      prisma.questionChoice.deleteMany({ where: { question: { companyId: cid } } }),
      prisma.question.deleteMany({ where: { companyId: cid } }),
      prisma.initialSetting.deleteMany({ where: { companyId: cid } }),
      prisma.fundingPlanTemplate.deleteMany({ where: { companyId: cid } }),
      prisma.companyInfo.deleteMany({ where: { companyId: cid } }),
    ])

    // 1. シリーズ + 仕様
    const specLabelRecords = await Promise.all(
      SPEC_LABELS.map((label, i) =>
        prisma.specLabel.create({ data: { companyId: cid, label, sortOrder: i } })
      )
    )

    for (let si = 0; si < SERIES.length; si++) {
      const s = SERIES[si]
      const series = await prisma.series.create({
        data: { companyId: cid, ...s },
      })
      const values = SPEC_VALUES[si]
      if (values) {
        await prisma.seriesSpecValue.createMany({
          data: values.map((value, li) => ({
            seriesId: series.id,
            specLabelId: specLabelRecords[li].id,
            value,
          })),
        })
      }
    }

    // 2. 坪数係数
    await prisma.tsuboCoefficient.createMany({
      data: TSUBO_COEFFICIENTS.map(([tsubo, coefficient]) => ({ companyId: cid, tsubo, coefficient })),
    })

    // 3. 吹き抜け価格
    await Promise.all(
      ATRIUM_PRICES.map((a, i) => prisma.atriumPrice.create({ data: { companyId: cid, ...a, sortOrder: i } }))
    )

    // 4. 部屋数追加費用
    await prisma.roomPriceSetting.create({
      data: { companyId: cid, floor1BaseRooms: 3, floor1UnitCost: 91000, floor1UnitPrice: 91000, floor2UnitCost: 66000, floor2UnitPrice: 66000 },
    })

    // 5. 変動費
    for (let vi = 0; vi < VARIATION_TYPES.length; vi++) {
      const vt = VARIATION_TYPES[vi]
      const vtRecord = await prisma.variationType.create({
        data: { companyId: cid, slug: vt.slug, name: vt.name, sortOrder: vi },
      })
      await prisma.variationItem.createMany({
        data: vt.items.map((item, ii) => ({ variationTypeId: vtRecord.id, ...item, sortOrder: ii })),
      })
    }

    // 6. オプション
    for (let ci = 0; ci < OPTION_CATEGORIES.length; ci++) {
      const cat = OPTION_CATEGORIES[ci]
      const catRecord = await prisma.optionCategory.create({
        data: { companyId: cid, name: cat.name, sortOrder: ci },
      })
      await prisma.optionItem.createMany({
        data: cat.items.map((item, ii) => ({ categoryId: catRecord.id, ...item, sortOrder: ii })),
      })
    }

    // 7. アンケート
    for (let qi = 0; qi < QUESTIONS.length; qi++) {
      const q = QUESTIONS[qi]
      const qRecord = await prisma.question.create({
        data: {
          companyId: cid,
          title: q.title,
          advice: (q as any).advice || null,
          inputType: (q as any).inputType || 'CHOICE',
          sortOrder: qi,
        },
      })
      await prisma.questionChoice.createMany({
        data: q.choices.map((label, ci2) => ({
          questionId: qRecord.id,
          label,
          value: String.fromCharCode(65 + ci2), // A, B, C, D
          sortOrder: ci2,
        })),
      })
    }

    // 8. 初期設定
    await prisma.initialSetting.createMany({
      data: INITIAL_SETTINGS.map(s => ({ companyId: cid, ...s })),
    })

    // 9. 資金計画書テンプレート
    await prisma.fundingPlanTemplate.createMany({
      data: FUNDING_TEMPLATES.map(t => ({ companyId: cid, ...t })),
    })

    // 10. 会社情報
    await prisma.companyInfo.upsert({
      where: { companyId: cid },
      update: COMPANY_INFO,
      create: { companyId: cid, ...COMPANY_INFO },
    })

    return NextResponse.json({ success: true, message: 'デモデータを投入しました' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'デモデータ投入に失敗しました' }, { status: 500 })
  }
}

// ==================================================
// DELETE /api/admin/demo-seed — デモデータ削除
// ==================================================
export async function DELETE() {
  try {
    const user = await requireDbUser()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: '管理者のみ実行可能です' }, { status: 403 })
    }
    const cid = user.companyId

    // カスケードで子レコードも削除される
    await prisma.$transaction([
      // 見積関連（見積はSeriesへの参照があるため先に削除）
      prisma.estimateVariation.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateOption.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionB.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionC.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateSectionD.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateAnswer.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimateAiResult.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.fundingPlan.deleteMany({ where: { estimate: { companyId: cid } } }),
      prisma.estimate.deleteMany({ where: { companyId: cid } }),
      // 顧客
      prisma.customer.deleteMany({ where: { companyId: cid } }),
      // マスターデータ
      prisma.seriesSpecValue.deleteMany({ where: { series: { companyId: cid } } }),
      prisma.series.deleteMany({ where: { companyId: cid } }),
      prisma.specLabel.deleteMany({ where: { companyId: cid } }),
      prisma.optionItem.deleteMany({ where: { category: { companyId: cid } } }),
      prisma.optionCategory.deleteMany({ where: { companyId: cid } }),
      prisma.variationItem.deleteMany({ where: { variationType: { companyId: cid } } }),
      prisma.variationType.deleteMany({ where: { companyId: cid } }),
      prisma.tsuboCoefficient.deleteMany({ where: { companyId: cid } }),
      prisma.atriumPrice.deleteMany({ where: { companyId: cid } }),
      prisma.roomPriceSetting.deleteMany({ where: { companyId: cid } }),
      prisma.questionChoice.deleteMany({ where: { question: { companyId: cid } } }),
      prisma.question.deleteMany({ where: { companyId: cid } }),
      prisma.initialSetting.deleteMany({ where: { companyId: cid } }),
      prisma.fundingPlanTemplate.deleteMany({ where: { companyId: cid } }),
      prisma.companyInfo.deleteMany({ where: { companyId: cid } }),
    ])

    return NextResponse.json({ success: true, message: 'デモデータを全削除しました' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'デモデータ削除に失敗しました' }, { status: 500 })
  }
}
