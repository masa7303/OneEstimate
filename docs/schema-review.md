# データベース設計 確認用ドキュメント

> **読み方:** 各テーブル = Excelのシート1枚。列 = シートのヘッダー。
> 「→ ○○」は「○○テーブルの情報を参照している」という意味です。

---

## 全体マップ（テーブル一覧）

### 🏢 工務店・ユーザー系（4テーブル）

| # | テーブル名 | 日本語名 | ひとことで言うと |
|---|---|---|---|
| 1 | Company | 工務店 | アプリを使う会社。すべてのデータの親 |
| 2 | User | ユーザー | 工務店に所属する管理者・営業担当 |
| 3 | CompanyInfo | 会社情報 | 見積書に印刷する社名・住所・ロゴ等 |
| 4 | Customer | 顧客 | 工務店のお客様（見積もり対象） |

### 📦 マスターデータ系（12テーブル）

| # | テーブル名 | 日本語名 | ひとことで言うと |
|---|---|---|---|
| 5 | Series | 住宅シリーズ | スタンダード/コンフォート等の基本グレード |
| 6 | SpecLabel | 仕様項目ラベル | 「耐震等級」「断熱性能」等の項目名マスター |
| 7 | SeriesSpecValue | シリーズ仕様値 | シリーズごとの仕様値（例: スタンダードの耐震等級=等級3） |
| 8 | OptionCategory | オプションカテゴリ | キッチン、食洗器、収納等のカテゴリ |
| 9 | OptionItem | オプションアイテム | 各カテゴリ内の選択肢（グレード別の商品） |
| 10 | VariationType | 変動費タイプ | 間取り形状/屋根形状/外部空間等の分類 |
| 11 | VariationItem | 変動費アイテム | 各タイプ内の選択肢（L字型、切妻屋根等） |
| 12 | TsuboCoefficient | 坪数係数 | 坪数ごとの価格調整係数（15〜45坪） |
| 13 | AtriumPrice | 吹き抜け価格 | 吹き抜けサイズごとの追加費用 |
| 14 | RoomPriceSetting | 部屋数追加費用 | 部屋追加時の単価設定 |
| 15 | Question | アンケート質問 | ライフスタイルアンケートの質問 |
| 16 | QuestionChoice | アンケート選択肢 | 各質問の選択肢 |

### 📋 見積もり系（8テーブル）

| # | テーブル名 | 日本語名 | ひとことで言うと |
|---|---|---|---|
| 17 | Estimate | 見積もり | 見積もりのメイン情報（金額・ステータス等） |
| 18 | EstimateVariation | 変動費明細 | 見積もり時の変動費選択結果のコピー |
| 19 | EstimateOption | オプション明細 | 見積もり時のオプション選択結果のコピー |
| 20 | EstimateSectionB | 付帯工事費明細 | 見積もり時のB付帯工事費のコピー |
| 21 | EstimateSectionC | その他工事費明細 | 見積もり時のC工務店設定項目のコピー |
| 22 | EstimateSectionD | その他諸費用明細 | 見積もり時のDその他諸費用のコピー |
| 23 | EstimateAnswer | アンケート回答 | 見積もり時のアンケート回答 |
| 24 | EstimateAiResult | AI推薦結果 | AIがおすすめしたオプションの記録 |

### 💰 資金計画・設定系（3テーブル）

| # | テーブル名 | 日本語名 | ひとことで言うと |
|---|---|---|---|
| 25 | FundingPlan | 資金計画書 | 資金計画書の全入力データ |
| 26 | InitialSetting | 工務店初期設定 | B〜Fセクションのデフォルト金額 |
| 27 | FundingPlanTemplate | 資金計画書テンプレート | E/F/Gセクションのテンプレート |

---

## 各テーブルの詳細

---

### 1. Company（工務店）

**役割:** アプリに登録した工務店。すべてのデータはこの工務店に紐付く。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID（自動生成） | `clx1abc...` |
| name | 工務店名 | `株式会社山田工務店` |
| createdAt | 登録日時 | `2026-03-01 10:00` |
| updatedAt | 更新日時 | `2026-03-01 10:00` |

---

### 2. User（ユーザー）

