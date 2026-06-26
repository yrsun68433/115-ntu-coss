import { useState, useEffect } from 'react'
import { storageGet, storageSet } from './storage'

const CONTACTS_KEY = 'contacts_115'

// ── 靜態初始資料 ──────────────────────────────────────────────────────────────
const INIT = {
  collegeCommittee: [
    { id:'cc1', name:'洪貞玲', note:'召集人（副院長）', email:'clhung@ntu.edu.tw' },
    { id:'cc2', name:'黃景沂', note:'', email:'chingihuang@ntu.edu.tw' },
    { id:'cc3', name:'陳昱志', note:'', email:'ycrchen@ntu.edu.tw' },
    { id:'cc4', name:'蔡宜展', note:'', email:'yichantsai@ntu.edu.tw' },
    { id:'cc5', name:'黃凱苹', note:'', email:'kaipinghuang@ntu.edu.tw' },
    { id:'cc6', name:'賴建宇', note:'', email:'cyljason@ntu.edu.tw' },
    { id:'cc7', name:'洪晨碩', note:'', email:'cshong@ntu.edu.tw' },
  ],
  mentors: [
    { id:'m1', name:'王道一', note:'113學年度導師', email:'josephw@ntu.edu.tw' },
    { id:'m2', name:'張登及', note:'114學年度導師', email:'tchang@ntu.edu.tw' },
  ],
  eastAsia: [
    { id:'ea1', name:'周嘉辰', note:'召集人', email:'chelseachou@ntu.edu.tw' },
    { id:'ea2', name:'蔡蕙如', note:'', email:'tsaihuiju@ntu.edu.tw' },
    { id:'ea3', name:'謝宛蓉', note:'', email:'wanjungh@ntu.edu.tw' },
    { id:'ea4', name:'賴建宇', note:'', email:'cyljason@ntu.edu.tw' },
    { id:'ea5', name:'李宥霆', note:'', email:'ytandylee@ntu.edu.tw' },
    { id:'ea6', name:'左正東', note:'', email:'ctso@ntu.edu.tw' },
    { id:'ea7', name:'王宏文', note:'', email:'hongwung@ntu.edu.tw' },
    { id:'ea8', name:'何明修', note:'', email:'msho@ntu.edu.tw' },
  ],
  china: [
    { id:'ch1', name:'蔡季廷', note:'召集人', email:'chiting@ntu.edu.tw' },
    { id:'ch2', name:'徐斯勤', note:'', email:'schsu01@ntu.edu.tw' },
  ],
  students113: [
    { id:'B12302252', name:'黃琦雯', dept:'政治系國關組', grade:3, left:false, leftReason:'' },
    { id:'B12302259', name:'鄭沁哲', dept:'政治系國關組', grade:3, left:false, leftReason:'' },
    { id:'B12302350', name:'詹明翰', dept:'政治系公行組', grade:3, left:false, leftReason:'' },
    { id:'B11302212', name:'蔡佑澤', dept:'經濟系', grade:4, left:false, leftReason:'' },
    { id:'B11303023', name:'吳瑞家', dept:'經濟系', grade:4, left:false, leftReason:'' },
    { id:'B11303039', name:'陳彥廷', dept:'經濟系', grade:4, left:false, leftReason:'' },
    { id:'B11303042', name:'黃沛綺', dept:'經濟系', grade:4, left:false, leftReason:'' },
    { id:'B12303002', name:'郭秉豐', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12303054', name:'袁承亨', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12303136', name:'彭晨紘', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12305017', name:'呂政陽', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12305039', name:'余承熹', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12305049', name:'陳亮勳', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12310049', name:'游佩軒', dept:'社工系', grade:3, left:false, leftReason:'' },
    { id:'B11302337', name:'吳家杏', dept:'政治系公行組', grade:4, left:true, leftReason:'放棄（114-1）' },
    { id:'B11302353', name:'盧子琳', dept:'政治系公行組', grade:4, left:true, leftReason:'放棄（114-1）' },
    { id:'B11303063', name:'鄭學澤', dept:'經濟系', grade:4, left:true, leftReason:'放棄（114-1）' },
    { id:'B11310013', name:'胡傑凱', dept:'社會系', grade:4, left:true, leftReason:'畢業（114，首屆）' },
  ],
  students114: [
    { id:'B13302107', name:'孫珮珈', dept:'政治系政論組', grade:2, left:false, leftReason:'' },
    { id:'B12302144', name:'黃彩慈', dept:'政治系政論組', grade:3, left:false, leftReason:'' },
    { id:'B13302230', name:'金柔旼', dept:'政治系國關組', grade:2, left:false, leftReason:'' },
    { id:'B12302152', name:'蕭博仁', dept:'政治系國關組', grade:3, left:false, leftReason:'' },
    { id:'B13302308', name:'蔡佳芸', dept:'政治系公行組', grade:2, left:false, leftReason:'' },
    { id:'B13302342', name:'褚芳妘', dept:'政治系公行組', grade:2, left:false, leftReason:'' },
    { id:'B12302314', name:'陳麗庭', dept:'政治系公行組', grade:3, left:false, leftReason:'' },
    { id:'B13303035', name:'朱皓瑋', dept:'經濟系', grade:2, left:false, leftReason:'' },
    { id:'B13303056', name:'黃冠予', dept:'經濟系', grade:2, left:false, leftReason:'' },
    { id:'B13303057', name:'蔡睿燊', dept:'經濟系', grade:2, left:false, leftReason:'' },
    { id:'B13303062', name:'林天麗', dept:'經濟系', grade:2, left:false, leftReason:'' },
    { id:'B13303153', name:'詹舒宇', dept:'經濟系', grade:2, left:false, leftReason:'' },
    { id:'B12302147', name:'詹怡安', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12303010', name:'林宜萱', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12303122', name:'林冠廷', dept:'經濟系', grade:3, left:false, leftReason:'' },
    { id:'B12305003', name:'高唯琮', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12305019', name:'李芸熏', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12305025', name:'張佳瑩', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B12305040', name:'吳士宏', dept:'社會系', grade:3, left:false, leftReason:'' },
    { id:'B11305035', name:'吳秉霖', dept:'社會系', grade:4, left:false, leftReason:'' },
    { id:'B11310045', name:'林芷妤', dept:'社工系', grade:4, left:false, leftReason:'' },
    { id:'B12702083', name:'徐苡茜', dept:'會計系', grade:3, left:false, leftReason:'' },
    { id:'B12702097', name:'陳彥蓁', dept:'會計系', grade:3, left:false, leftReason:'' },
    { id:'B11302211', name:'吳和華', dept:'會計系', grade:4, left:false, leftReason:'' },
    { id:'B12703015', name:'楊政諺', dept:'財金系', grade:3, left:false, leftReason:'' },
    { id:'B12801022', name:'賴禾凱', dept:'公衛系', grade:3, left:false, leftReason:'' },
    { id:'B13302332', name:'張芷瑜', dept:'政治系公行組', grade:2, left:true, leftReason:'放棄（114-2）' },
    { id:'B11305043', name:'陳孝祤', dept:'社會系', grade:4, left:true, leftReason:'放棄（114-2）' },
    { id:'B11H04006', name:'李　蕎', dept:'運動學士學程', grade:4, left:true, leftReason:'放棄（已轉入政治系）' },
  ],
}

function uid() { return Math.random().toString(36).slice(2,8) }

// ── 小元件 ────────────────────────────────────────────────────────────────────
function CopyBtn({ emails, color }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(emails.join('; ')); setOk(true); setTimeout(()=>setOk(false),2000) }}
      style={{ fontSize:11, padding:'4px 12px', border:'none', borderRadius:4, cursor:'pointer', flexShrink:0, background: ok?'#27ae60':color, color:'#fff', transition:'background 0.2s' }}>
      {ok ? '✓ 已複製' : '複製全部 email'}
    </button>
  )
}

