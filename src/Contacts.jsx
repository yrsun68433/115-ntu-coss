import { useState, useEffect } from 'react'
import { storageGet, storageSet } from './storage'

const CONTACTS_KEY = 'contacts_115'

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
  admin: [
    { id:'ad1', name:'林儀欣', note:'人事室二組／差勤', email:'yhlin1012@ntu.edu.tw', phone:'66208', link:'' },
    { id:'ad2', name:'李奕萱', note:'人事室四組', email:'liyihsuan@ntu.edu.tw', phone:'69939', link:'' },
    { id:'ad3', name:'藍雅環', note:'註冊組／證書製發', email:'lan@ntu.edu.tw', phone:'', link:'' },
    { id:'ad4', name:'林家民', note:'註冊組／申請人數查詢', email:'cmlin@ntu.edu.tw', phone:'62388#207', link:'' },
    { id:'ad5', name:'王冠盈', note:'課務組／課程異動／排課', email:'kywang@ntu.edu.tw', phone:'62388#303', link:'https://gra206.aca.ntu.edu.tw/ntuweb/index.php/web-message' },
    { id:'ad6', name:'林佑宣', note:'註冊組／轉系雙主修審核（轉出方）', email:'yuhsuan405@ntu.edu.tw', phone:'62388轉219', link:'' },
  ],
  deptContacts: [
    { id:'dc1', name:'官凌蕙', note:'政治系', email:'kuanlh1124@ntu.edu.tw', phone:'55738' },
    { id:'dc2', name:'吳孟珊', note:'經濟系', email:'mswu@ntu.edu.tw', phone:'68446' },
    { id:'dc3', name:'黃瑜焄', note:'社會系', email:'yushuang@ntu.edu.tw', phone:'61217' },
    { id:'dc4', name:'翁小雯', note:'社工系', email:'ntusw@ntu.edu.tw', phone:'61242' },
    { id:'dc5', name:'林錦屏', note:'新聞所', email:'cpl@ntu.edu.tw', phone:'63131' },
    { id:'dc6', name:'江宜津', note:'國發所', email:'icchiang@ntu.edu.tw', phone:'63320' },
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

// ── 小工具 ────────────────────────────────────────────────────────────────────
function CopyBtn({ emails, color }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(emails.join('; ')); setOk(true); setTimeout(()=>setOk(false),2000) }}
      style={{ fontSize:10, padding:'3px 10px', border:'none', borderRadius:3, cursor:'pointer', background: ok?'#27ae60':color, color:'#fff', transition:'background 0.2s', whiteSpace:'nowrap' }}>
      {ok ? '✓ 已複製' : '複製全部'}
    </button>
  )
}

function SingleCopy({ email }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(email); setOk(true); setTimeout(()=>setOk(false),2000) }}
      style={{ fontSize:10, padding:'2px 6px', border:'1px solid #eee', borderRadius:3, background: ok?'#27ae60':'#fff', color: ok?'#fff':'#aaa', cursor:'pointer', transition:'all 0.15s' }}>
      {ok ? '✓' : '複製'}
    </button>
  )
}

// ── 彈窗 ──────────────────────────────────────────────────────────────────────
function LeaveModal({ student, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:'24px 28px', width:380, boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize:15, fontWeight:'bold', marginBottom:4 }}>將 {student.name} 移至已離開</div>
        <div style={{ fontSize:12, color:'#888', marginBottom:14 }}>輸入離開原因</div>
        <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="例：115-1放棄、畢業（115）"
          autoFocus
          style={{ width:'100%', fontSize:13, padding:'8px 10px', border:'1px solid #ddd', borderRadius:6, outline:'none', boxSizing:'border-box', marginBottom:16 }} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ fontSize:12, padding:'6px 14px', border:'1px solid #ddd', borderRadius:4, background:'#fff', color:'#666', cursor:'pointer' }}>取消</button>
          <button onClick={() => onConfirm(reason)} style={{ fontSize:12, padding:'6px 14px', border:'none', borderRadius:4, background:'#b5451b', color:'#fff', cursor:'pointer' }}>確認</button>
        </div>
      </div>
    </div>
  )
}

