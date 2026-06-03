import { useState, useEffect, useRef } from 'react'
import { storageGet, storageSet } from './storage'
import { BUDGET, MONTHS, initBudgetState } from './data'
import { supabase } from './supabase'

const DB_KEY = 'worklog_115'

const DEADLINES = {
  now: [
    { date: '6/5', label: '東亞委員會', color: '#8B5E3C' },
    { date: '6/8–23', label: '院學士申請', color: '#2e6b8a' },
    { date: '6月底', label: '學程申請結果公告', color: '#666' },
  ],
  july: [
    { date: '7月中', label: '院學士錄取會議', color: '#2e6b8a' },
    { date: '7月', label: '學程課程建檔', color: '#666' },
    { date: '7月', label: '啟動導生宴調查', color: '#2e6b8a' },
  ],
  august: [
    { date: '8/3', label: '課程公告', color: '#666' },
    { date: '8/18–26', label: '初選', color: '#666' },
    { date: '8月初', label: '學程異動建檔', color: '#666' },
    { date: '8月底', label: '官網更新', color: '#666' },
  ],
  sept: [
    { date: '9/4', label: '成績可查', color: '#666' },
    { date: '9/7', label: '開學', color: '#666' },
    { date: '9/12', label: '探索學分截止', color: '#2e6b8a' },
    { date: '9/19', label: '退選截止', color: '#666' },
    { date: '9/21', label: '加選截止', color: '#666' },
    { date: '9/23', label: '停修開始', color: '#666' },
  ],
  oct: [
    { date: '10/16', label: '教務會議', color: '#666' },
    { date: '10/17', label: '校務會議', color: '#666' },
    { date: '10/26–30', label: '期中考', color: '#666' },
    { date: '10月', label: '導生宴', color: '#2e6b8a' },
    { date: '11/2', label: '輔系/跨域申請截止', color: '#666' },
  ],
  nov: [
    { date: '11/20', label: '運動會', color: '#666' },
    { date: '11/30', label: '碩博士考試申請截止', color: '#666' },
    { date: '11月', label: '東亞學程申請截止→公告', color: '#8B5E3C' },
    { date: '11月底', label: '院學士委員會議', color: '#2e6b8a' },
  ],
  dec: [
    { date: '12/11', label: '停修截止', color: '#666' },
    { date: '12/18', label: '上課結束', color: '#666' },
    { date: '12/18', label: '教務會議', color: '#666' },
    { date: '12/21–25', label: '期末考', color: '#666' },
    { date: '12/25', label: '放假', color: '#666' },
    { date: '12/28', label: '雙主修放棄截止', color: '#2e6b8a' },
    { date: '12/28', label: '寒假', color: '#666' },
  ],
  jan: [
    { date: '1/4', label: '成績公告', color: '#666' },
    { date: '1/4', label: '課程公告', color: '#666' },
    { date: '1/12–20', label: '初選', color: '#666' },
    { date: '1/31', label: '學期結束', color: '#666' },
  ],
  confirm: [],
}


function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }
function fmt(n) { return n == null ? '—' : '＄' + n.toLocaleString() }

