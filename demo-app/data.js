// data.js - 見積もりアプリ共通データ定義
// 管理画面とメインアプリで共有

// ストレージキー
const STORAGE_KEY = 'estimator_data';
const COMPANY_KEY = 'estimator_company';

// 坪数係数テーブル
const tsuboCoefficients = {
    15: 0.615, 16: 0.641, 17: 0.667, 18: 0.692, 19: 0.718,
    20: 0.744, 21: 0.770, 22: 0.795, 23: 0.821, 24: 0.847,
    25: 0.872, 26: 0.898, 27: 0.924, 28: 0.949, 29: 0.975,
    30: 1.000, 31: 1.026, 32: 1.052, 33: 1.077, 34: 1.103,
    35: 1.128, 36: 1.154, 37: 1.180, 38: 1.205, 39: 1.231,
    40: 1.256, 41: 1.282, 42: 1.308, 43: 1.333, 44: 1.359,
    45: 1.384
};

// 吹き抜け価格定義
const atriumPrices = {
    none: 0,
    small: 200000,
    medium: 300000,
    large: 400000
};

// デフォルトデータ
const DEFAULT_DATA = {
    series: [
        {
            id: 1,
            name: 'スタンダードシリーズ',
            desc: 'コストパフォーマンスに優れた基本仕様',
            basePrice: 14000000,
            image: 'images/series/standard.jpg',
            specs: {
                earthquakeResistance: '耐震等級3',
                insulation: 'UA値 0.6',
                airtightness: 'C値 0.8',
                structure: '木造軸組工法',
                foundation: 'ベタ基礎',
                exterior: '窯業系サイディング 14mm',
                insulationMaterial: 'グラスウール16k',
                roof: 'カラーベスト',
                windows: 'アルミサッシ（ペアガラス）',
                kitchen: 'システムキッチン 2550mm',
                bathroom: 'ユニットバス 1616サイズ',
                toilet: '温水洗浄便座付き',
                flooring: '複合フローリング',
                wall: 'ビニールクロス',
                warranty: '10年保証'
            }
        },
        {
            id: 2,
            name: 'コンフォートシリーズ',
            desc: '快適性と機能性を両立したミドルグレード',
            basePrice: 17200000,
            image: 'images/series/comfort.jpg',
            specs: {
                earthquakeResistance: '耐震等級3',
                insulation: 'UA値 0.6',
                airtightness: 'C値 0.8',
                structure: '木造軸組工法（耐震等級3）',
                foundation: 'ベタ基礎（配筋強化）',
                exterior: '窯業系サイディング 16mm',
                insulationMaterial: 'グラスウール24k',
                roof: 'ガルバリウム鋼板',
                windows: '樹脂サッシ（Low-Eペアガラス）',
                kitchen: 'システムキッチン 2700mm（対面式）',
                bathroom: 'ユニットバス 1620サイズ（浴室暖房乾燥機付）',
                toilet: 'タンクレストイレ',
                flooring: '無垢フローリング',
                wall: '珪藻土',
                warranty: '20年保証'
            }
        },
        {
            id: 3,
            name: 'プレミアムシリーズ',
            desc: '上質な素材と高性能を追求したハイグレード',
            basePrice: 20000000,
            image: 'images/series/premium.jpg',
            specs: {
                earthquakeResistance: '耐震等級3',
                insulation: 'UA値 0.6',
                airtightness: 'C値 0.8',
                structure: '木造軸組工法（耐震等級3 + 制震装置）',
                foundation: 'ベタ基礎（高強度コンクリート）',
                exterior: '窯業系サイディング 18mm + 外断熱',
                insulationMaterial: 'ウレタンフォーム',
                roof: 'ガルバリウム鋼板（遮熱塗装）',
                windows: '樹脂サッシ（トリプルガラス）',
                kitchen: 'システムキッチン 3000mm（造作対面式）',
                bathroom: 'ユニットバス 1624サイズ（ジェットバス付）',
                toilet: 'タンクレストイレ（自動開閉）',
                flooring: '無垢フローリング（広葉樹）',
                wall: '漆喰・珪藻土',
                warranty: '30年保証'
            }
        },
        {
            id: 4,
            name: 'ラグジュアリーシリーズ',
            desc: '最高級の仕様と特別なデザイン',
            basePrice: 24000000,
            image: 'images/series/luxury.jpg',
            specs: {
                earthquakeResistance: '耐震等級3',
                insulation: 'UA値 0.6',
                airtightness: 'C値 0.8',
                structure: '木造軸組工法（耐震等級3 + 制震 + 免震）',
                foundation: 'ベタ基礎（高強度コンクリート + 地盤改良）',
                exterior: 'タイル外壁 + 外断熱',
                insulationMaterial: 'フェノールフォーム',
                roof: 'ガルバリウム鋼板（断熱材一体型）',
                windows: '樹脂サッシ（トリプル Low-E アルゴンガス入）',
                kitchen: 'オーダーメイドキッチン 3600mm',
                bathroom: 'オーダーメイドバスルーム（ミストサウナ付）',
                toilet: 'タンクレストイレ（全自動）',
                flooring: '無垢フローリング（銘木）',
                wall: '漆喰・珪藻土・エコカラット',
                warranty: '50年保証'
            }
        }
    ],
    variations: {
        layout: [
            { name: '長方形・正方形タイプ', price: 0, image: 'images/variations/layout/01.jpg' },
            { name: 'L字型タイプ', price: 256000, image: 'images/variations/layout/02.jpg' },
            { name: 'コの字型タイプ', price: 512000, image: 'images/variations/layout/03.jpg' },
            { name: '複雑型タイプ', price: 700000, image: 'images/variations/layout/05.jpg' },
            { name: 'ロの字型タイプ', price: 640000, image: 'images/variations/layout/04.jpg' }
        ],
        roomPricePerUnit: 91000,
        outdoor: [
            { name: '標準（なし）', price: 0, description: 'ポーチのみのシンプルプラン。', image: 'images/variations/outdoor/01.jpg' },
            { name: 'くつろぎデッキプラン', price: 180000, description: '小さなウッドデッキで外とのつながりを演出。', image: 'images/variations/outdoor/02.jpg' },
            { name: 'テラスプラン', price: 320000, description: '広めのデッキ＋庇付き。アウトドアリビングにも。', image: 'images/variations/outdoor/03.jpg' }
        ],
        roof: [
            { name: '切妻屋根', price: -50000, image: 'images/variations/roof/01.jpg' },
            { name: '寄棟屋根', price: 0, image: 'images/variations/roof/02.jpg' },
            { name: '片流れ屋根', price: 50000, image: 'images/variations/roof/03.jpg' },
            { name: '方形屋根', price: 100000, image: 'images/variations/roof/05.jpg' },
            { name: '半切妻屋根', price: 150000, image: 'images/variations/roof/07.jpg' },
            { name: '差しかけ屋根', price: 300000, image: 'images/variations/roof/08.jpg' },
            { name: '入母屋屋根', price: 450000, image: 'images/variations/roof/06.jpg' },
            { name: '陸屋根', price: 400000, image: 'images/variations/roof/04.jpg' }
        ]
    },
    options: {
        kitchen: {
            name: '1. キッチン',
            items: [
                { name: '標準 LIXIL シエラS 2550mm', price: 0, image: 'images/options/kitchen/lixil-sierra.jpg' },
                { name: 'LIXIL ノクト（旧アレスタ）', price: 250000, image: 'images/options/kitchen/lixil-nocto.jpg' },
                { name: 'クリナップ ステディア', price: 410000, image: 'images/options/kitchen/cleanup-stedia.jpg' },
                { name: 'パナソニック Lクラス', price: 850000, image: 'images/options/kitchen/panasonic-l-class.jpg' }
            ]
        },
        dishwasher: {
            name: '2. 食洗器',
            items: [
                { name: '標準 パナソニック NP-45シリーズ（浅型）', price: 0, image: 'images/options/dishwasher/panasonic-np45-shallow.jpg' },
                { name: 'パナソニック NP-45MD9S（深型）', price: 60000, image: 'images/options/dishwasher/panasonic-np45-deep.jpg' },
                { name: 'BOSCH SMV4ZDX016JP（海外製）', price: 234000, image: 'images/options/dishwasher/bosch.jpg' },
                { name: 'Miele G7104SCi（ミーレ）', price: 380000, image: 'images/options/dishwasher/miele.jpg' }
            ]
        },
        faucet: {
            name: '3. 水栓',
            items: [
                { name: '標準 シングルレバー混合水栓（浄水機能なし）', price: 0, image: 'images/options/faucet/standard-lever.jpg' },
                { name: 'タッチレス水栓（センサー式）LIXIL ナビッシュ', price: 46300, image: 'images/options/faucet/lixil-navish.jpg' },
                { name: '浄水器ビルトイン一体型＋ハンズフリー', price: 117000, image: 'images/options/faucet/builtin-purifier.jpg' },
                { name: '高級デザイン水栓（輸入ブランド）GROHE Minta', price: 98600, image: 'images/options/faucet/grohe-minta.jpg' }
            ]
        },
        washbasin: {
            name: '4. 洗面化粧台',
            items: [
                { name: '標準 LIXIL ピアラ（間口 750mm／扉タイプ）', price: 0, image: 'images/options/washbasin/lixil-piara.jpg' },
                { name: 'LIXIL ルミシス 扉＋引き出し混合モデル', price: 65333, image: 'images/options/washbasin/lixil-lumisis.jpg' },
                { name: 'LIXIL クレヴィ 高仕様（セラミックカウンター）', price: 112000, image: 'images/options/washbasin/lixil-clevy.jpg' },
                { name: '造作洗面カウンター仕様（タイル仕上げ）', price: 252000, image: 'images/options/washbasin/custom-counter.jpg' }
            ]
        },
        storage: {
            name: '5. 収納',
            items: [
                { name: '標準 LIXIL「すっきり棚」ベーシックセット', price: 0, image: 'images/options/storage/lixil-sukkiri.jpg' },
                { name: 'LIXIL「ぴったり棚」パントリープラン', price: 14800, image: 'images/options/storage/lixil-pittari.jpg' },
                { name: '造作収納（可動棚＋引き出し）', price: 90000, image: 'images/options/storage/custom-storage.jpg' },
                { name: 'ファミリークローク仕様', price: 170000, image: 'images/options/storage/family-closet.jpg' }
            ]
        },
        cupboard: {
            name: '6. カップボード',
            items: [
                { name: '標準 シンプル収納プラン（LIXIL シエラS W1800）', price: 0, image: 'images/options/cupboard/lixil-sierra-simple.jpg' },
                { name: '家電収納プラン（LIXIL シエラS 家電収納タイプ）', price: 50000, image: 'images/options/cupboard/lixil-sierra-appliance.jpg' },
                { name: '吊戸＋ゴミ箱スペースプラン（LIXIL リシェルSI）', price: 110000, image: 'images/options/cupboard/lixil-richelle-hanging.jpg' },
                { name: '造作カップボードプラン（造作家具業者製作）', price: 200000, image: 'images/options/cupboard/custom-cupboard.jpg' }
            ]
        },
        insulation: {
            name: '7. 断熱性',
            items: [
                { name: '標準仕様（等級5相当）グラスウール16K', price: 0, image: 'images/options/insulation/standard-grade5.jpg' },
                { name: 'あたたか快適プラン 吹付断熱＋樹脂サッシ', price: 640000, image: 'images/options/insulation/warm-comfort.jpg' },
                { name: '高断熱ECOプラン（等級7相当）発泡ウレタン＋トリプルガラス', price: 1360000, image: 'images/options/insulation/high-insulation-eco.jpg' },
                { name: 'プレミアム断熱プラン（パッシブG2〜G3）', price: 2200000, image: 'images/options/insulation/premium-passive.jpg' }
            ]
        },
        floorHeating: {
            name: '8. 床暖房',
            items: [
                { name: '標準仕様（床暖なし）', price: 0, image: 'images/options/floor-heating/none.jpg' },
                { name: 'LDK床暖プラン（約20帖に電気式床暖）', price: 280000, image: 'images/options/floor-heating/ldk-electric.jpg' },
                { name: '温水式床暖プラン（LDK＋和室など約25帖）', price: 600000, image: 'images/options/floor-heating/hydronic.jpg' },
                { name: '全館床暖プラン 全室床暖（各室パネル分岐）', price: 1160000, image: 'images/options/floor-heating/whole-house.jpg' }
            ]
        },
        ventilation: {
            name: '9. 空調/換気',
            items: [
                { name: '標準：各室個別換気（第3種）', price: 0, image: 'images/options/ventilation/standard-type3.jpg' },
                { name: '熱交換換気（第1種）三菱電機 ロスナイ', price: 280000, image: 'images/options/ventilation/lossnay.jpg' },
                { name: '熱交換＋高性能フィルタ（ロスナイ上位）', price: 440000, image: 'images/options/ventilation/lossnay-filter.jpg' },
                { name: '全館空調（冷暖＋調湿）パナソニック ウイズエアー', price: 1360000, image: 'images/options/ventilation/panasonic-with-air.jpg' }
            ]
        },
        carport: {
            name: '10. カーポート',
            items: [
                { name: '標準仕様（なし）', price: 0, image: 'images/options/carport/none.jpg' },
                { name: '1台用カーポート LIXIL ネスカR', price: 150000, image: 'images/options/carport/lixil-nesca-r-1.jpg' },
                { name: '2台用カーポート（フラット屋根）LIXIL ネスカF', price: 220000, image: 'images/options/carport/lixil-nesca-f-2.jpg' },
                { name: '耐風／積雪対応タイプ LIXIL フーゴF耐風100', price: 350000, image: 'images/options/carport/lixil-fugo-windproof.jpg' },
                { name: 'サイクルポート付きセット', price: 270000, image: 'images/options/carport/cycle-port-set.jpg' }
            ]
        },
        exterior: {
            name: '11. 外壁グレード',
            items: [
                { name: '標準 ニチハ モエンエクセラード16', price: 0, image: 'images/options/exterior/nichiha-moen.jpg' },
                { name: '高耐久塗装プラン KMEW 光セラ18', price: 610000, image: 'images/options/exterior/kmew-hikari18.jpg' },
                { name: 'フラットモダンプラン（意匠貼り分け）', price: 680000, image: 'images/options/exterior/flat-modern.jpg' },
                { name: 'タイル外壁プラン（高級仕様）LIXIL ベルニュータイル', price: 1280000, image: 'images/options/exterior/tile-exterior.jpg' }
            ]
        },
        wall: {
            name: '12. 壁',
            items: [
                { name: '標準仕様', price: 0, image: 'images/options/wall/standard.jpg' },
                { name: '機能性クロス サンゲツ FE／REシリーズ　撥水・抗菌・キズ防止など機能性追加。', price: 90000, image: 'images/options/wall/functional.jpg' },
                { name: 'デザインアクセントクロス（リリカラ LWシリーズ／東リ WVPシリーズ）', price: 170000, image: 'images/options/wall/design-accent.jpg' },
                { name: '高級クロス（輸入・織物調）トミタ／ウィリアムモリス／シンコールプレミアム', price: 330000, image: 'images/options/wall/luxury.jpg' }
            ]
        },
        floor: {
            name: '13. 床',
            items: [
                { name: '標準 複合フローリング（永大産業「アトムフロア」／NODA「Jネクシオ」）', price: 0, image: 'images/options/floor/standard.jpg' },
                { name: '高耐久フローリング', price: 200000, image: 'images/options/floor/durable.jpg' },
                { name: '突板ナチュラルフロア（Panasonic「ベリティスフロアー」／WOODONE「コンビット」）', price: 400000, image: 'images/options/floor/veneer.jpg' },
                { name: '無垢フローリング（WOODONE「ピノアース」／NODA「ラスティック」）', price: 800000, image: 'images/options/floor/solid-wood.jpg' }
            ]
        }
    },
    questions: [
        {
            id: 'q1',
            title: 'Q1. ご家族構成を教えてください。',
            options: [
                { value: '夫婦のみ', label: 'A：夫婦のみ' },
                { value: '夫婦＋子ども1人', label: 'B：夫婦＋子ども1人' },
                { value: '夫婦＋子ども2人以上', label: 'C：夫婦＋子ども2人以上' },
                { value: '三世代（親と同居を含む）', label: 'D：三世代（親と同居を含む）' }
            ],
            advice: null
        },
        {
            id: 'q2',
            title: 'Q2. お子さまの年齢層を教えてください。',
            options: [
                { value: '未就学児', label: 'A：未就学児' },
                { value: '小学生', label: 'B：小学生' },
                { value: '中高生', label: 'C：中高生' },
                { value: '社会人または独立予定', label: 'D：社会人または独立予定' }
            ],
            advice: null
        },
        {
            id: 'q3',
            title: 'Q3. 希望している建築エリアはどのような場所ですか？',
            options: [
                { value: '職場・学校に近い', label: 'A：職場・学校に近い' },
                { value: '実家の近く', label: 'B：実家の近く' },
                { value: '自然が多い環境', label: 'C：自然が多い環境' },
                { value: '土地価格を重視', label: 'D：土地価格を重視' }
            ],
            advice: {
                title: 'アドバイス：土地選びで"安く見えて高くつく土地"がある！',
                content: '土地は価格より「建てやすさ」が重要です。高低差がある土地は造成・擁壁で＋80〜150万円、前面道路が狭いと搬入コスト＋20〜30万円、給排水・ガスが遠いと引込工事＋20〜40万円かかります。'
            }
        },
        {
            id: 'q4',
            title: 'Q4. 総予算イメージを教えてください。',
            options: [
                { value: '2,500万円以下', label: 'A：2,500万円以下' },
                { value: '2,500〜3,000万円', label: 'B：2,500〜3,000万円' },
                { value: '3,000〜3,500万円', label: 'C：3,000〜3,500万円' },
                { value: '3,500万円以上', label: 'D：3,500万円以上' }
            ],
            advice: null
        },
        {
            id: 'q5',
            title: 'Q5. コストのかけ方の優先順位は？',
            options: [
                { value: '性能（断熱・耐震）', label: 'A：性能（断熱・耐震）' },
                { value: 'デザイン・素材', label: 'B：デザイン・素材' },
                { value: '設備（キッチン・お風呂）', label: 'C：設備（キッチン・お風呂）' },
                { value: '外構・庭', label: 'D：外構・庭' }
            ],
            advice: null
        },
        {
            id: 'q6',
            title: 'Q6. 大切にしたい時間は？',
            options: [
                { value: '家族団らん', label: 'A：家族団らん' },
                { value: '一人の時間', label: 'B：一人の時間' },
                { value: '趣味・作業', label: 'C：趣味・作業' },
                { value: '在宅ワーク', label: 'D：在宅ワーク' }
            ],
            advice: null
        },
        {
            id: 'q7',
            title: 'Q7. キッチンの理想は？',
            options: [
                { value: '対面式で家族と会話', label: 'A：対面式で家族と会話' },
                { value: '独立型で集中', label: 'B：独立型で集中' },
                { value: 'アイランドでおしゃれに', label: 'C：アイランドでおしゃれに' },
                { value: '使いやすさ重視', label: 'D：使いやすさ重視' }
            ],
            advice: null
        },
        {
            id: 'q8',
            title: 'Q8. 洗面スペースの理想は？',
            options: [
                { value: '朝の渋滞解消（2ボウル）', label: 'A：朝の渋滞解消（2ボウル）' },
                { value: 'コンパクトで十分', label: 'B：コンパクトで十分' },
                { value: '造作でおしゃれに', label: 'C：造作でおしゃれに' },
                { value: '収納重視', label: 'D：収納重視' }
            ],
            advice: null
        },
        {
            id: 'q9',
            title: 'Q9. 収納の考え方は？',
            options: [
                { value: '各部屋に分散', label: 'A：各部屋に分散' },
                { value: 'ファミリークローク集約', label: 'B：ファミリークローク集約' },
                { value: 'ウォークイン重視', label: 'C：ウォークイン重視' },
                { value: 'パントリー重視', label: 'D：パントリー重視' }
            ],
            advice: null
        },
        {
            id: 'q10',
            title: 'Q10. 室内のテイストは？',
            options: [
                { value: 'ナチュラル・木の温もり', label: 'A：ナチュラル・木の温もり' },
                { value: 'モダン・スタイリッシュ', label: 'B：モダン・スタイリッシュ' },
                { value: '和モダン', label: 'C：和モダン' },
                { value: 'シンプル・ミニマル', label: 'D：シンプル・ミニマル' }
            ],
            advice: null
        },
        {
            id: 'q11',
            title: 'Q11. 光熱費・快適性について',
            options: [
                { value: '初期費用優先', label: 'A：初期費用優先' },
                { value: 'ランニングコスト重視', label: 'B：ランニングコスト重視' },
                { value: '快適性最優先', label: 'C：快適性最優先' },
                { value: 'バランス型', label: 'D：バランス型' }
            ],
            advice: null
        },
        {
            id: 'q12',
            title: 'Q12. 外構・駐車スペースについて',
            options: [
                { value: '駐車1台で十分', label: 'A：駐車1台で十分' },
                { value: '駐車2台以上必要', label: 'B：駐車2台以上必要' },
                { value: '庭・ガーデニング重視', label: 'C：庭・ガーデニング重視' },
                { value: 'シンプルに抑えたい', label: 'D：シンプルに抑えたい' }
            ],
            advice: null
        }
    ]
};