// ── 卡片 ──────────────────────────────────────────────────────────────────────
function Card({ id, label, sub, color, count, isOpen, onClick, children }) {
  return (
    <div style={{ marginBottom: isOpen ? 0 : 0 }}>
      {/* 正方形卡片 */}
      <button onClick={() => onClick(id)}
        style={{
          width:120, height:110,
          background: isOpen ? color : '#fff',
          color: isOpen ? '#fff' : '#1c1c1c',
          border: `2px solid ${color}`,
          borderRadius: isOpen ? '8px 8px 0 0' : 8,
          cursor:'pointer', textAlign:'left',
          padding:'12px 12px 10px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          boxShadow: isOpen ? `0 4px 16px ${color}44` : '2px 3px 8px rgba(0,0,0,0.08)',
          transition:'all 0.18s',
          position:'relative',
        }}>
        <div>
          <div style={{ fontSize:13, fontWeight:'bold', lineHeight:1.3 }}>{label}</div>
          {sub && <div style={{ fontSize:10, opacity:0.65, marginTop:3 }}>{sub}</div>}
        </div>
        <div style={{ fontSize:11, opacity:0.7, fontFamily:'monospace' }}>{count}</div>
        <div style={{ position:'absolute', top:7, right:9, fontSize:14, opacity:0.5 }}>{isOpen ? '▲' : '▼'}</div>
      </button>
    </div>
  )
}