function SingleCopy({ email }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(email); setOk(true); setTimeout(()=>setOk(false),2000) }}
      style={{ fontSize:10, padding:'3px 8px', border:'none', borderRadius:3, cursor:'pointer', background: ok?'#27ae60':'#f0ede8', color: ok?'#fff':'#666', transition:'background 0.2s', whiteSpace:'nowrap' }}>
      {ok ? '✓' : '複製'}
    </button>
  )
}

// ── 委員會區塊 ────────────────────────────────────────────────────────────────
function CommitteeSection({ title, color, accent, members, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name:'', note:'', email:'' })

  function handleAdd() {
    if (!form.name || !form.email) return
    onAdd({ id: uid(), ...form })
    setForm({ name:'', note:'', email:'' })
    setAdding(false)
  }

  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, paddingBottom:8, borderBottom:`2px solid ${color}44` }}>
        <div style={{ fontSize:18, fontWeight:'bold', color }}>{title}</div>
        <div style={{ display:'flex', gap:8 }}>
          <CopyBtn emails={members.map(m=>m.email)} color={color} />
          <button onClick={() => setAdding(a=>!a)}
            style={{ fontSize:13, width:28, height:28, border:`1px solid ${color}`, borderRadius:4, background:'#fff', color, cursor:'pointer', fontWeight:'bold' }}>
            {adding ? '✕' : '+'}
          </button>
        </div>
      </div>

      {/* 新增表單 */}
      {adding && (
        <div style={{ background:`${accent}`, border:`1px solid ${color}44`, borderRadius:8, padding:'14px 16px', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>姓名 *</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="姓名"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:100, outline:'none' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>備註</label>
            <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="如：召集人"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:100, outline:'none' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>Email *</label>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="xxx@ntu.edu.tw"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:200, outline:'none' }} />
          </div>
          <button onClick={handleAdd}
            style={{ fontSize:12, padding:'6px 16px', background:color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:32 }}>
            新增
          </button>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'160px 1fr auto', background:'#1c1c1c', padding:'8px 16px', gap:8 }}>
          <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>姓名</div>
          <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>電子郵件</div>
          <div />
        </div>
        {members.map((m, i) => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'160px 1fr auto', padding:'10px 16px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:13.5, color:'#1c1c1c' }}>
              {m.name}
              {m.note && <span style={{ fontSize:10, color, marginLeft:6, background:accent, padding:'1px 6px', borderRadius:3 }}>{m.note}</span>}
            </div>
            <div style={{ fontSize:13, color:'#555', fontFamily:'monospace' }}>{m.email}</div>
            <div style={{ display:'flex', gap:6 }}>
              <SingleCopy email={m.email} />
              <button onClick={() => onRemove(m.id)}
                style={{ fontSize:10, padding:'3px 6px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div style={{ padding:'16px', textAlign:'center', color:'#bbb', fontSize:13, fontStyle:'italic' }}>尚無資料，點 + 新增</div>
        )}
      </div>
    </div>
  )
}