// デフォルト会社情報
const DEFAULT_COMPANY = {
    name: '株式会社 サンプル工務店',
    address: '〒000-0000 東京都○○区○○1-2-3',
    tel: 'TEL: 03-0000-0000',
    fax: 'FAX: 03-0000-0001',
    email: 'info@sample-koumuten.co.jp',
    logo: null
};

// データ取得（LocalStorage優先、なければデフォルト）
function getData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // デフォルトデータとマージ（新しいキーがあれば追加）
            return { ...DEFAULT_DATA, ...parsed };
        }
    } catch (e) {
        console.error('データ読み込みエラー:', e);
    }
    return DEFAULT_DATA;
}

// データ保存
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('データ保存エラー:', e);
        return false;
    }
}

// 会社情報取得
function getCompanyInfo() {
    try {
        const stored = localStorage.getItem(COMPANY_KEY);
        if (stored) {
            return { ...DEFAULT_COMPANY, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('会社情報読み込みエラー:', e);
    }
    return DEFAULT_COMPANY;
}

// 会社情報保存
function saveCompanyInfo(company) {
    try {
        localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
        return true;
    } catch (e) {
        console.error('会社情報保存エラー:', e);
        return false;
    }
}

// データリセット（デフォルトに戻す）
function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPANY_KEY);
}

