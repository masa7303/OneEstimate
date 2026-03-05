'use client'

const fmt = (n: number) => n.toLocaleString()

type OptCat = { id: string; name: string; items: { id: string; name: string; cost: number; price: number }[] }

type Props = {
  optionCategories: OptCat[]
  optionSelections: Record<string, boolean>
  setOptionSelections: (v: Record<string, boolean>) => void
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
        <p className="text-sm text-gray-500 mb-5">必要なオプションを選択してください。</p>
        <div className="space-y-5">
          {optionCategories.map(cat => (
            <div key={cat.id}>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{cat.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.items.map(item => {
                  const isSelected = !!optionSelections[item.id]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOptionSelections({ ...optionSelections, [item.id]: !isSelected })}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                        isSelected
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className={`text-xs ${isSelected ? 'text-purple-500' : 'text-gray-400'}`}>+¥{fmt(item.price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center mt-5">
          <span className="text-sm text-purple-700">オプション合計（税抜）</span>
          <span className="text-xl font-bold text-purple-700">¥{fmt(sectionCOption)}</span>
        </div>
      </div>
    </div>
  )
}
