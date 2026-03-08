'use client'

/* eslint-disable @next/next/no-img-element */

const fmt = (n: number) => n.toLocaleString()

type OptItem = { id: string; name: string; cost: number; price: number; imageUrl?: string | null }
type OptCat = { id: string; name: string; items: OptItem[] }

type Props = {
  optionCategories: OptCat[]
  optionSelections: Record<string, string>
  setOptionSelections: (v: Record<string, string>) => void
  sectionCOption: number
}

export function Step3Options({ optionCategories, optionSelections, setOptionSelections, sectionCOption }: Props) {
  if (optionCategories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">オプションカテゴリが登録されていません。</p>
        <p className="text-sm text-gray-400 mt-1">管理画面のオプション管理から登録してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-purple-700 mb-1">オプション選択</h2>
        <p className="text-sm text-gray-500 mb-5">各カテゴリから1つ選択してください。</p>
        <div className="space-y-6">
          {optionCategories.map(cat => {
            const selectedItemId = optionSelections[cat.id] || ''
            return (
              <div key={cat.id}>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{cat.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map(item => {
                    const isSelected = item.id === selectedItemId
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setOptionSelections({ ...optionSelections, [cat.id]: item.id })}
                        className={`rounded-lg border-2 overflow-hidden text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 ring-2 ring-purple-200 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-28 object-cover"
                          />
                        )}
                        <div className="p-2">
                          <p className={`text-xs font-medium leading-tight ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{item.name}</p>
                          <p className={`text-xs mt-1 font-bold ${isSelected ? 'text-purple-500' : 'text-gray-400'}`}>
                            {item.price === 0 ? '標準' : `+¥${fmt(item.price)}`}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center mt-5">
          <span className="text-sm text-purple-700">オプション合計（税抜）</span>
          <span className="text-xl font-bold text-purple-700">¥{fmt(sectionCOption)}</span>
        </div>
      </div>
    </div>
  )
}