**役割:** 工務店に所属するスタッフ。管理者か営業担当のどちらか。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx2abc...` |
| authUserId | ログインID（Supabase認証と連携） | `auth-uuid-xxx` |
| email | メールアドレス | `yamada@example.com` |
| name | 氏名 | `山田太郎` |
| role | 権限（ADMIN=管理者 / SALES=営業） | `ADMIN` |
| companyId | → Company：所属する工務店 | `clx1abc...` |

---

### 3. CompanyInfo（会社情報）

**役割:** 見積書・資金計画書のフッターに印刷する会社情報。工務店ごとに1つ。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx3abc...` |
| companyId | → Company：どの工務店の情報か | `clx1abc...` |
| name | 会社名 | `株式会社山田工務店` |
| address | 住所 | `東京都渋谷区1-1-1` |
| tel | 電話番号 | `03-1234-5678` |
| fax | FAX番号 | `03-1234-5679` |
| email | メールアドレス | `info@yamada.co.jp` |
| logoUrl | ロゴ画像のパス | `/uploads/logo.png` |
| notes | 見積書の備考テンプレート | `本見積書の有効期限は...` |

---

### 4. Customer（顧客）

**役割:** 見積もりを作成する対象のお客様。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx4abc...` |
| companyId | → Company：どの工務店の顧客か | `clx1abc...` |
| name | 氏名 | `佐藤花子` |
| nameKana | フリガナ | `サトウハナコ` |
| tel | 電話番号 | `090-1234-5678` |
| email | メールアドレス | `sato@example.com` |
| address | 住所 | `神奈川県横浜市2-2-2` |
| memo | メモ | `30代夫婦、子供2人` |

---

### 5. Series（住宅シリーズ）

**役割:** 住宅の基本グレード。価格は「原価 ÷ (1−粗利益率) = 販売価格」で自動算出。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx5abc...` |
| companyId | → Company：どの工務店のシリーズか | `clx1abc...` |
| name | シリーズ名 | `コンフォート` |
| description | 説明文 | `快適さを追求した...` |
| baseCost | 原価（30坪基準） | `16,900,000円` |
| marginRate | 粗利益率 | `0.22`（= 22%） |
| basePrice | 販売価格（30坪基準）※自動算出、手動上書き可 | `21,666,667円` |
| imageUrl | 画像パス | `/uploads/series/series-02.jpg` |
| sortOrder | 表示順 | `2` |

**計算例:** 原価16,900,000 ÷ (1−0.22) = 販売価格 21,666,667円

---

### 6. SpecLabel（仕様項目ラベル）

**役割:** シリーズに紐付ける仕様項目の「項目名」だけを管理。工務店が自由に追加・削除できる。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx6abc...` |
| companyId | → Company：どの工務店の項目か | `clx1abc...` |
| label | 項目名 | `耐震等級` |
| sortOrder | 表示順 | `1` |

---

### 7. SeriesSpecValue（シリーズ仕様値）

**役割:** 「どのシリーズの、どの項目が、どんな値か」を管理する交差テーブル。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx7abc...` |
| seriesId | → Series：どのシリーズか | `clx5abc...`（コンフォート） |
| specLabelId | → SpecLabel：どの項目か | `clx6abc...`（耐震等級） |
| value | 値 | `等級3` |

**例:** コンフォート × 耐震等級 = 等級3

---

### 8. OptionCategory（オプションカテゴリ）

**役割:** オプション設備のカテゴリ（キッチン、食洗器、収納等）。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx8abc...` |
| companyId | → Company：どの工務店のカテゴリか | `clx1abc...` |
| name | カテゴリ名 | `キッチン` |
| sortOrder | 表示順 | `1` |

---

### 9. OptionItem（オプションアイテム）

**役割:** カテゴリ内の具体的な商品。原価と販売価格差額を管理。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx9abc...` |
| categoryId | → OptionCategory：どのカテゴリの商品か | `clx8abc...`（キッチン） |
| name | 商品名 | `ハイグレードキッチン` |
| description | 説明 | `人造大理石天板、食洗器付き` |
| cost | 原価 | `500,000円` |
| price | 販売価格差額 ※原価から自動算出、手動上書き可 | `650,000円` |
| imageUrl | 画像パス | `/uploads/options/kitchen/kitchen-03.jpg` |
| sortOrder | 表示順 | `3` |