// ── 委員內容 ──────────────────────────────────────────────────────────────────
function CommitteeContent({ color, accent, members, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name:'', note:'', email:'' })

  function handleAdd() {
    if (!form.name || !form.email) return
    onAdd({ id: uid(), ...form })
    setForm({ name:'', note:'', email:'' })
    setAdding(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:10 }}>
        <CopyBtn emails={members.map(m=>m.email)} color={color} />
        <button onClick={() => setAdding(a=>!a)}
          style={{ fontSize:12, width:26, height:26, border:`1px solid ${color}`, borderRadius:4, background:'#fff', color, cursor:'pointer', fontWeight:'bold' }}>
          {adding ? '✕' : '+'}
        </button>
      </div>
      {adding && (
        <div style={{ background:accent, border:`1px solid ${color}44`, borderRadius:8, padding:'12px 14px', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          {[['姓名 *','name',100,'姓名'],['備註','note',100,'如：召集人'],['Email *','email',200,'xxx@ntu.edu.tw']].map(([label,key,w,ph]) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <label style={{ fontSize:10, color:'#666' }}>{label}</label>
              <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
                style={{ fontSize:12, padding:'4px 7px', border:'1px solid #ddd', borderRadius:4, width:w, outline:'none' }} />
            </div>
          ))}
          <button onClick={handleAdd} style={{ fontSize:12, padding:'5px 14px', background:color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:28 }}>新增</button>
        </div>
      )}
      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'150px 1fr auto', background:'#1c1c1c', padding:'7px 14px', gap:8 }}>
          {['姓名','電子郵件',''].map((h,i) => <div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
        </div>
        {members.length === 0 && <div style={{ padding:'14px', textAlign:'center', color:'#bbb', fontSize:12, fontStyle:'italic' }}>尚無資料，點 + 新增</div>}
        {members.map((m, i) => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'150px 1fr auto', padding:'9px 14px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:13, color:'#1c1c1c' }}>
              {m.name}
              {m.note && <span style={{ fontSize:9.5, color, marginLeft:5, background:accent, padding:'1px 5px', borderRadius:3 }}>{m.note}</span>}
            </div>
            <div style={{ fontSize:12, color:'#555', fontFamily:'monospace' }}>{m.email}</div>
            <div style={{ display:'flex', gap:5 }}>
              <SingleCopy email={m.email} />
              <button onClick={() => onRemove(m.id)} style={{ fontSize:10, padding:'2px 5px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 行政窗口內容（含分機）────────────────────────────────────────────────────
function AdminContent({ color, accent, members, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name:'', note:'', phone:'', email:'', link:'' })

  function handleAdd() {
    if (!form.name) return
    onAdd({ id: uid(), ...form })
    setForm({ name:'', note:'', phone:'', email:'', link:'' })
    setAdding(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:10 }}>
        <CopyBtn emails={members.filter(m=>m.email).map(m=>m.email)} color={color} />
        <button onClick={() => setAdding(a=>!a)}
          style={{ fontSize:12, width:26, height:26, border:`1px solid ${color}`, borderRadius:4, background:'#fff', color, cursor:'pointer', fontWeight:'bold' }}>
          {adding ? '✕' : '+'}
        </button>
      </div>
      {adding && (
        <div style={{ background:accent, border:`1px solid ${color}44`, borderRadius:8, padding:'12px 14px', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          {[['姓名 *','name',90,'姓名'],['業務備註','note',130,'如：排課、課務系統'],['分機','phone',90,'如：66208'],['Email','email',190,'xxx@ntu.edu.tw'],['業務說明連結','link',220,'https://…']].map(([label,key,w,ph]) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <label style={{ fontSize:10, color:'#666' }}>{label}</label>
              <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
                style={{ fontSize:12, padding:'4px 7px', border:'1px solid #ddd', borderRadius:4, width:w, outline:'none' }} />
            </div>
          ))}
          <button onClick={handleAdd} style={{ fontSize:12, padding:'5px 14px', background:color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:28 }}>新增</button>
        </div>
      )}
      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'90px 130px 80px 1fr 60px auto', background:'#1c1c1c', padding:'7px 14px', gap:8 }}>
          {['姓名','業務','分機','Email','連結',''].map((h,i) => <div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
        </div>
        {members.map((m, i) => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'90px 130px 80px 1fr 60px auto', padding:'9px 14px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:13, fontWeight:'bold', color:'#1c1c1c' }}>{m.name}</div>
            <div style={{ fontSize:11, color:'#666' }}>{m.note}</div>
            <div style={{ fontSize:11, color:'#888', fontFamily:'monospace' }}>{m.phone || '—'}</div>
            <div style={{ fontSize:11, color:'#555', fontFamily:'monospace' }}>{m.email || '（待補）'}</div>
            <div>
              {m.link
                ? <a href={m.link} target="_blank" rel="noopener noreferrer" style={{ fontSize:10.5, color, textDecoration:'underline' }}>查看</a>
                : <span style={{ fontSize:10.5, color:'#ddd' }}>—</span>}
            </div>
            <div style={{ display:'flex', gap:5 }}>
              {m.email && <SingleCopy email={m.email} />}
              <button onClick={() => onRemove(m.id)} style={{ fontSize:10, padding:'2px 5px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 導師內容 ──────────────────────────────────────────────────────────────────
function MentorContent({ mentors, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name:'', note:'', email:'' })
  function handleAdd() {
    if (!form.name || !form.email) return
    onAdd({ id: uid(), ...form })
    setForm({ name:'', note:'', email:'' })
    setAdding(false)
  }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:10 }}>
        <button onClick={() => setAdding(a=>!a)}
          style={{ fontSize:12, width:26, height:26, border:'1px solid #b5451b', borderRadius:4, background:'#fff', color:'#b5451b', cursor:'pointer', fontWeight:'bold' }}>
          {adding ? '✕' : '+'}
        </button>
      </div>
      {adding && (
        <div style={{ background:'#fde8e3', border:'1px solid #b5451b44', borderRadius:8, padding:'12px 14px', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          {[['姓名 *','name',100,'姓名'],['備註','note',140,'如：115學年度導師'],['Email *','email',200,'xxx@ntu.edu.tw']].map(([label,key,w,ph]) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <label style={{ fontSize:10, color:'#666' }}>{label}</label>
              <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
                style={{ fontSize:12, padding:'4px 7px', border:'1px solid #ddd', borderRadius:4, width:w, outline:'none' }} />
            </div>
          ))}
          <button onClick={handleAdd} style={{ fontSize:12, padding:'5px 14px', background:'#b5451b', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', height:28 }}>新增</button>
        </div>
      )}
      <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'150px 1fr auto', background:'#1c1c1c', padding:'7px 14px', gap:8 }}>
          {['姓名','電子郵件',''].map((h,i) => <div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
        </div>
        {mentors.map((m, i) => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'150px 1fr auto', padding:'9px 14px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:13, color:'#1c1c1c' }}>
              {m.name}
              {m.note && <span style={{ fontSize:9.5, color:'#b5451b', marginLeft:5, background:'#fde8e3', padding:'1px 5px', borderRadius:3 }}>{m.note}</span>}
            </div>
            <div style={{ fontSize:12, color:'#555', fontFamily:'monospace' }}>{m.email}</div>
            <div style={{ display:'flex', gap:5 }}>
              <SingleCopy email={m.email} />
              <button onClick={() => onRemove(m.id)} style={{ fontSize:10, padding:'2px 5px', border:'1px solid #eee', borderRadius:3, background:'#fff', color:'#ccc', cursor:'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 學生內容 ──────────────────────────────────────────────────────────────────
function StudentContent({ cohort, students113, students114, onMarkLeft, onRestoreLeft }) {
  const [leaveTarget, setLeaveTarget] = useState(null)
  const [showLeft, setShowLeft] = useState(false)
  const students = cohort === '113' ? students113 : students114
  const color = cohort === '113' ? '#b5451b' : '#2e6b8a'

  function StudentTable({ students, showLeft, setShowLeft, cohort, color }) {
    const active = students.filter(s=>!s.left)
    const left   = students.filter(s=>s.left)
    return (
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ fontSize:12, fontWeight:'bold', color }}>{cohort}學年度在學（{active.length}人）</div>
          <CopyBtn emails={active.map(s=>`${s.id}@ntu.edu.tw`)} color={color} />
        </div>
        <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'85px 90px 130px 1fr 52px', background:'#1c1c1c', padding:'7px 14px', gap:8 }}>
            {['學號','姓名','系級','電子郵件',''].map((h,i) => <div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
          </div>
          {active.map((s, i) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'85px 90px 130px 1fr 52px', padding:'8px 14px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:10.5, color:'#aaa', fontFamily:'monospace' }}>{s.id}</div>
              <div style={{ fontSize:13, fontWeight:'bold', color:'#1c1c1c' }}>{s.name}</div>
              <div style={{ fontSize:11, color:'#666' }}>{s.dept} {s.grade}年</div>
              <div style={{ fontSize:11.5, color:'#555', fontFamily:'monospace' }}>{s.id}@ntu.edu.tw</div>
              <button onClick={() => setLeaveTarget({...s, cohort})}
                style={{ fontSize:10, padding:'2px 5px', border:'1px solid #f0ede8', borderRadius:3, background:'#fff', color:'#bbb', cursor:'pointer' }}>離開</button>
            </div>
          ))}
        </div>
        {left.length > 0 && (
          <div style={{ marginTop:6 }}>
            <button onClick={() => setShowLeft(o=>!o)}
              style={{ fontSize:11, color:'#999', background:'#f5f2ee', border:'1px solid #e0dbd4', borderRadius:4, padding:'3px 10px', cursor:'pointer' }}>
              {showLeft?'▲':'▼'} 已離開 {left.length} 人
            </button>
            {showLeft && (
              <div style={{ marginTop:4, background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden', opacity:0.8 }}>
                <div style={{ display:'grid', gridTemplateColumns:'85px 90px 130px 1fr 52px', background:'#888', padding:'6px 14px', gap:8 }}>
                  {['學號','姓名','系所','狀態',''].map((h,i)=><div key={i} style={{ fontSize:11, fontWeight:'bold', color:'#fff' }}>{h}</div>)}
                </div>
                {left.map((s,i)=>(
                  <div key={s.id} style={{ display:'grid', gridTemplateColumns:'85px 90px 130px 1fr 52px', padding:'7px 14px', background: i%2===0?'#fafaf8':'#f5f2ee', borderTop:'1px solid #f0ede8', gap:8, alignItems:'center' }}>
                    <div style={{ fontSize:10.5, color:'#aaa', fontFamily:'monospace' }}>{s.id}</div>
                    <div style={{ fontSize:12, color:'#999' }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'#aaa' }}>{s.dept}</div>
                    <div style={{ fontSize:11, color:'#b5451b' }}>{s.leftReason}</div>
                    <button onClick={() => onRestoreLeft(cohort, s.id)}
                      style={{ fontSize:10, padding:'2px 5px', border:'1px solid #ddd', borderRadius:3, background:'#fff', color:'#888', cursor:'pointer' }}>還原</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {leaveTarget && (
        <LeaveModal
          student={leaveTarget}
          onConfirm={reason => { onMarkLeft(leaveTarget.cohort, leaveTarget.id, reason); setLeaveTarget(null) }}
          onCancel={() => setLeaveTarget(null)}
        />
      )}
      <StudentTable students={students} showLeft={showLeft} setShowLeft={setShowLeft} cohort={cohort} color={color} />
    </div>
  )
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function Contacts() {
  const [data, setData] = useState(null)
  const [open, setOpen] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try { const r = await storageGet(CONTACTS_KEY); setData(r || INIT) }
      catch { setData(INIT) }
    }
    load()
  }, [])

  async function persist(next) {
    setData(next)
    setSaving(true)
    try { await storageSet(CONTACTS_KEY, next); setSaved(true); setTimeout(()=>setSaved(false),1800) }
    catch(e) { console.error(e) }
    setSaving(false)
  }

  function toggle(id) { setOpen(o => o===id ? null : id) }
  function updateList(key, list) { persist({ ...data, [key]: list }) }
  function markLeft(cohort, id, reason) {
    const key = `students${cohort}`
    persist({ ...data, [key]: data[key].map(s => s.id===id ? {...s, left:true, leftReason:reason} : s) })
  }
  function restoreLeft(cohort, id) {
    const key = `students${cohort}`
    persist({ ...data, [key]: data[key].map(s => s.id===id ? {...s, left:false, leftReason:''} : s) })
  }

  if (!data) return <div style={{ padding:40, color:'#aaa', fontFamily:'Georgia,serif' }}>載入中…</div>

  const s113active = data.students113.filter(s=>!s.left).length
  const s114active = data.students114.filter(s=>!s.left).length

  const ROW1 = [
    { id:'admin',   label:'行政窗口',       color:'#5a3a8a', count:`${data.admin.length} 人` },
    { id:'dept',    label:'各系所選課窗口', color:'#2e6b5a', count:`${data.deptContacts.length} 人` },
  ]
  const ROW2 = [
    { id:'college', label:'院學士審查委員', color:'#b5451b', count:`${data.collegeCommittee.length} 人` },
    { id:'mentor',  label:'院學士導師',     color:'#b5451b', count:`${data.mentors.length} 人` },
    { id:'s113',    label:'113學生',        color:'#c47c1a', count:`在學 ${s113active} 人` },
    { id:'s114',    label:'114學生',        color:'#2e6b8a', count:`在學 ${s114active} 人` },
    { id:'east',    label:'東亞學程委員',   color:'#8B5E3C', count:`${data.eastAsia.length} 人` },
    { id:'china',   label:'中國大陸委員',   color:'#4a7c59', count:`${data.china.length} 人` },
  ]
  const CARDS = [...ROW1, ...ROW2]

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 60px', fontFamily:"'Georgia','Noto Serif TC',serif" }}>
      <style>{`@keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* 存檔提示 */}
      <div style={{ textAlign:'right', fontSize:10, color: saved?'#27ae60':saving?'#aaa':'transparent', fontFamily:'monospace', marginBottom:10 }}>
        {saving?'儲存中…':saved?'✓ 已儲存':'·'}
      </div>

      {/* 卡片列 1：行政窗口 */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:10 }}>
        {ROW1.map(c => (
          <Card key={c.id} {...c} isOpen={open===c.id} onClick={toggle} />
        ))}
      </div>
      {/* 卡片列 2：院學士與學程 */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        {ROW2.map(c => (
          <Card key={c.id} {...c} isOpen={open===c.id} onClick={toggle} />
        ))}
      </div>

      {/* 展開內容 */}
      {open && (
        <div style={{ background:'#fff', borderRadius:10, border:`2px solid ${CARDS.find(c=>c.id===open)?.color}44`, padding:'20px 22px', animation:'slideDown 0.18s ease' }}>
          {open==='admin' && <AdminContent color="#5a3a8a" accent="#e8dcf5" members={data.admin}
            onAdd={m=>updateList('admin',[...data.admin,m])}
            onRemove={id=>updateList('admin',data.admin.filter(m=>m.id!==id))} />}
          {open==='dept' && <AdminContent color="#2e6b5a" accent="#d3ebe1" members={data.deptContacts}
            onAdd={m=>updateList('deptContacts',[...data.deptContacts,m])}
            onRemove={id=>updateList('deptContacts',data.deptContacts.filter(m=>m.id!==id))} />}
          {open==='college' && <CommitteeContent color="#b5451b" accent="#fde8e3" members={data.collegeCommittee}
            onAdd={m=>updateList('collegeCommittee',[...data.collegeCommittee,m])}
            onRemove={id=>updateList('collegeCommittee',data.collegeCommittee.filter(m=>m.id!==id))} />}
          {open==='mentor' && <MentorContent mentors={data.mentors}
            onAdd={m=>updateList('mentors',[...data.mentors,m])}
            onRemove={id=>updateList('mentors',data.mentors.filter(m=>m.id!==id))} />}
          {open==='s113' && <StudentContent cohort="113"
            students113={data.students113} students114={data.students114}
            onMarkLeft={markLeft} onRestoreLeft={restoreLeft} />}
          {open==='s114' && <StudentContent cohort="114"
            students113={data.students113} students114={data.students114}
            onMarkLeft={markLeft} onRestoreLeft={restoreLeft} />}
          {open==='east' && <CommitteeContent color="#8B5E3C" accent="#f5e8cc" members={data.eastAsia}
            onAdd={m=>updateList('eastAsia',[...data.eastAsia,m])}
            onRemove={id=>updateList('eastAsia',data.eastAsia.filter(m=>m.id!==id))} />}
          {open==='china' && <CommitteeContent color="#4a7c59" accent="#deebd0" members={data.china}
            onAdd={m=>updateList('china',[...data.china,m])}
            onRemove={id=>updateList('china',data.china.filter(m=>m.id!==id))} />}
        </div>
      )}
    </div>
  )
}
