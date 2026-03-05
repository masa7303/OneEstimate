'use client'

type Series = { id: string; name: string; baseCost: number; marginRate: number; basePrice: number }
type TsuboCoef = { tsubo: number; coefficient: number }
type VType = { id: string; slug: string; name: string; items: VItem[] }
type VItem = { id: string; name: string; cost: number; price: number }
type AtriumPrice = { label: string; cost: number; price: number }
type RoomSetting = { floor1BaseRooms: number; floor1UnitCost: number; floor1UnitPrice: number; floor2UnitCost: number; floor2UnitPrice: number }
type ISetting = { id: string; section: string; itemName: string; defaultAmount: number }

const fmt = (n: number) => n.toLocaleString()

type Props = {
  seriesList: Series[]
  tsuboCoefs: TsuboCoef[]
  variationTypes: VType[]
  atriumPrices: AtriumPrice[]
  roomSetting: RoomSetting | null
  initialSettings: ISetting[]
  // State
  seriesId: string
  setSeriesId: (v: string) => void
  tsubo: number
  setTsubo: (v: number) => void
  variationSelections: Record<string, string>
  setVariationSelections: (v: Record<string, string>) => void
  atriumIndex: number
  setAtriumIndex: (v: number) => void
  floor1Rooms: number
  setFloor1Rooms: (v: number) => void
  floor2Rooms: number
  setFloor2Rooms: (v: number) => void
  sectionBAmounts: Record<string, number>
  setSectionBAmounts: (v: Record<string, number>) => void
  sectionCOtherAmounts: Record<string, number>
  setSectionCOtherAmounts: (v: Record<string, number>) => void
  sectionDAmounts: Record<string, number>
  setSectionDAmounts: (v: Record<string, number>) => void
  // Calculated
  sectionA: number
  tsuboCoef: number
}

export function Step1Series(props: Props) {
  const {
    seriesList, tsuboCoefs, variationTypes, atriumPrices, roomSetting, initialSettings,
    seriesId, setSeriesId, tsubo, setTsubo,
    variationSelections, setVariationSelections,
    atriumIndex, setAtriumIndex,
    floor1Rooms, setFloor1Rooms, floor2Rooms, setFloor2Rooms,
    sectionBAmounts, setSectionBAmounts,
    sectionCOtherAmounts, setSectionCOtherAmounts,
    sectionDAmounts, setSectionDAmounts,
    sectionA, tsuboCoef,
  } = props

  const settingsB = initialSettings.filter(s => s.section === 'B')
  const settingsCOther = initialSettings.filter(s => s.section === 'C')
  const settingsD = initialSettings.filter(s => s.section === 'D')

  return (
    <div className="space-y-6">
      {/* シリーズ + 坪数 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">A. 基本本体価格</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">シリーズ</label>
            <select value={seriesId} onChange={e => setSeriesId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}（¥{fmt(s.basePrice)}）</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">坪数</label>
            <div className="flex items-center gap-2">
              <input type="range" min={15} max={45} value={tsubo} onChange={e => setTsubo(Number(e.target.value))} className="flex-1" />
              <span className="text-lg font-bold text-gray-900 w-16 text-right">{tsubo}坪</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">係数: {tsuboCoef.toFixed(3)}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm text-blue-700">基本本体価格（税抜）</span>
          <span className="text-xl font-bold text-blue-700">¥{fmt(sectionA)}</span>
        </div>
      </section>

      {/* 変動費 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-purple-700 mb-4">変動費選択</h2>
        {variationTypes.length === 0 && atriumPrices.length === 0 ? (
          <p className="text-sm text-gray-400">変動費タイプを登録してください</p>
        ) : (
          <div className="space-y-3">
            {variationTypes.map(vt => (
              <div key={vt.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-32">{vt.name}</span>
                <select
                  value={variationSelections[vt.id] || ''}
                  onChange={e => setVariationSelections({ ...variationSelections, [vt.id]: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  <option value="">変更なし</option>
                  {vt.items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}（+¥{fmt(item.price)}）</option>
                  ))}
                </select>
              </div>
            ))}
            {atriumPrices.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-32">吹き抜け</span>
                <select value={atriumIndex} onChange={e => setAtriumIndex(Number(e.target.value))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  {atriumPrices.map((a, i) => (
                    <option key={i} value={i}>{a.label}{a.price > 0 ? `（+¥${fmt(a.price)}）` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            {roomSetting && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">1階追加部屋数</span>
                  <input type="number" min={0} max={5} value={floor1Rooms}
                    onChange={e => setFloor1Rooms(parseInt(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">2階追加部屋数</span>
                  <input type="number" min={0} max={5} value={floor2Rooms}
                    onChange={e => setFloor2Rooms(parseInt(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* B: 付帯工事費 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-emerald-700 mb-4">B. 付帯工事費</h2>
        {settingsB.length === 0 ? (
          <p className="text-sm text-gray-400">初期設定で項目を追加してください</p>
        ) : (
          <div className="space-y-2">
            {settingsB.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">¥</span>
                  <input type="number" value={sectionBAmounts[s.id] ?? s.defaultAmount}
                    onChange={e => setSectionBAmounts({ ...sectionBAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                    className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* C-3: その他工事費 */}
      {settingsCOther.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-purple-700 mb-4">C-3. その他工事費</h2>
          <div className="space-y-2">
            {settingsCOther.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">¥</span>
                  <input type="number" value={sectionCOtherAmounts[s.id] ?? s.defaultAmount}
                    onChange={e => setSectionCOtherAmounts({ ...sectionCOtherAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                    className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D: その他諸費用 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-orange-700 mb-4">D. その他諸費用</h2>
        {settingsD.length === 0 ? (
          <p className="text-sm text-gray-400">初期設定で項目を追加してください</p>
        ) : (
          <div className="space-y-2">
            {settingsD.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">¥</span>
                  <input type="number" value={sectionDAmounts[s.id] ?? s.defaultAmount}
                    onChange={e => setSectionDAmounts({ ...sectionDAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                    className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