---

### 10. VariationType（変動費タイプ）

**役割:** 変動費の分類（間取り形状、屋根形状、外部空間等）。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx10abc...` |
| companyId | → Company | `clx1abc...` |
| slug | タイプ識別子 | `layout`（間取り形状） |
| name | 表示名 | `間取り形状` |
| sortOrder | 表示順 | `1` |

---

### 11. VariationItem（変動費アイテム）

**役割:** 変動費タイプ内の具体的な選択肢。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx11abc...` |
| variationTypeId | → VariationType：どのタイプか | `clx10abc...`（間取り形状） |
| name | 選択肢名 | `L字型` |
| description | 説明 | `L字型の間取り` |
| cost | 原価 | `150,000円` |
| price | 販売価格差額 | `200,000円` |
| imageUrl | 画像パス | `/uploads/variations/layout-02.jpg` |
| sortOrder | 表示順 | `2` |

---

### 12. TsuboCoefficient（坪数係数）

**役割:** 坪数ごとの価格調整係数。30坪を基準（1.000）として、坪数が変わると価格が変動。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx12abc...` |
| companyId | → Company | `clx1abc...` |
| tsubo | 坪数 | `25` |
| coefficient | 係数 | `0.880` |

**使い方:** 25坪の販売価格 = 30坪基準の販売価格 × 0.880

---

### 13. AtriumPrice（吹き抜け価格）

**役割:** 吹き抜けサイズごとの追加費用。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx13abc...` |
| companyId | → Company | `clx1abc...` |
| label | サイズ名 | `中` |
| cost | 原価 | `150,000円` |
| price | 販売価格差額 | `200,000円` |
| sortOrder | 表示順 | `2` |

---

### 14. RoomPriceSetting（部屋数追加費用）

**役割:** 部屋数が基準を超えた場合の追加費用設定。工務店ごとに1つ。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx14abc...` |
| companyId | → Company（1工務店に1つ） | `clx1abc...` |
| floor1BaseRooms | 1階の基準部屋数 | `3` |
| floor1UnitCost | 1階の追加原価（/部屋） | `70,000円` |
| floor1UnitPrice | 1階の追加販売価格差額（/部屋）※原価から自動算出、手動上書き可 | `91,000円` |
| floor2UnitCost | 2階の追加原価（/部屋） | `50,000円` |
| floor2UnitPrice | 2階の追加販売価格差額（/部屋）※同上 | `66,000円` |

**例:** 1階4部屋 → 基準3部屋を1部屋超過 → 販売価格差額 +91,000円（原価は+70,000円）

---

### 15. Question（アンケート質問）

**役割:** ライフスタイルアンケートの各質問。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx15abc...` |
| companyId | → Company | `clx1abc...` |
| title | 質問タイトル | `ご家族の構成を教えてください` |
| advice | アドバイス文 | `お子様の成長に合わせた...` |
| inputType | 入力タイプ（CHOICE=選択 / NUMBER=数値） | `CHOICE` |
| sortOrder | 表示順 | `1` |

---

### 16. QuestionChoice（アンケート選択肢）

**役割:** 各質問に対する選択肢。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx16abc...` |
| questionId | → Question：どの質問の選択肢か | `clx15abc...` |
| label | 選択肢の表示テキスト | `夫婦+子供2人` |
| value | 値（AI推薦用） | `family_4` |
| sortOrder | 表示順 | `2` |

---

### 17. Estimate（見積もり）⭐ 最重要テーブル

**役割:** 見積もりのメイン情報。金額の集計結果と状態を管理。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx17abc...` |
| companyId | → Company | `clx1abc...` |
| customerId | → Customer（見積書発行時に紐付け。発行前は空） | `clx4abc...` |
| userId | → User：作成した営業担当 | `clx2abc...` |
| estimateNumber | 見積番号（工務店ごとに連番） | `EST-20260301-001` |
| seriesId | → Series：選択したシリーズ | `clx5abc...` |
| tsubo | 坪数 | `30` |
| **--- A 基本本体価格 ---** | | |
| sectionA | A 税抜金額 | `21,666,667円` |
| sectionATax | A 消費税 | `2,166,667円` |
| **--- B 付帯工事費 ---** | | |
| sectionB | B 税抜小計 | `2,550,000円` |
| sectionBTax | B 消費税 | `255,000円` |
| **--- C オプション工事費（内訳3分割）---** | | |
| sectionCVariation | C-1 変更工事費（変動費合計） | `400,000円` |
| sectionCOption | C-2 住設オプション（差額合計） | `1,200,000円` |
| sectionCOther | C-3 その他工事費（工務店設定） | `850,000円` |
| sectionC | C 税抜小計（C-1 + C-2 + C-3） | `2,450,000円` |
| sectionCTax | C 消費税 | `245,000円` |
| **--- D その他諸費用 ---** | | |
| sectionD | D 税抜小計 | `200,000円` |
| sectionDTax | D 消費税 | `20,000円` |
| **--- 合計 ---** | | |
| totalAmount | 御見積金額（税込総額） | `29,553,334円` |
| **--- ステータス ---** | | |
| status | 状態 | `DRAFT`（作成中/提出済/成約/失注） |
| isEstimateIssued | 見積書を発行済みか | `true` |
| isFundingIssued | 資金計画書を発行済みか | `false` |

