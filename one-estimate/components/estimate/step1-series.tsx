'use client'

/* eslint-disable @next/next/no-img-element */

type Series = { id: string; name: string; description?: string; baseCost: number; marginRate: number; basePrice: number; imageUrl?: string | null }
type TsuboCoef = { tsubo: number; coefficient: number }
type VType = { id: string; slug: string; name: string; items: VItem[] }
type VItem = { id: string; name: string; cost: number; price: number; imageUrl?: string | null }
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
      {/* シリーズ選択（カードグリッド） */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">A. 基本本体価格</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {seriesList.map(s => {
            const isSelected = s.id === seriesId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeriesId(s.id)}
                className={`rounded-xl border-2 overflow-hidden text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {s.imageUrl && (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{s.name}</p>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    ¥{fmt(s.basePrice)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* 坪数スライダー */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">坪数</label>
          <div className="flex items-center gap-2">
            <input type="range" min={15} max={45} value={tsubo} onChange={e => setTsubo(Number(e.target.value))} className="flex-1" />
            <span className="text-lg font-bold text-gray-900 w-16 text-right">{tsubo}坪</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">係数: {tsuboCoef.toFixed(3)}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm text-blue-700">基本本体価格（税抜）</span>
          <span className="text-xl font-bold text-blue-700">¥{fmt(sectionA)}</span>
        </div>
      </section>

      {/* 変動費（カードグリッド） */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-purple-700 mb-4">変動費選択</h2>
        {variationTypes.length === 0 && atriumPrices.length === 0 ? (
          <p className="text-sm text-gray-400">変動費タイプを登録してください</p>
        ) : (
          <div className="space-y-5">
            {variationTypes.map(vt => {
              const selectedItemId = variationSelections[vt.id] || ''
              return (
                <div key={vt.id}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{vt.name}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {vt.items.map(item => {
                      const isSelected = item.id === selectedItemId
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setVariationSelections({ ...variationSelections, [vt.id]: item.id })}
                          className={`rounded-lg border-2 overflow-hidden text-left transition-all ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-200 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-20 object-cover"
                            />
                          )}
                          <div className="p-2">
                            <p className={`text-xs font-medium ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{item.name}</p>
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`}>
                              {item.price === 0 ? '標準' : item.price > 0 ? `+¥${fmt(item.price)}` : `-¥${fmt(Math.abs(item.price))}`}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* 吹き抜け（そのまま） */}
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

            {/* 部屋数追加（そのまま） */}
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
