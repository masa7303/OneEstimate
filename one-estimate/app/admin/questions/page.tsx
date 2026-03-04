'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Choice = { id?: string; label: string; value: string }
type Question = {
  id: string
  title: string
  advice: string | null
  inputType: string
  choices: Choice[]
}

export default function QuestionsPage() {
  const [list, setList] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)

  // フォーム
  const [formTitle, setFormTitle] = useState('')
  const [formAdvice, setFormAdvice] = useState('')
  const [formType, setFormType] = useState('CHOICE')
  const [formChoices, setFormChoices] = useState<{ label: string; value: string }[]>([])
  const [showNew, setShowNew] = useState(false)

  const fetchList = () => {
    fetch('/api/admin/questions')
      .then(res => res.json())
      .then(data => { setList(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const resetForm = () => {
    setFormTitle(''); setFormAdvice(''); setFormType('CHOICE'); setFormChoices([])
    setEditId(null); setShowNew(false)
  }

  const startEdit = (q: Question) => {
    setEditId(q.id)
    setFormTitle(q.title)
    setFormAdvice(q.advice || '')
    setFormType(q.inputType)
    setFormChoices(q.choices.map(c => ({ label: c.label, value: c.value })))
    setShowNew(true)
  }

  const addChoice = () => setFormChoices([...formChoices, { label: '', value: '' }])
  const removeChoice = (i: number) => setFormChoices(formChoices.filter((_, idx) => idx !== i))
  const updateChoice = (i: number, field: 'label' | 'value', val: string) => {
    const next = [...formChoices]
    next[i] = { ...next[i], [field]: val }
    if (field === 'label' && next[i].value === '') next[i].value = val
    setFormChoices(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    const body = { title: formTitle, advice: formAdvice, inputType: formType, choices: formChoices.filter(c => c.label) }

    if (editId) {
      await fetch(`/api/admin/questions/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/admin/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    resetForm()
    fetchList()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    fetchList()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">アンケート管理</h1>
        {!showNew && <Button onClick={() => { resetForm(); setShowNew(true) }}>質問追加</Button>}
      </div>

      {showNew && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">質問文 *</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 家事のしやすさは重視しますか？" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">アドバイス文</label>
            <textarea value={formAdvice} onChange={e => setFormAdvice(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 家事動線を重視すると快適な暮らしに繋がります" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入力タイプ</label>
            <select value={formType} onChange={e => setFormType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CHOICE">選択式</option>
              <option value="NUMBER">数値入力</option>
            </select>
          </div>

          {formType === 'CHOICE' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">選択肢</label>
                <Button type="button" variant="outline" size="sm" onClick={addChoice}>+ 追加</Button>
              </div>
              {formChoices.length === 0 && (
                <p className="text-sm text-gray-400">選択肢を追加してください</p>
              )}
              <div className="space-y-2">
                {formChoices.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" value={c.label} onChange={e => updateChoice(i, 'label', e.target.value)}
                      placeholder="ラベル" className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                    <input type="text" value={c.value} onChange={e => updateChoice(i, 'value', e.target.value)}
                      placeholder="値" className="w-32 border border-gray-300 rounded px-2 py-1 text-sm" />
                    <button type="button" onClick={() => removeChoice(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">{editId ? '更新' : '作成'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>キャンセル</Button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          質問がまだ登録されていません
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Q{i + 1}</span>
                    <span className="font-medium text-gray-900">{q.title}</span>
                    <span className="text-xs text-gray-400">{q.inputType === 'CHOICE' ? '選択式' : '数値'}</span>
                  </div>
                  {q.advice && <p className="text-xs text-gray-500 mt-1 ml-8">{q.advice}</p>}
                  {q.choices.length > 0 && (
                    <div className="flex gap-1.5 mt-2 ml-8 flex-wrap">
                      {q.choices.map((c, ci) => (
                        <span key={ci} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c.label}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => startEdit(q)}>編集</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(q.id, q.title)}>削除</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