export default function App() {
  const [sections, setSections]           = useState(null)
  const [budgetState, setBudgetState]     = useState(null)
  const [freeNote, setFreeNote]           = useState('')
  const [activeTab, setActiveTab]         = useState('work')
  const [activeMonth, setActiveMonth]     = useState(null)
  const [editingNote, setEditingNote]     = useState(null)
  const [editingBudgetNote, setEditingBudgetNote] = useState(null)
  const [saving, setSaving]               = useState(false)
  const [justSaved, setJustSaved]         = useState(false)
  const [dbStatus, setDbStatus]           = useState('loading') // 'loading' | 'ok' | 'local'
  const noteRef       = useRef(null)
  const budgetNoteRef = useRef(null)

  // ── 載入 ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const saved = await storageGet(DB_KEY)
        if (saved) {
          // 合併：用 MONTHS 為基礎，把 Supabase 裡已有的 done/note 狀態套回來
          const merged = deepClone(MONTHS).map(month => {
            const savedMonth = (saved.sections || []).find(m => m.id === month.id)
            if (!savedMonth) return month
            return {
              ...month,
              items: month.items.map(item => {
                const savedItem = savedMonth.items.find(i => i.id === item.id)
                if (!savedItem) return item // 新增的事項，用預設值
                return { ...item, done: savedItem.done, note: savedItem.note }
              })
            }
          })
          setSections(merged)

          // 預算：同樣合併，保留已輸入的 actual/note
          const freshBudget = initBudgetState()
          const mergedBudget = {}
          Object.keys(freshBudget).forEach(cat => {
            mergedBudget[cat] = freshBudget[cat].map(item => {
              const savedItem = (saved.budget?.[cat] || []).find(i => i.id === item.id)
              if (!savedItem) return item
              return { ...item, actual: savedItem.actual, note: savedItem.note }
            })
          })
          setBudgetState(mergedBudget)
          setFreeNote(saved.freeNote || '')
        } else {
          setSections(deepClone(MONTHS))
          setBudgetState(initBudgetState())
        }
        // 判斷是 Supabase 還是 localStorage
        setDbStatus(supabase ? 'ok' : 'local')
      } catch (e) {
        console.error(e)
        setSections(deepClone(MONTHS))
        setBudgetState(initBudgetState())
        setDbStatus('local')
      }
    }
    load()
  }, [])

  useEffect(() => { if (editingNote      && noteRef.current)       noteRef.current.focus()       }, [editingNote])
  useEffect(() => { if (editingBudgetNote && budgetNoteRef.current) budgetNoteRef.current.focus() }, [editingBudgetNote])

  // ── 存檔 ────────────────────────────────────────────────────────────────────
  async function persist(sec, bud, fn) {
    setSaving(true)
    try {
      await storageSet(DB_KEY, { sections: sec, budget: bud, freeNote: fn, updatedAt: new Date().toISOString() })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1800)
    } catch(e) { console.error('存檔失敗', e) }
    setSaving(false)
  }

  // ── 工作事項操作 ─────────────────────────────────────────────────────────────
  function toggleDone(monthId, itemId) {
    const next = deepClone(sections)
    const item = next.find(m => m.id === monthId).items.find(i => i.id === itemId)
    item.done = !item.done
    setSections(next)
    persist(next, budgetState, freeNote)
  }

  function updateNote(monthId, itemId, val) {
    const next = deepClone(sections)
    next.find(m => m.id === monthId).items.find(i => i.id === itemId).note = val
    setSections(next)
  }

  function commitNote() {
    setEditingNote(null)
    persist(sections, budgetState, freeNote)
  }

  // ── 預算操作 ─────────────────────────────────────────────────────────────────
  function updateActual(cat, itemId, val) {
    const next = deepClone(budgetState)
    next[cat].find(i => i.id === itemId).actual = val === '' ? null : Number(val.replace(/[^0-9]/g, ''))
    setBudgetState(next)
    persist(sections, next, freeNote)
  }

  function updateBudgetNote(cat, itemId, val) {
    const next = deepClone(budgetState)
    next[cat].find(i => i.id === itemId).note = val
    setBudgetState(next)
  }

  function commitBudgetNote() {
    setEditingBudgetNote(null)
    persist(sections, budgetState, freeNote)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!sections || !budgetState) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Georgia,serif', color:'#888', fontSize:14 }}>
        載入中…
      </div>
    )
  }

  // ── 計算 ─────────────────────────────────────────────────────────────────────
  const totalItems = sections.reduce((a, m) => a + m.items.length, 0)
  const totalDone  = sections.reduce((a, m) => a + m.items.filter(i => i.done).length, 0)
  const activeData     = activeMonth ? sections.find(m => m.id === activeMonth) : null
  const activeOriginal = activeMonth ? MONTHS.find(m => m.id === activeMonth)   : null

  const budgetTotals = Object.entries(BUDGET).map(([cat, cfg]) => {
    const stateItems = budgetState[cat]
    const spent = stateItems.reduce((a, i) => a + (i.actual || 0), 0)
    const est   = cfg.items.reduce((a, i) => a + i.est, 0)
    return { cat, total: cfg.total, spent, est, remain: cfg.total - spent }
  })
  const grandTotal = budgetTotals.reduce((a, b) => a + b.total, 0)
  const grandSpent = budgetTotals.reduce((a, b) => a + b.spent, 0)

  const statusColor = justSaved ? '#7dba7d' : saving ? '#aaa' : dbStatus === 'local' ? '#c47c1a' : '#555'
  const statusText  = saving ? '儲存中…' : justSaved ? '✓ 已儲存' : dbStatus === 'local' ? '本地暫存（未連 Supabase）' : '自動存檔'

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', flexDirection:'column', background:'#f2ede6', fontFamily:"'Georgia','Noto Serif TC',serif", overflow:'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }
        .note-card:hover { box-shadow: 3px 6px 16px rgba(0,0,0,0.15) !important; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#d0cbc4; border-radius:3px; }
      `}</style>

      {/* ── Topbar ── */}
      <div style={{ background:'#1c1c1c', color:'#f2ede6', padding:'16px 28px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.2em', color:'#888', fontFamily:'monospace', marginBottom:2 }}>115學年度 · 社科院</div>
            <div style={{ fontSize:17, letterSpacing:'0.03em' }}>院學士 × 學分學程 工作紀錄</div>
          </div>
          <div style={{ textAlign:'right' }}>
            {activeTab === 'work'
              ? <div style={{ fontFamily:'monospace', fontSize:20 }}>{totalDone}<span style={{color:'#555',fontSize:14}}>/{totalItems}</span> <span style={{fontSize:11,color:'#666'}}>完成</span></div>
              : <div style={{ fontFamily:'monospace', fontSize:14, color:'#888' }}>支出 {fmt(grandSpent)} <span style={{color:'#555'}}>/ {fmt(grandTotal)}</span></div>
            }
            <div style={{ fontSize:10, color: statusColor, fontFamily:'monospace', marginTop:2 }}>{statusText}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {[['work','工作時程'],['budget','預算控管']].map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key); setActiveMonth(null) }}
              style={{ padding:'6px 18px', fontSize:12, fontFamily:'Georgia,serif', background: activeTab===key ? '#f2ede6' : 'transparent', color: activeTab===key ? '#1c1c1c' : '#888', border:'1px solid', borderColor: activeTab===key ? '#f2ede6' : '#444', borderRadius:'4px 4px 0 0', cursor:'pointer', letterSpacing:'0.04em' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════ 工作時程 ════════════════ */}
      {activeTab === 'work' && (
        <div style={{ display:'flex', flex:1, minHeight:0 }}>
          {/* 左欄便條紙 */}
          <div style={{ width:160, flexShrink:0, overflowY:'auto', padding:'20px 12px 20px 16px', display:'flex', flexDirection:'column', gap:12, borderRight:'1px solid #e0dbd4', background:'#ece8e1' }}>
            {sections.map((month, idx) => {
              const orig = MONTHS[idx]
              const done = month.items.filter(i => i.done).length
              const total = month.items.length
              const isActive = activeMonth === month.id
              return (
                <button key={month.id} className="note-card" onClick={() => setActiveMonth(isActive ? null : month.id)}
                  style={{ width:'100%', background: isActive ? orig.color : '#fff', color: isActive ? '#fff' : '#1c1c1c', border:`2px solid ${orig.color}`, borderRadius:6, padding:'12px 10px 10px', cursor:'pointer', textAlign:'left', position:'relative', boxShadow: isActive ? `0 4px 14px ${orig.color}55` : '2px 3px 8px rgba(0,0,0,0.09)', transition:'all 0.18s ease', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ position:'absolute', top:7, right:10, width:8, height:8, borderRadius:'50%', background: isActive ? 'rgba(255,255,255,0.5)' : orig.color, opacity:0.8 }} />
                  <div>
                    <div style={{ fontSize:18, fontWeight:'bold', lineHeight:1 }}>{orig.label}</div>
                    {orig.sub && <div style={{ fontSize:10, opacity:0.6, marginTop:2, letterSpacing:'0.06em' }}>{orig.sub}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:10, opacity:0.55, marginBottom:5, fontFamily:'monospace' }}>{done}/{total}</div>
                    <div style={{ height:2, background: isActive ? 'rgba(255,255,255,0.25)' : '#eee', borderRadius:1 }}>
                      <div style={{ height:'100%', width:`${total ? done/total*100 : 0}%`, background: isActive ? '#fff' : orig.color, borderRadius:1, opacity: isActive ? 0.9 : 0.55, transition:'width 0.3s' }} />
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:6 }}>
                      {month.items.map(item => (
                        <div key={item.id} style={{ width:7, height:7, borderRadius:'50%', background: item.done ? (isActive ? '#fff' : orig.color) : (isActive ? 'rgba(255,255,255,0.25)' : '#ddd'), transition:'background 0.2s' }} />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 右欄內容 */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 40px' }}>
            {activeData && activeOriginal ? (
              <div style={{ animation:'fadeIn 0.18s ease' }}>
                {/* 標題 */}
                <div style={{ background:activeOriginal.color, color:'#fff', borderRadius:'10px 10px 0 0', padding:'18px 24px 14px', display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:10, letterSpacing:'0.18em', opacity:0.75, fontFamily:'monospace', marginBottom:3 }}>{activeOriginal.sub || '工作事項'}</div>
                    <div style={{ fontSize:24, fontWeight:'bold' }}>{activeOriginal.label}</div>
                  </div>
                  <div style={{ fontFamily:'monospace', fontSize:12, opacity:0.85 }}>{activeData.items.filter(i=>i.done).length} / {activeData.items.length} 完成</div>
                </div>
                {/* Deadline 標籤列 */}
                {DEADLINES[activeMonth] && DEADLINES[activeMonth].length > 0 && (
                  <div style={{ background:`${activeOriginal.color}18`, borderLeft:`3px solid ${activeOriginal.color}`, padding:'8px 22px', display:'flex', flexWrap:'wrap', gap:'6px 16px', alignItems:'center' }}>
                    {DEADLINES[activeMonth].map((d, i) => (
                      <span key={i} style={{ fontSize:11.5, lineHeight:1.4, whiteSpace:'nowrap' }}>
                        <span style={{ color: d.color, fontWeight:'bold', fontFamily:'monospace' }}>{d.date}</span>
                        <span style={{ color:'#1c1c1c', marginLeft:3 }}>{d.label}</span>
                      </span>
                    ))}
                  </div>
                )}
                {/* 項目 */}
                <div style={{ background:'#fff', borderRadius:'0 0 10px 10px', border:`1px solid ${activeOriginal.color}44`, borderTop:'none' }}>
                  {activeData.items.map((item, idx) => {
                    const isEd = editingNote?.monthId === activeMonth && editingNote?.itemId === item.id
                    return (
                      <div key={item.id} style={{ padding:'16px 22px', borderBottom: idx < activeData.items.length-1 ? '1px solid #f0ede8' : 'none', background: item.done ? '#fafaf8' : '#fff', borderRadius: idx === activeData.items.length-1 ? '0 0 10px 10px' : 0 }}>
                        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                          <button onClick={() => toggleDone(activeMonth, item.id)} style={{ width:20, height:20, borderRadius:4, flexShrink:0, marginTop:3, border: item.done ? 'none' : `2px solid ${activeOriginal.color}77`, background: item.done ? activeOriginal.color : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                            {item.done && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:'bold', lineHeight:1.4, color: item.done ? '#bbb' : '#1c1c1c', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</div>
                            <div style={{ marginTop:5, fontSize:12.5, lineHeight:1.7, color: item.done ? '#ccc' : '#666' }}>{item.desc}</div>
                            {isEd ? (
                              <div style={{ marginTop:9 }}>
                                <textarea ref={noteRef} value={item.note} onChange={e => updateNote(activeMonth, item.id, e.target.value)} placeholder="記錄進度、聯絡結果、注意事項…" style={{ width:'100%', minHeight:68, border:`1px solid ${activeOriginal.color}66`, borderRadius:5, padding:'7px 10px', fontSize:12.5, fontFamily:'Georgia,serif', color:'#333', resize:'vertical', background:'#fdfcfa', boxSizing:'border-box', outline:'none', lineHeight:1.5 }} />
                                <button onMouseDown={e => { e.preventDefault(); commitNote() }} style={{ marginTop:4, fontSize:11.5, padding:'4px 13px', background:activeOriginal.color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}>儲存備註</button>
                              </div>
                            ) : (
                              <div onClick={() => setEditingNote({ monthId: activeMonth, itemId: item.id })} style={{ marginTop:7, padding:'5px 10px', background: item.note ? activeOriginal.accent : '#f7f5f0', borderRadius:4, cursor:'text', fontSize:11.5, lineHeight:1.55, color: item.note ? '#444' : '#bbb', fontStyle: item.note ? 'normal' : 'italic', borderLeft: item.note ? `3px solid ${activeOriginal.color}88` : '3px solid transparent', transition:'all 0.15s', whiteSpace:'pre-wrap' }}>
                                {item.note || '＋ 點此新增工作備註'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* 下個月提醒 */}
                {activeOriginal.nextHint && (
                  <div style={{ marginTop:14, padding:'12px 16px', background:'#f7f5f0', borderRadius:8, borderLeft:`3px solid ${activeOriginal.color}`, fontSize:12, lineHeight:1.65, color:'#666' }}>
                    <span style={{ fontWeight:'bold', color:activeOriginal.color, marginRight:6 }}>下個月要準備→</span>{activeOriginal.nextHint}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60%', color:'#bbb', gap:10 }}>
                <div style={{ fontSize:32 }}>←</div>
                <div style={{ fontSize:13, letterSpacing:'0.06em' }}>選擇左側月份查看工作事項</div>
              </div>
            )}
            {/* 其他備忘 */}
            <div style={{ marginTop:20, background:'#fff', borderRadius:10, border:'1px solid #e0dbd4', overflow:'hidden' }}>
              <div style={{ padding:'13px 22px 10px', borderBottom:'1px solid #f0ede8' }}>
                <div style={{ fontSize:12, fontWeight:'bold', color:'#888', letterSpacing:'0.06em' }}>其他備忘</div>
              </div>
              <div style={{ padding:'10px 22px 18px' }}>
                <textarea value={freeNote} onChange={e => setFreeNote(e.target.value)} onBlur={e => persist(sections, budgetState, e.target.value)} placeholder="隨時記錄其他事項、追蹤中的對話、想法…" style={{ width:'100%', minHeight:90, border:'1px solid #e0dbd4', borderRadius:6, padding:'9px 11px', fontSize:13, fontFamily:'Georgia,serif', color:'#333', resize:'vertical', background:'#fdfcfa', boxSizing:'border-box', outline:'none', lineHeight:1.6 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ 預算控管 ════════════════ */}
      {activeTab === 'budget' && (
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px 60px' }}>
          {/* 總覽 */}
          <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:160, background:'#1c1c1c', color:'#f2ede6', borderRadius:10, padding:'18px 20px' }}>
              <div style={{ fontSize:10, letterSpacing:'0.15em', color:'#888', fontFamily:'monospace', marginBottom:6 }}>年度總額</div>
              <div style={{ fontSize:24, fontFamily:'monospace', fontWeight:'bold' }}>{fmt(grandTotal)}</div>
              <div style={{ marginTop:10, height:3, background:'#333', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${grandTotal ? grandSpent/grandTotal*100 : 0}%`, background:'#f2ede6', borderRadius:2, transition:'width 0.4s' }} />
              </div>
              <div style={{ fontSize:11, color:'#888', marginTop:6, fontFamily:'monospace' }}>已支出 {fmt(grandSpent)} · 剩餘 {fmt(grandTotal-grandSpent)}</div>
            </div>
            {budgetTotals.map(({ cat, total, spent, remain }) => {
              const cfg = BUDGET[cat]
              return (
                <div key={cat} style={{ flex:1, minWidth:140, background:'#fff', border:`2px solid ${cfg.color}`, borderRadius:10, padding:'18px 20px' }}>
                  <div style={{ fontSize:10, letterSpacing:'0.12em', color:cfg.color, fontFamily:'monospace', marginBottom:6 }}>{cat}</div>
                  <div style={{ fontSize:20, fontFamily:'monospace', fontWeight:'bold', color:'#1c1c1c' }}>{fmt(total)}</div>
                  <div style={{ marginTop:10, height:3, background:'#eee', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${total ? spent/total*100 : 0}%`, background:cfg.color, borderRadius:2, opacity:0.7, transition:'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize:11, color:'#999', marginTop:6, fontFamily:'monospace' }}>支出 {fmt(spent)} · 餘 {fmt(remain)}</div>
                </div>
              )
            })}
          </div>

          {/* 各類別明細 */}
          {Object.entries(BUDGET).map(([cat, cfg]) => {
            const stateItems = budgetState[cat]
            const spent = stateItems.reduce((a, i) => a + (i.actual || 0), 0)
            const est   = cfg.items.reduce((a, i) => a + i.est, 0)
            return (
              <div key={cat} style={{ background:'#fff', borderRadius:10, border:`1px solid ${cfg.color}44`, marginBottom:16, overflow:'hidden' }}>
                <div style={{ background:cfg.color, padding:'14px 24px 12px', display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:'bold', color:'#fff' }}>{cat}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:3 }}>{cfg.desc}</div>
                  </div>
                  <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'rgba(255,255,255,0.85)' }}>
                    <div>總額 {fmt(cfg.total)}</div>
                    <div style={{ fontSize:10, opacity:0.7 }}>估計 {fmt(est)} · 實際 {fmt(spent)}</div>
                  </div>
                </div>
                <div style={{ padding:'12px 24px', background:cfg.accent, borderBottom:`1px solid ${cfg.color}22`, fontSize:12, lineHeight:1.65, color:'#444' }}>
                  <span style={{ fontWeight:'bold', color:cfg.color }}>策略建議　</span>{cfg.strategy}
                </div>
                {cfg.items.map((origItem, idx) => {
                  const si = stateItems.find(i => i.id === origItem.id)
                  const isStrategy = origItem.label.startsWith('【策略】') || origItem.label.startsWith('【待確認】')
                  const isEd = editingBudgetNote?.cat === cat && editingBudgetNote?.id === origItem.id
                  const noteVal = si.note !== undefined ? si.note : origItem.note
                  return (
                    <div key={origItem.id} style={{ padding:'14px 24px', borderBottom: idx < cfg.items.length-1 ? '1px solid #f5f2ee' : 'none', background: isStrategy ? `${cfg.accent}88` : '#fff', display:'flex', gap:16, alignItems:'flex-start' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                          <span style={{ fontSize:14, fontWeight:'bold', color: isStrategy ? cfg.color : '#1c1c1c' }}>{origItem.label}</span>
                          {isStrategy && <span style={{ fontSize:10, background:cfg.color, color:'#fff', padding:'1px 6px', borderRadius:3 }}>待院長確認</span>}
                        </div>
                        <div style={{ fontSize:12, color:'#888', marginTop:3, lineHeight:1.5 }}>{noteVal || origItem.note}</div>
                        {isEd ? (
                          <div style={{ marginTop:8 }}>
                            <textarea ref={budgetNoteRef} value={noteVal} onChange={e => updateBudgetNote(cat, origItem.id, e.target.value)} placeholder="備註說明…" style={{ width:'100%', minHeight:60, border:`1px solid ${cfg.color}66`, borderRadius:5, padding:'7px 10px', fontSize:12, fontFamily:'Georgia,serif', resize:'vertical', background:'#fdfcfa', boxSizing:'border-box', outline:'none', lineHeight:1.5 }} />
                            <button onMouseDown={e => { e.preventDefault(); commitBudgetNote() }} style={{ marginTop:4, fontSize:11, padding:'4px 12px', background:cfg.color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}>儲存</button>
                          </div>
                        ) : (
                          <div onClick={() => setEditingBudgetNote({ cat, id: origItem.id })} style={{ marginTop:6, fontSize:11, color: si.note ? '#555' : '#ccc', fontStyle: si.note ? 'normal' : 'italic', cursor:'text', whiteSpace:'pre-wrap' }}>
                            {si.note || '＋ 新增備註'}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink:0, textAlign:'right', minWidth:140 }}>
                        <div style={{ fontSize:11, color:'#bbb', fontFamily:'monospace', marginBottom:4 }}>估計 {fmt(origItem.est)}</div>
                        <input type="text" value={si.actual == null ? '' : si.actual} onChange={e => updateActual(cat, origItem.id, e.target.value)} placeholder="實際金額"
                          style={{ width:120, padding:'6px 10px', fontSize:13, fontFamily:'monospace', border:`1px solid ${si.actual != null ? cfg.color : '#ddd'}`, borderRadius:5, textAlign:'right', outline:'none', background: si.actual != null ? cfg.accent : '#fafaf8', color:'#1c1c1c', boxSizing:'border-box' }} />
                        {si.actual != null && (
                          <div style={{ fontSize:10, fontFamily:'monospace', color: si.actual > origItem.est ? '#c0392b' : '#27ae60', marginTop:3 }}>
                            {si.actual > origItem.est ? '▲ 超估' : '▼ 省'} {fmt(Math.abs(si.actual - origItem.est))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div style={{ padding:'10px 24px', background:'#f9f7f4', display:'flex', justifyContent:'flex-end', gap:24, fontSize:12, fontFamily:'monospace', color:'#888', borderTop:`1px solid ${cfg.color}22` }}>
                  <span>估計合計 {fmt(est)}</span>
                  <span style={{ color:cfg.color, fontWeight:'bold' }}>實際已支出 {fmt(spent)}</span>
                  <span>預算餘額 {fmt(cfg.total - spent)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
