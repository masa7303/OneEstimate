'use client'

type Question = {
  id: string
  title: string
  advice: string | null
  inputType: string // CHOICE / NUMBER
  choices: { id: string; label: string; value: string }[]
}

type Props = {
  questions: Question[]
  answers: Record<string, string>
  setAnswers: (v: Record<string, string>) => void
}

export function Step2Questionnaire({ questions, answers, setAnswers }: Props) {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">アンケート質問が登録されていません。</p>
        <p className="text-sm text-gray-400 mt-1">管理画面のアンケート管理から質問を登録してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-blue-700 mb-1">アンケート</h2>
        <p className="text-sm text-gray-500 mb-5">お客様のご要望をお聞かせください。AIが最適なオプションを推薦します。</p>
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={q.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Q{qi + 1}. {q.title}
              </label>
              {q.advice && (
                <p className="text-xs text-gray-400 mb-2">{q.advice}</p>
              )}
              {q.inputType === 'NUMBER' ? (
                <input
                  type="number"
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="数値を入力"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {q.choices.map(c => {
                    const isSelected = answers[q.id] === c.value
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: c.value })}
                        className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
