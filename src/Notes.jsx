import { useState, useEffect, useRef } from 'react'
import { storageGet, storageSet } from './storage'

const NOTES_KEY = 'notes_115'

const NOTE_COLORS = [
  { c:'#fff9db', label:'黃' },
  { c:'#fff0f6', label:'粉' },
  { c:'#e8f5e9', label:'綠' },
  { c:'#e3f2fd', label:'藍' },
  { c:'#f3e5f5', label:'紫' },
  { c:'#fff3e0', label:'橘' },
  { c:'#f5f5f5', label:'灰' },
  { c:'#fce4ec', label:'玫瑰' },
]

const INIT = {
  categories: [
    { id:'cat1', label:'教務', color:'#2e6b8a' },
    { id:'cat2', label:'課務', color:'#b5451b' },
    { id:'cat3', label:'學務', color:'#4a7c59' },
  ],
  notes: [],
}

function uid() { return Math.random().toString(36).slice(2,9) }

// ── 確認彈窗 ──────────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel='確認', danger=true }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:'24px 28px', width:360, boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize:15, fontWeight:'bold', color:'#1c1c1c', marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:13, color:'#666', marginBottom:20, lineHeight:1.6 }}>{message}</div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ fontSize:12, padding:'6px 16px', border:'1px solid #ddd', borderRadius:4, background:'#fff', color:'#666', cursor:'pointer' }}>取消</button>
          <button onClick={onConfirm} style={{ fontSize:12, padding:'6px 16px', border:'none', borderRadius:4, background: danger?'#b5451b':'#2e6b8a', color:'#fff', cursor:'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── 便利貼展開彈窗 ────────────────────────────────────────────────────────────
function NoteModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note.title || '')
  const [body, setBody] = useState(note.body || '')
  const [color, setColor] = useState(note.color || '#fff9db')
  const [size, setSize] = useState(note.size || 'square')

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998 }}>
      <div style={{ background: color, borderRadius:12, padding:'24px', width: 420, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:12 }}>
        {/* 工具列 */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {/* 顏色選 */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {NOTE_COLORS.map(({ c, label }) => (
              <div key={c} onClick={() => setColor(c)} title={label}
                style={{ width:18, height:18, borderRadius:'50%', background:c, border: color===c ? '2px solid #333' : '1px solid #ccc', cursor:'pointer' }} />
            ))}
          </div>
          <div style={{ flex:1 }} />
          {/* 尺寸切換 */}
          <div style={{ display:'flex', gap:4 }}>
            {[['square','正方形'],['rect','長方形']].map(([s, l]) => (
              <button key={s} onClick={() => setSize(s)}
                style={{ fontSize:10, padding:'3px 8px', border:'1px solid #ccc', borderRadius:3, background: size===s ? '#1c1c1c' : '#fff', color: size===s ? '#fff' : '#555', cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {/* 標題 */}
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="標題（選填）"
          style={{ fontSize:14, fontWeight:'bold', border:'none', borderBottom:'1px solid rgba(0,0,0,0.15)', background:'transparent', outline:'none', padding:'4px 2px', fontFamily:'Georgia,serif', color:'#1c1c1c' }} />
        {/* 內文 */}
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="記錄工作筆記、流程、注意事項…"
          style={{ fontSize:13, border:'none', background:'rgba(0,0,0,0.04)', borderRadius:6, outline:'none', padding:'10px', fontFamily:'Georgia,serif', color:'#333', resize:'vertical', minHeight: size==='rect'?300:130, lineHeight:1.7 }} />
        {/* 按鈕 */}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ fontSize:12, padding:'6px 14px', border:'1px solid #ccc', borderRadius:4, background:'rgba(255,255,255,0.6)', color:'#666', cursor:'pointer' }}>取消</button>
          <button onClick={() => onSave({ ...note, title, body, color, size })}
            style={{ fontSize:12, padding:'6px 16px', border:'none', borderRadius:4, background:'#1c1c1c', color:'#fff', cursor:'pointer' }}>儲存</button>
        </div>
      </div>
    </div>
  )
}

// ── 便利貼卡片 ────────────────────────────────────────────────────────────────
function NoteCard({ note, index, onEdit, onDelete, onDragStart, onDragOver, onDrop }) {
  const isRect = note.size === 'rect'
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      style={{
        width: 160,
        minHeight: isRect ? 280 : 150,
        background: note.color || '#fff9db',
        borderRadius:8,
        padding:'12px 14px',
        boxShadow:'2px 3px 10px rgba(0,0,0,0.1)',
        cursor:'grab',
        position:'relative',
        display:'flex',
        flexDirection:'column',
        gap:6,
        transition:'box-shadow 0.15s',
        gridColumn: 'auto',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='4px 6px 18px rgba(0,0,0,0.18)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='2px 3px 10px rgba(0,0,0,0.1)'}
    >
      {note.title && <div style={{ fontSize:13, fontWeight:'bold', color:'#1c1c1c', lineHeight:1.3 }}>{note.title}</div>}
      <div style={{ fontSize:12, color:'#444', lineHeight:1.6, flex:1, whiteSpace:'pre-wrap', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical' }}>
        {note.body || <span style={{ color:'#aaa', fontStyle:'italic' }}>（空白便利貼）</span>}
      </div>
      {/* 操作按鈕 */}
      <div style={{ display:'flex', gap:5, justifyContent:'flex-end', marginTop:4 }}>
        <button onClick={() => onEdit(note)}
          style={{ fontSize:10, padding:'2px 8px', border:'1px solid rgba(0,0,0,0.15)', borderRadius:3, background:'rgba(255,255,255,0.6)', color:'#555', cursor:'pointer' }}>展開</button>
        <button onClick={() => onDelete(note.id)}
          style={{ fontSize:10, padding:'2px 6px', border:'1px solid rgba(0,0,0,0.1)', borderRadius:3, background:'rgba(255,255,255,0.4)', color:'#bbb', cursor:'pointer' }}>✕</button>
      </div>
    </div>
  )
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function Notes() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [addingNote, setAddingNote] = useState(null)       // catId
  const [editingCat, setEditingCat] = useState(null)       // { id, label, color }
  const [deletingCat, setDeletingCat] = useState(null)     // catId
  const [deletingNote, setDeletingNote] = useState(null)   // noteId
  const [addingCat, setAddingCat] = useState(false)
  const [newCat, setNewCat] = useState({ label:'', color:'#2e6b8a' })
  const dragFrom = useRef(null)

  const CAT_COLORS = ['#2e6b8a','#b5451b','#4a7c59','#8B5E3C','#5a3a8a','#8a3a5a','#333','#c47c1a']

  useEffect(() => {
    async function load() {
      try { const r = await storageGet(NOTES_KEY); setData(r || INIT) }
      catch { setData(INIT) }
    }
    load()
  }, [])

  async function persist(next) {
    setData(next)
    setSaving(true)
    try { await storageSet(NOTES_KEY, next); setSaved(true); setTimeout(()=>setSaved(false),1800) }
    catch(e) { console.error(e) }
    setSaving(false)
  }

  function saveNote(updated) {
    const exists = data.notes.find(n => n.id === updated.id)
    const notes = exists
      ? data.notes.map(n => n.id === updated.id ? updated : n)
      : [...data.notes, updated]
    persist({ ...data, notes })
    setEditingNote(null)
    setAddingNote(null)
  }

  function deleteNote(id) {
    persist({ ...data, notes: data.notes.filter(n => n.id !== id) })
    setDeletingNote(null)
  }

  function addCategory() {
    if (!newCat.label.trim()) return
    const cat = { id: uid(), label: newCat.label.trim(), color: newCat.color }
    persist({ ...data, categories: [...data.categories, cat] })
    setNewCat({ label:'', color:'#2e6b8a' })
    setAddingCat(false)
  }

  function updateCategory(id, updates) {
    persist({ ...data, categories: data.categories.map(c => c.id===id ? {...c,...updates} : c) })
    setEditingCat(null)
  }

  function deleteCategory(catId, withNotes) {
    const notes = withNotes ? data.notes.filter(n => n.catId !== catId) : data.notes
    const categories = data.categories.filter(c => c.id !== catId)
    persist({ ...data, categories, notes })
    setDeletingCat(null)
  }

  // 拖拉排序（同一分類內）
  function handleDragStart(catId, idx) { dragFrom.current = { catId, idx } }

  function handleDrop(catId, toIdx) {
    if (!dragFrom.current || dragFrom.current.catId !== catId) return
    const fromIdx = dragFrom.current.idx
    if (fromIdx === toIdx) return
    const catNotes = data.notes.filter(n => n.catId === catId)
    const others   = data.notes.filter(n => n.catId !== catId)
    const moved = [...catNotes]
    const [item] = moved.splice(fromIdx, 1)
    moved.splice(toIdx, 0, item)
    persist({ ...data, notes: [...others, ...moved] })
    dragFrom.current = null
  }

  if (!data) return <div style={{ padding:40, color:'#aaa', fontFamily:'Georgia,serif' }}>載入中…</div>

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 60px', fontFamily:"'Georgia','Noto Serif TC',serif" }}>
      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* 彈窗 */}
      {(editingNote || addingNote) && (
        <NoteModal
          note={editingNote || { id: uid(), catId: addingNote, title:'', body:'', color:'#fff9db', size:'square' }}
          onSave={saveNote}
          onClose={() => { setEditingNote(null); setAddingNote(null) }}
        />
      )}
      {deletingNote && (
        <ConfirmModal title="刪除便利貼" message="確定要刪除這張便利貼嗎？" danger
          onConfirm={() => deleteNote(deletingNote)}
          onCancel={() => setDeletingNote(null)} />
      )}
      {deletingCat && (
        <ConfirmModal
          title={`刪除「${data.categories.find(c=>c.id===deletingCat)?.label}」`}
          message={`這個分類下有 ${data.notes.filter(n=>n.catId===deletingCat).length} 張便利貼。\n要一起刪除所有便利貼嗎？`}
          confirmLabel="一起刪除" danger
          onConfirm={() => deleteCategory(deletingCat, true)}
          onCancel={() => setDeletingCat(null)}
        >
          <button onClick={() => deleteCategory(deletingCat, false)}
            style={{ fontSize:12, padding:'6px 14px', border:'1px solid #2e6b8a', borderRadius:4, background:'#fff', color:'#2e6b8a', cursor:'pointer', marginRight:'auto' }}>
            保留便利貼，只刪分類
          </button>
        </ConfirmModal>
      )}

      {/* 頂部存檔提示 + 新增分類按鈕 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:18, fontWeight:'bold', color:'#1c1c1c' }}>工作筆記</div>
          <div style={{ fontSize:10, color: saved?'#27ae60':saving?'#aaa':'transparent', fontFamily:'monospace' }}>
            {saving?'儲存中…':saved?'✓ 已儲存':'·'}
          </div>
        </div>
        <button onClick={() => setAddingCat(a=>!a)}
          style={{ fontSize:12, padding:'5px 14px', border:'1px solid #1c1c1c', borderRadius:4, background: addingCat?'#1c1c1c':'#fff', color: addingCat?'#fff':'#1c1c1c', cursor:'pointer' }}>
          {addingCat ? '✕ 取消' : '＋ 新增分類'}
        </button>
      </div>

      {/* 新增分類表單 */}
      {addingCat && (
        <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap', animation:'fadeIn 0.15s ease' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:10, color:'#888' }}>分類名稱 *</label>
            <input value={newCat.label} onChange={e=>setNewCat(n=>({...n,label:e.target.value}))}
              placeholder="如：教務、學務" autoFocus
              style={{ fontSize:13, padding:'5px 9px', border:'1px solid #ddd', borderRadius:4, width:140, outline:'none' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:10, color:'#888' }}>標題顏色</label>
            <div style={{ display:'flex', gap:5 }}>
              {CAT_COLORS.map(c => (
                <div key={c} onClick={() => setNewCat(n=>({...n,color:c}))}
                  style={{ width:20, height:20, borderRadius:'50%', background:c, border: newCat.color===c?'2px solid #333':'1px solid #ddd', cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <button onClick={addCategory}
            style={{ fontSize:12, padding:'6px 16px', background:'#1c1c1c', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:30 }}>新增</button>
        </div>
      )}

      {/* 各分類：三欄並排，各自垂直延伸 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20, alignItems:'start' }}>
      {data.categories.map(cat => {
        const catNotes = data.notes.filter(n => n.catId === cat.id)
        const isEditing = editingCat?.id === cat.id
        return (
          <div key={cat.id} style={{ marginBottom:0 }}>
            {/* 分類標題 */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:8, borderBottom:`2px solid ${cat.color}44` }}>
              {isEditing ? (
                <>
                  <input value={editingCat.label} onChange={e=>setEditingCat(c=>({...c,label:e.target.value}))} autoFocus
                    style={{ fontSize:17, fontWeight:'bold', border:'none', borderBottom:`2px solid ${editingCat.color}`, background:'transparent', outline:'none', color: editingCat.color, width:140, padding:'2px 4px' }} />
                  <div style={{ display:'flex', gap:4 }}>
                    {CAT_COLORS.map(c => (
                      <div key={c} onClick={() => setEditingCat(ec=>({...ec,color:c}))}
                        style={{ width:16, height:16, borderRadius:'50%', background:c, border: editingCat.color===c?'2px solid #333':'1px solid #ddd', cursor:'pointer' }} />
                    ))}
                  </div>
                  <button onClick={() => updateCategory(cat.id, { label: editingCat.label, color: editingCat.color })}
                    style={{ fontSize:11, padding:'3px 10px', background:'#1c1c1c', color:'#fff', border:'none', borderRadius:3, cursor:'pointer' }}>儲存</button>
                  <button onClick={() => setEditingCat(null)}
                    style={{ fontSize:11, padding:'3px 8px', background:'#fff', color:'#888', border:'1px solid #ddd', borderRadius:3, cursor:'pointer' }}>取消</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize:18, fontWeight:'bold', color:cat.color }}>{cat.label}</div>
                  <span style={{ fontSize:11, color:'#bbb', fontFamily:'monospace' }}>{catNotes.length} 張</span>
                  <div style={{ flex:1 }} />
                  <button onClick={() => setEditingCat({ id:cat.id, label:cat.label, color:cat.color })}
                    style={{ fontSize:10, padding:'2px 8px', border:`1px solid ${cat.color}44`, borderRadius:3, background:'#fff', color: cat.color, cursor:'pointer' }}>編輯</button>
                  <button onClick={() => setAddingNote(cat.id)}
                    style={{ fontSize:13, width:26, height:26, border:`1px solid ${cat.color}`, borderRadius:4, background:'#fff', color:cat.color, cursor:'pointer', fontWeight:'bold' }}>＋</button>
                  <button onClick={() => setDeletingCat(cat.id)}
                    style={{ fontSize:10, padding:'2px 6px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
                </>
              )}
            </div>

            {/* 便利貼格子 */}
            {catNotes.length === 0 ? (
              <div style={{ color:'#ccc', fontSize:12, fontStyle:'italic', padding:'8px 0' }}>尚無筆記，點 ＋ 新增</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {catNotes.map((note, idx) => (
                  <NoteCard key={note.id} note={note} index={idx}
                    onEdit={setEditingNote}
                    onDelete={id => setDeletingNote(id)}
                    onDragStart={i => handleDragStart(cat.id, i)}
                    onDragOver={() => {}}
                    onDrop={i => handleDrop(cat.id, i)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      </div>

      {data.categories.length === 0 && (
        <div style={{ textAlign:'center', color:'#ccc', fontSize:14, marginTop:60, fontStyle:'italic' }}>
          還沒有任何分類，點右上角「＋ 新增分類」開始建立
        </div>
      )}
    </div>
  )
}