**金額の計算:**
```
totalAmount = (sectionA + sectionATax)
            + (sectionB + sectionBTax)
            + (sectionC + sectionCTax)
            + (sectionD + sectionDTax)
```

---

### 18. EstimateVariation（変動費明細）

**役割:** 見積もり作成時に選んだ変動費のコピー（スナップショット）。後からマスターが変わっても、この見積もりの金額は変わらない。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx18abc...` |
| estimateId | → Estimate：どの見積もりか | `clx17abc...` |
| itemType | 変動費タイプ | `layout`（間取り形状） |
| itemName | 選択した項目名 | `L字型` |
| cost | その時の原価 | `150,000円` |
| price | その時の販売価格差額 | `200,000円` |

---

### 19. EstimateOption（オプション明細）

**役割:** 見積もり作成時に選んだオプションのコピー（スナップショット）。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx19abc...` |
| estimateId | → Estimate | `clx17abc...` |
| categoryId | → OptionCategory | `clx8abc...`（キッチン） |
| itemId | → OptionItem | `clx9abc...`（ハイグレード） |
| cost | その時の原価 | `500,000円` |
| price | その時の販売価格差額 | `650,000円` |

---

### 20. EstimateSectionB（付帯工事費明細）

**役割:** 見積もり時のB付帯工事費のコピー。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx20abc...` |
| estimateId | → Estimate | `clx17abc...` |
| itemName | 項目名 | `屋外給排水工事` |
| amount | 金額（税抜） | `650,000円` |
| sortOrder | 表示順 | `1` |

---

### 21. EstimateSectionC（その他工事費明細）

**役割:** 見積もり時のCセクション工務店設定項目のコピー。照明工事、カーテン工事等。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx21abc...` |
| estimateId | → Estimate | `clx17abc...` |
| itemName | 項目名 | `照明工事` |
| amount | 金額（税抜） | `300,000円` |
| sortOrder | 表示順 | `1` |

---

### 22. EstimateSectionD（その他諸費用明細）

**役割:** 見積もり時のDその他諸費用のコピー。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx22abc...` |
| estimateId | → Estimate | `clx17abc...` |
| itemName | 項目名 | `地鎮祭費用` |
| amount | 金額（税抜） | `100,000円` |
| sortOrder | 表示順 | `1` |

---

### 23. EstimateAnswer（アンケート回答）

**役割:** 見積もり時のアンケート回答。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx23abc...` |
| estimateId | → Estimate | `clx17abc...` |
| questionId | → Question：どの質問か | `clx15abc...` |
| choiceValue | 選んだ回答の値 | `family_4` |

---

### 24. EstimateAiResult（AI推薦結果）