// ── 導師區塊 ──────────────────────────────────────────────────────────────────
function MentorSection({ mentors, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name:'', note:'', email:'' })

  function handleAdd() {
    if (!form.name || !form.email) return
    onAdd({ id: uid(), ...form })
    setForm({ name:'', note:'', email:'' })
    setAdding(false)
  }

  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, paddingBottom:8, borderBottom:'2px solid #b5451b44' }}>
        <div style={{ fontSize:18, fontWeight:'bold', color:'#b5451b' }}>院學士學位學程 導師</div>
        <button onClick={() => setAdding(a=>!a)}
          style={{ fontSize:13, width:28, height:28, border:'1px solid #b5451b', borderRadius:4, background:'#fff', color:'#b5451b', cursor:'pointer', fontWeight:'bold' }}>
          {adding ? '✕' : '+'}
        </button>
      </div>
      {adding && (
        <div style={{ background:'#fde8e3', border:'1px solid #b5451b44', borderRadius:8, padding:'14px 16px', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>姓名 *</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="姓名"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:100, outline:'none' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>備註</label>
            <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="如：115學年度導師"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:140, outline:'none' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'#666' }}>Email *</label>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="xxx@ntu.edu.tw"
              style={{ fontSize:13, padding:'5px 8px', border:'1px solid #ddd', borderRadius:4, width:200, outline:'none' }} />
          </div>
          <button onClick={handleAdd}
            style={{ fontSize:12, padding:'6px 16px', background:'#b5451b', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:32 }}>
            新增
          </button>
        </div>
      )}
      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'160px 1fr auto', background:'#1c1c1c', padding:'8px 16px', gap:12 }}>
          <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>姓名</div>
          <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>電子郵件</div>
          <div />
        </div>
        {mentors.map((m, i) => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'160px 1fr auto', padding:'10px 16px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:13.5, color:'#1c1c1c' }}>
              {m.name}
              {m.note && <span style={{ fontSize:10, color:'#b5451b', marginLeft:6, background:'#fde8e3', padding:'1px 6px', borderRadius:3 }}>{m.note}</span>}
            </div>
            <div style={{ fontSize:13, color:'#555', fontFamily:'monospace' }}>{m.email}</div>
            <div style={{ display:'flex', gap:6 }}>
              <SingleCopy email={m.email} />
              <button onClick={() => onRemove(m.id)}
                style={{ fontSize:10, padding:'3px 6px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 學生區塊 ──────────────────────────────────────────────────────────────────
function LeaveModal({ student, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:'24px 28px', width:380, boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize:16, fontWeight:'bold', color:'#1c1c1c', marginBottom:4 }}>將 {student.name} 移至已離開</div>
        <div style={{ fontSize:12, color:'#888', marginBottom:16 }}>請輸入離開原因（如：放棄、畢業、轉系等）</div>
        <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="例：115-1放棄、畢業（115）"
          style={{ width:'100%', fontSize:13, padding:'8px 10px', border:'1px solid #ddd', borderRadius:6, outline:'none', boxSizing:'border-box', marginBottom:16 }} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ fontSize:12, padding:'6px 16px', border:'1px solid #ddd', borderRadius:4, background:'#fff', color:'#666', cursor:'pointer' }}>取消</button>
          <button onClick={() => onConfirm(reason)} style={{ fontSize:12, padding:'6px 16px', border:'none', borderRadius:4, background:'#b5451b', color:'#fff', cursor:'pointer' }}>確認移動</button>
        </div>
      </div>
    </div>
  )
}