// =============================================
// 資金計画書データ
// =============================================

const FUNDING_PLAN_KEY = 'funding_plan_data';

const DEFAULT_FUNDING_PLAN = {
    customerName: '',
    date: '',
    // A. 建築工事費
    honthaiKoji: [
        { item: '建物本体工事一式', amount: 0, memo: '' },
        { item: '太陽光発電システム', amount: 0, memo: '' },
    ],
    futaiKoji: [
        { item: '屋外給排水工事', amount: 650000, memo: '' },
        { item: '本管引込水工事', amount: 0, memo: '打合せにより確定' },
        { item: '残土処分費', amount: 450000, memo: '' },
        { item: '近隣保全対策費', amount: 600000, memo: '' },
        { item: '仮設工事費', amount: 150000, memo: '' },
        { item: '地盤改良工事費用', amount: 0, memo: '調査後確定' },
    ],
    shohi: [
        { item: '設計管理費', amount: 500000, memo: '' },
        { item: '小運搬費', amount: 1200000, memo: '' },
    ],
    // B. その他必要工事
    sonotaKoji: [
        { item: '照明工事', amount: 200000, memo: '' },
        { item: 'カーテン工事', amount: 150000, memo: '' },
        { item: 'エアコン工事', amount: 450000, memo: '' },
        { item: '解体工事', amount: 0, memo: '' },
        { item: '外構工事', amount: 0, memo: '' },
    ],
    // C. その他諸経費等
    sonotaShohi: [
        { item: '引越代', amount: 0, memo: '打合せにより確定' },
        { item: '仮住まい費用', amount: 0, memo: '打合せにより確定' },
        { item: '生活残材物処分費', amount: 0, memo: '打合せにより確定' },
    ],
    // D. 補助金等
    hojokin: [
        { item: 'ZEH支援事業', amount: 0, memo: '' },
        { item: '自治体補助金', amount: 0, memo: '' },
    ],
    // E. 事務手続費用
    jimuhi: [
        { item: '請負契約印紙代', amount: 12000, memo: '' },
        { item: '表示登記', amount: 0, memo: '' },
        { item: '保存登記', amount: 190000, memo: '' },
        { item: '滅失登記', amount: 0, memo: '' },
        { item: '抵当権設定変更', amount: 0, memo: '' },
        { item: '水道分担金', amount: 0, memo: '' },
        { item: '設計審査・工事検査立会費', amount: 50000, memo: '' },
        { item: 'アスファルト復旧費', amount: 0, memo: '' },
        { item: '電気線防護管費用', amount: 100000, memo: '' },
    ],
    // 資金計画
    jikoShikin: 0,
    loan: [
        { name: '', amount: 0, plan: '', rate: 0, rateAfter: 0, period: 0, monthly: 0, bonus: 0 },
        { name: '', amount: 0, plan: '', rate: 0, rateAfter: 0, period: 0, monthly: 0, bonus: 0 },
    ],
    // ランニングコスト
    running: {
        maker: '', capacity: 0, ua: 0, generation: 0,
        sellRate10: 16, sellRateAfter: 8,
        benefit30: 0, loanDeduction: 0
    },
    // スケジュール
    schedule: {
        planMeeting: '', application: '', busVisit: '', formalEstimate: '',
        contract: '', contractAmount: 0, start: '', startAmount: 0,
        framework: '', frameworkAmount: 0, complete: '', completeAmount: 0,
        delivery: '', deliveryAmount: 0
    }
};

// 資金計画データ取得
function getFundingPlan() {
    try {
        const stored = localStorage.getItem(FUNDING_PLAN_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...JSON.parse(JSON.stringify(DEFAULT_FUNDING_PLAN)), ...parsed };
        }
    } catch (e) {
        console.error('資金計画データ読み込みエラー:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_FUNDING_PLAN));
}

// 資金計画データ保存
function saveFundingPlan(data) {
    try {
        localStorage.setItem(FUNDING_PLAN_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('資金計画データ保存エラー:', e);
        return false;
    }
}

// ローン月々返済額計算（PMT関数）
function calculateMonthlyPayment(principal, annualRate, years) {
    if (!principal || !years) return 0;
    if (annualRate === 0) return Math.round(principal / (years * 12));
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)
                    / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(payment);
}

// 初期化時にDATAを設定
const DATA = getData();