**役割:** AIがおすすめしたオプション一覧と理由。見積もりごとに1つ。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx24abc...` |
| estimateId | → Estimate（1見積もりに1つ） | `clx17abc...` |
| summary | おすすめサマリー | `省エネ重視のプランです` |
| tags | おすすめタグ | `["省エネ重視", "家事ラク"]` |
| recommendations | 推薦の詳細（カテゴリ・アイテム・理由） | `[{"categoryId":"kitchen","itemIndex":2,"reason":"..."}]` |
| totalAdditionalCost | おすすめ追加費用合計 | `1,200,000円` |

---

### 25. FundingPlan（資金計画書）

**役割:** 資金計画書の全入力データ。見積もりごとに1つ。構成が柔軟なためJSON形式で保存。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx25abc...` |
| estimateId | → Estimate（1見積もりに1つ） | `clx17abc...` |
| data | 資金計画書の全データ（JSON） | `{"sectionA":{...}, "sectionB":[...], ...}` |

---

### 26. InitialSetting（工務店初期設定）

**役割:** 工務店が最初に設定するデフォルト金額。セクションB〜Fの各項目を行で管理。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx26abc...` |
| companyId | → Company | `clx1abc...` |
| section | セクション | `B`（付帯工事費） |
| itemName | 項目名 | `屋外給排水工事` |
| defaultAmount | デフォルト金額（税抜） | `650,000円` |
| isVisible | 表示するか | `true` |
| sortOrder | 表示順 | `1` |

**登録例:**
| section | itemName | defaultAmount |
|---|---|---|
| B | 屋外給排水工事 | 650,000 |
| B | 残土処分費 | 450,000 |
| C | 照明工事 | 300,000 |
| C | カーテン工事 | 200,000 |
| D | 地鎮祭費用 | 100,000 |
| E | 登記費用 | 400,000 |
| F | 仲介手数料 | 0 |

---

### 27. FundingPlanTemplate（資金計画書テンプレート）

**役割:** 資金計画書のE/F/Gセクションのテンプレート項目。

| 列名 | 意味 | 入力例 |
|---|---|---|
| id | 識別ID | `clx27abc...` |
| companyId | → Company | `clx1abc...` |
| section | セクション | `E`（事務手数料） |
| itemName | 項目名 | `登記費用` |
| defaultAmount | デフォルト金額 | `400,000円` |
| isVisible | 表示するか | `true` |
| sortOrder | 表示順 | `1` |

---

## テーブル同士の関係（どう繋がっているか）

```
Company（工務店）
  ├── User（ユーザー）         ← 1つの工務店に複数のスタッフ
  ├── CompanyInfo（会社情報）   ← 1つの工務店に1つ
  ├── Customer（顧客）         ← 1つの工務店に複数の顧客
  │     └── Estimate（見積もり） ← 1人の顧客に複数の見積もり
  │           ├── EstimateVariation（変動費明細）
  │           ├── EstimateOption（オプション明細）
  │           ├── EstimateSectionB（付帯工事費明細）
  │           ├── EstimateSectionC（その他工事費明細）
  │           ├── EstimateSectionD（その他諸費用明細）
  │           ├── EstimateAnswer（アンケート回答）
  │           ├── EstimateAiResult（AI推薦結果）
  │           └── FundingPlan（資金計画書）
  │
  ├── Series（住宅シリーズ）
  │     └── SeriesSpecValue ← SpecLabel（仕様項目）と組み合わせ
  │
  ├── OptionCategory（オプションカテゴリ）
  │     └── OptionItem（オプションアイテム）
  │
  ├── VariationType（変動費タイプ）
  │     └── VariationItem（変動費アイテム）
  │
  ├── TsuboCoefficient（坪数係数）
  ├── AtriumPrice（吹き抜け価格）
  ├── RoomPriceSetting（部屋数追加費用）
  ├── Question（アンケート質問）
  │     └── QuestionChoice（選択肢）
  ├── InitialSetting（初期設定）
  └── FundingPlanTemplate（資金計画テンプレート）
```

---

## 「スナップショット」とは？

見積もりを作成した時点のマスターデータの**コピー**です。

**なぜ必要か：**
> 3月1日にキッチンのハイグレードが650,000円で見積もりを作った。
> 3月15日に管理者が価格を700,000円に変更した。
> → スナップショットがないと、3月1日の見積もりも700,000円に変わってしまう。
> → スナップショットがあれば、3月1日の見積もりは650,000円のまま保持される。

**スナップショットを持つテーブル:**
- EstimateVariation（変動費）
- EstimateOption（オプション）
- EstimateSectionB（付帯工事費）
- EstimateSectionC（その他工事費）
- EstimateSectionD（その他諸費用）