function StudentSection({ title, color, students, onMarkLeft, onRestoreLeft }) {
  const [showLeft, setShowLeft] = useState(false)
  const [leaveTarget, setLeaveTarget] = useState(null)
  const active = students.filter(s => !s.left)
  const left   = students.filter(s => s.left)

  return (
    <div style={{ marginBottom:20 }}>
      {leaveTarget && (
        <LeaveModal
          student={leaveTarget}
          onConfirm={reason => { onMarkLeft(leaveTarget.id, reason); setLeaveTarget(null) }}
          onCancel={() => setLeaveTarget(null)}
        />
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'16px 0 8px' }}>
        <div style={{ fontSize:13, fontWeight:'bold', color }}>{title}（在學 {active.length} 人）</div>
        <CopyBtn emails={active.map(s=>`${s.id}@ntu.edu.tw`)} color={color} />
      </div>
      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'88px 100px 140px 1fr 60px', background:'#1c1c1c', padding:'8px 16px', gap:8 }}>
          {['學號','姓名','系級','電子郵件',''].map((h,i) => <div key={i} style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
        </div>
        {active.map((s, i) => (
          <div key={s.id} style={{ display:'grid', gridTemplateColumns:'88px 100px 140px 1fr 60px', padding:'9px 16px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:11, color:'#aaa', fontFamily:'monospace' }}>{s.id}</div>
            <div style={{ fontSize:13.5, fontWeight:'bold', color:'#1c1c1c' }}>{s.name}</div>
            <div style={{ fontSize:12, color:'#666' }}>{s.dept} {s.grade}年</div>
            <div style={{ fontSize:12.5, color:'#555', fontFamily:'monospace' }}>{s.id}@ntu.edu.tw</div>
            <button onClick={() => setLeaveTarget(s)}
              style={{ fontSize:10, padding:'3px 6px', border:'1px solid #f0ede8', borderRadius:3, background:'#fff', color:'#bbb', cursor:'pointer', whiteSpace:'nowrap' }}>離開</button>
          </div>
        ))}
        {active.length === 0 && (
          <div style={{ padding:'16px', textAlign:'center', color:'#bbb', fontSize:13, fontStyle:'italic' }}>目前無在學學生</div>
        )}
      </div>

      {/* 已離開折疊 */}
      {left.length > 0 && (
        <div style={{ marginTop:6 }}>
          <button onClick={() => setShowLeft(o=>!o)}
            style={{ fontSize:11.5, color:'#999', background:'#f5f2ee', border:'1px solid #e0dbd4', borderRadius:4, padding:'4px 12px', cursor:'pointer' }}>
            {showLeft ? '▲' : '▼'} 已離開 {left.length} 人
          </button>
          {showLeft && (
            <div style={{ marginTop:6, background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden', opacity:0.8 }}>
              <div style={{ display:'grid', gridTemplateColumns:'88px 100px 140px 1fr 60px', background:'#888', padding:'7px 16px', gap:8 }}>
                {['學號','姓名','系所','狀態',''].map((h,i) => <div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#fff' }}>{h}</div>)}
              </div>
              {left.map((s, i) => (
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'88px 100px 140px 1fr 60px', padding:'8px 16px', background: i%2===0?'#fafaf8':'#f5f2ee', borderTop:'1px solid #f0ede8', gap:8, alignItems:'center' }}>
                  <div style={{ fontSize:11, color:'#aaa', fontFamily:'monospace' }}>{s.id}</div>
                  <div style={{ fontSize:13, color:'#999' }}>{s.name}</div>
                  <div style={{ fontSize:11.5, color:'#aaa' }}>{s.dept}</div>
                  <div style={{ fontSize:11.5, color:'#b5451b' }}>{s.leftReason}</div>
                  <button onClick={() => onRestoreLeft(s.id)}
                    style={{ fontSize:10, padding:'3px 6px', border:'1px solid #ddd', borderRadius:3, background:'#fff', color:'#888', cursor:'pointer' }}>還原</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function Contacts() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const r = await storageGet(CONTACTS_KEY)
        setData(r || INIT)
      } catch {
        setData(INIT)
      }
    }
    load()
  }, [])

  async function persist(next) {
    setData(next)
    setSaving(true)
    try {
      await storageSet(CONTACTS_KEY, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  function updateCommittee(key, members) {
    persist({ ...data, [key]: members })
  }

  function markLeft(cohortKey, id, reason) {
    const next = data[cohortKey].map(s => s.id === id ? { ...s, left:true, leftReason:reason } : s)
    persist({ ...data, [cohortKey]: next })
  }

  function restoreLeft(cohortKey, id) {
    const next = data[cohortKey].map(s => s.id === id ? { ...s, left:false, leftReason:'' } : s)
    persist({ ...data, [cohortKey]: next })
  }

  if (!data) return <div style={{ padding:40, color:'#aaa', fontFamily:'Georgia,serif' }}>載入中…</div>

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px 60px', fontFamily:"'Georgia','Noto Serif TC',serif" }}>
      {/* 存檔狀態 */}
      <div style={{ textAlign:'right', fontSize:11, color: saved?'#27ae60':saving?'#aaa':'transparent', fontFamily:'monospace', marginBottom:8 }}>
        {saving ? '儲存中…' : saved ? '✓ 已儲存' : '·'}
      </div>

      <CommitteeSection
        title="院學士學位學程 審查小組委員"
        color="#b5451b" accent="#fde8e3"
        members={data.collegeCommittee}
        onAdd={m => updateCommittee('collegeCommittee', [...data.collegeCommittee, m])}
        onRemove={id => updateCommittee('collegeCommittee', data.collegeCommittee.filter(m=>m.id!==id))}
      />

      <MentorSection
        mentors={data.mentors}
        onAdd={m => updateCommittee('mentors', [...data.mentors, m])}
        onRemove={id => updateCommittee('mentors', data.mentors.filter(m=>m.id!==id))}
      />

      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:18, fontWeight:'bold', color:'#b5451b', marginBottom:4, paddingBottom:8, borderBottom:'2px solid #b5451b44' }}>
          院學士學位學程 在學學生
        </div>
        <StudentSection title="113學年度" color="#b5451b"
          students={data.students113}
          onMarkLeft={(id, reason) => markLeft('students113', id, reason)}
          onRestoreLeft={id => restoreLeft('students113', id)}
        />
        <StudentSection title="114學年度" color="#b5451b"
          students={data.students114}
          onMarkLeft={(id, reason) => markLeft('students114', id, reason)}
          onRestoreLeft={id => restoreLeft('students114', id)}
        />
      </div>

      <CommitteeSection
        title="東亞研究學分學程 委員會"
        color="#8B5E3C" accent="#f5e8cc"
        members={data.eastAsia}
        onAdd={m => updateCommittee('eastAsia', [...data.eastAsia, m])}
        onRemove={id => updateCommittee('eastAsia', data.eastAsia.filter(m=>m.id!==id))}
      />

      <CommitteeSection
        title="中國大陸研究學分學程 委員會"
        color="#4a7c59" accent="#deebd0"
        members={data.china}
        onAdd={m => updateCommittee('china', [...data.china, m])}
        onRemove={id => updateCommittee('china', data.china.filter(m=>m.id!==id))}
      />

      <div style={{ fontSize:11, color:'#bbb', fontStyle:'italic', textAlign:'right' }}>最後更新：115年6月</div>
    </div>
  )
}
