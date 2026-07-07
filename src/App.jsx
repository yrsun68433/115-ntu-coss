import { useState, useEffect, useRef } from 'react'


import { storageGet, storageSet } from './storage'
import { BUDGET, MONTHS, initBudgetState } from './data'
import { supabase } from './supabase'
import Contacts from './Contacts'
import Notes from './Notes'

const DB_KEY = 'worklog_115'

const DEADLINES = {
  now: [
    { date: '6/3', label: '排課系統開放建檔', color: '#666' },
    { date: '6/5', label: '東亞委員會', color: '#8B5E3C' },
    { date: '6/8–23', label: '院學士申請', color: '#2e6b8a' },
    { date: '6/17', label: '學程課程上網建檔及建置課程大綱', color: '#4a7c59' },
    { date: '6/18', label: '詢問申請人數', color: '#2e6b8a' },
    { date: '6/23', label: '院學士申請截止', color: '#2e6b8a' },
    { date: '6/25', label: '成績單可下載', color: '#666' },
    { date: '6月底', label: '學程申請結果公告', color: '#4a7c59' },
  ],
  july: [
    { date: '7/1–15', label: '各單位列印課表公告', color: '#666' },
    { date: '7/2', label: '教務處再次上傳學生檔案', color: '#666' },
    { date: '7/6', label: '寄發申請資料給委員', color: '#2e6b8a' },
    { date: '7/14–17', label: '院學士審議會議', color: '#2e6b8a' },
    { date: '7/15', label: '課程建檔截止、送回課程清單', color: '#666' },
    { date: '7/20', label: '轉入名單截止', color: '#2e6b8a' },
    { date: '7/27', label: '註冊組審核總表', color: '#666' },
    { date: '7/30', label: '簽請教務長核定', color: '#666' },
    { date: '7月', label: '啟動導生宴調查', color: '#2e6b8a' },
  ],
  august: [
    { date: '8/3', label: '課程公告、核准名單公告', color: '#666' },
    { date: '8/3', label: '院學士通知錄取結果', color: '#2e6b8a' },
    { date: '8/11', label: '課程加停開須送課程委員會', color: '#666' },
    { date: '8/18–26', label: '初選', color: '#666' },
    { date: '8月底', label: '官網更新截止', color: '#4a7c59' },
  ],
  sept: [
    { date: '9/3', label: '課程異動暨加停開截止', color: '#666' },
    { date: '9/4', label: '成績可查', color: '#666' },
    { date: '9/7', label: '⭐ 開學、加退選開始', color: '#666' },
    { date: '9/12', label: '探索學分截止', color: '#2e6b8a' },
    { date: '9/16', label: '開放學期教室借用', color: '#666' },
    { date: '9/18–30', label: '迎新暨課程說明會', color: '#2e6b8a' },
    { date: '9/19', label: '退選截止', color: '#666' },
    { date: '9/21', label: '加選截止', color: '#666' },
    { date: '9/23', label: '停修開始', color: '#666' },
  ],
  oct: [
    { date: '10/16', label: '教務會議', color: '#666' },
    { date: '10/17', label: '校務會議', color: '#666' },
    { date: '10/26–30', label: '⭐ 期中考', color: '#666' },
    { date: '10月', label: '導生宴', color: '#2e6b8a' },
    { date: '10月下旬', label: '115-2課程編排說明會', color: '#666' },
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
    { date: '12/18', label: '⭐ 上課結束', color: '#666' },
    { date: '12/18', label: '教務會議', color: '#666' },
    { date: '12/21–25', label: '⭐ 期末考', color: '#666' },
    { date: '12/25', label: '放假', color: '#666' },
    { date: '12/28', label: '雙主修放棄截止', color: '#2e6b8a' },
    { date: '12/28', label: '⭐ 寒假', color: '#666' },
  ],
  jan: [
    { date: '1/4', label: '成績公告', color: '#666' },
    { date: '1/4', label: '課程公告', color: '#666' },
    { date: '1/12–20', label: '初選', color: '#666' },
    { date: '1/31', label: '⭐ 學期結束', color: '#666' },
  ],
  confirm: [],
}


function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }
function fmt(n) { return n == null ? '—' : '＄' + n.toLocaleString() }

// ── 通訊錄資料 ────────────────────────────────────────────────────────────────
const COLLEGE_COMMITTEE = [
  { name:'洪貞玲', note:'召集人（副院長）', email:'clhung@ntu.edu.tw' },
  { name:'黃景沂', note:'', email:'chingihuang@ntu.edu.tw' },
  { name:'陳昱志', note:'', email:'ycrchen@ntu.edu.tw' },
  { name:'蔡宜展', note:'', email:'yichantsai@ntu.edu.tw' },
  { name:'黃凱苹', note:'', email:'kaipinghuang@ntu.edu.tw' },
  { name:'賴建宇', note:'', email:'cyljason@ntu.edu.tw' },
  { name:'洪晨碩', note:'', email:'cshong@ntu.edu.tw' },
]
const MENTORS = [
  { name:'王道一', note:'113學年度導師', email:'josephw@ntu.edu.tw' },
  { name:'張登及', note:'114學年度導師', email:'tchang@ntu.edu.tw' },
]
const EAST_ASIA_COMMITTEE = [
  { name:'周嘉辰', note:'召集人', email:'chelseachou@ntu.edu.tw' },
  { name:'蔡蕙如', note:'', email:'tsaihuiju@ntu.edu.tw' },
  { name:'謝宛蓉', note:'', email:'wanjungh@ntu.edu.tw' },
  { name:'賴建宇', note:'', email:'cyljason@ntu.edu.tw' },
  { name:'李宥霆', note:'', email:'ytandylee@ntu.edu.tw' },
  { name:'左正東', note:'', email:'ctso@ntu.edu.tw' },
  { name:'王宏文', note:'', email:'hongwung@ntu.edu.tw' },
  { name:'何明修', note:'', email:'msho@ntu.edu.tw' },
]
const CHINA_COMMITTEE = [
  { name:'蔡季廷', note:'召集人', email:'chiting@ntu.edu.tw' },
  { name:'徐斯勤', note:'', email:'schsu01@ntu.edu.tw' },
]
const STUDENTS_113_ACTIVE = [
  { id:'B12302252', name:'黃琦雯', dept:'政治系國關組', grade:3 },
  { id:'B12302259', name:'鄭沁哲', dept:'政治系國關組', grade:3 },
  { id:'B12302350', name:'詹明翰', dept:'政治系公行組', grade:3 },
  { id:'B11302212', name:'蔡佑澤', dept:'經濟系', grade:4 },
  { id:'B11303023', name:'吳瑞家', dept:'經濟系', grade:4 },
  { id:'B11303039', name:'陳彥廷', dept:'經濟系', grade:4 },
  { id:'B11303042', name:'黃沛綺', dept:'經濟系', grade:4 },
  { id:'B12303002', name:'郭秉豐', dept:'經濟系', grade:3 },
  { id:'B12303054', name:'袁承亨', dept:'經濟系', grade:3 },
  { id:'B12303136', name:'彭晨紘', dept:'經濟系', grade:3 },
  { id:'B12305017', name:'呂政陽', dept:'社會系', grade:3 },
  { id:'B12305039', name:'余承熹', dept:'社會系', grade:3 },
  { id:'B12305049', name:'陳亮勳', dept:'社會系', grade:3 },
  { id:'B12310049', name:'游佩軒', dept:'社工系', grade:3 },
]
const STUDENTS_113_LEFT = [
  { id:'B11302337', name:'吳家杏', dept:'政治系公行組', grade:4, reason:'放棄（114-1）' },
  { id:'B11302353', name:'盧子琳', dept:'政治系公行組', grade:4, reason:'放棄（114-1）' },
  { id:'B11303063', name:'鄭學澤', dept:'經濟系', grade:4, reason:'放棄（114-1）' },
  { id:'B11310013', name:'胡傑凱', dept:'社會系', grade:4, reason:'畢業（114，首屆）' },
]
const STUDENTS_114_ACTIVE = [
  { id:'B13302107', name:'孫珮珈', dept:'政治系政論組', grade:2 },
  { id:'B12302144', name:'黃彩慈', dept:'政治系政論組', grade:3 },
  { id:'B13302230', name:'金柔旼', dept:'政治系國關組', grade:2 },
  { id:'B12302152', name:'蕭博仁', dept:'政治系國關組', grade:3 },
  { id:'B13302308', name:'蔡佳芸', dept:'政治系公行組', grade:2 },
  { id:'B13302342', name:'褚芳妘', dept:'政治系公行組', grade:2 },
  { id:'B12302314', name:'陳麗庭', dept:'政治系公行組', grade:3 },
  { id:'B13303035', name:'朱皓瑋', dept:'經濟系', grade:2 },
  { id:'B13303056', name:'黃冠予', dept:'經濟系', grade:2 },
  { id:'B13303057', name:'蔡睿燊', dept:'經濟系', grade:2 },
  { id:'B13303062', name:'林天麗', dept:'經濟系', grade:2 },
  { id:'B13303153', name:'詹舒宇', dept:'經濟系', grade:2 },
  { id:'B12302147', name:'詹怡安', dept:'經濟系', grade:3 },
  { id:'B12303010', name:'林宜萱', dept:'經濟系', grade:3 },
  { id:'B12303122', name:'林冠廷', dept:'經濟系', grade:3 },
  { id:'B12305003', name:'高唯琮', dept:'社會系', grade:3 },
  { id:'B12305019', name:'李芸熏', dept:'社會系', grade:3 },
  { id:'B12305025', name:'張佳瑩', dept:'社會系', grade:3 },
  { id:'B12305040', name:'吳士宏', dept:'社會系', grade:3 },
  { id:'B11305035', name:'吳秉霖', dept:'社會系', grade:4 },
  { id:'B11310045', name:'林芷妤', dept:'社工系', grade:4 },
  { id:'B12702083', name:'徐苡茜', dept:'會計系', grade:3 },
  { id:'B12702097', name:'陳彥蓁', dept:'會計系', grade:3 },
  { id:'B11302211', name:'吳和華', dept:'會計系', grade:4 },
  { id:'B12703015', name:'楊政諺', dept:'財金系', grade:3 },
  { id:'B12801022', name:'賴禾凱', dept:'公衛系', grade:3 },
]
const STUDENTS_114_LEFT = [
  { id:'B13302332', name:'張芷瑜', dept:'政治系公行組', grade:2, reason:'放棄（114-2，更換雙主修）' },
  { id:'B11305043', name:'陳孝祤', dept:'社會系', grade:4, reason:'放棄（114-2）' },
  { id:'B11H04006', name:'李　蕎', dept:'運動學士學程', grade:4, reason:'放棄（已轉入政治系）' },
]

// ── 通訊錄元件 ────────────────────────────────────────────────────────────────
function CopyAllBtn({ emails, color }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(emails.join('; ')); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
      style={{ fontSize:11, padding:'4px 12px', background: copied?'#27ae60':color, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', flexShrink:0, transition:'background 0.2s' }}
    >{copied ? '✓ 已複製' : '複製全部 email'}</button>
  )
}

function CommitteeTable({ members, color, accent }) {
  return (
    <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', background:'#1c1c1c', padding:'8px 16px' }}>
        <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>姓名</div>
        <div style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>電子郵件</div>
      </div>
      {members.map((m, i) => (
        <div key={m.email} style={{ display:'grid', gridTemplateColumns:'160px 1fr', padding:'10px 16px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center' }}>
          <div style={{ fontSize:13.5, color:'#1c1c1c' }}>
            {m.name}
            {m.note && <span style={{ fontSize:10, color, marginLeft:6, background:accent, padding:'1px 6px', borderRadius:3 }}>{m.note}</span>}
          </div>
          <div style={{ fontSize:13, color:'#555', fontFamily:'monospace', userSelect:'text' }}>{m.email}</div>
        </div>
      ))}
    </div>
  )
}

function StudentTable({ students }) {
  return (
    <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'80px 100px 120px 1fr', background:'#1c1c1c', padding:'8px 16px', gap:8 }}>
        {['學號','姓名','系級','電子郵件'].map(h => <div key={h} style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>)}
      </div>
      {students.map((s, i) => (
        <div key={s.id} style={{ display:'grid', gridTemplateColumns:'80px 100px 120px 1fr', padding:'9px 16px', background: i%2===0?'#fff':'#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:11.5, color:'#888', fontFamily:'monospace' }}>{s.id}</div>
          <div style={{ fontSize:13.5, color:'#1c1c1c', fontWeight:'bold' }}>{s.name}</div>
          <div style={{ fontSize:12, color:'#666' }}>{s.dept}　{s.grade}年</div>
          <div style={{ fontSize:13, color:'#555', fontFamily:'monospace', userSelect:'text' }}>{s.id}@ntu.edu.tw</div>
        </div>
      ))}
    </div>
  )
}


const COHORT_113 = [
  { id:'B12302252', name:'黃琦雯', dept:'政治系國關組', grade:3, year:113 },
  { id:'B12302259', name:'鄭沁哲', dept:'政治系國關組', grade:3, year:113 },
  { id:'B12302350', name:'詹明翰', dept:'政治系公行組', grade:3, year:113 },
  { id:'B11302337', name:'吳家杏', dept:'政治系公行組', grade:4, year:113, defaultStatus:'放棄', defaultNote:'114-1放棄' },
  { id:'B11302353', name:'盧子琳', dept:'政治系公行組', grade:4, year:113, defaultStatus:'放棄', defaultNote:'114-1放棄' },
  { id:'B11302212', name:'蔡佑澤', dept:'經濟系', grade:4, year:113 },
  { id:'B11303023', name:'吳瑞家', dept:'經濟系', grade:4, year:113 },
  { id:'B11303039', name:'陳彥廷', dept:'經濟系', grade:4, year:113 },
  { id:'B11303042', name:'黃沛綺', dept:'經濟系', grade:4, year:113 },
  { id:'B11303063', name:'鄭學澤', dept:'經濟系', grade:4, year:113, defaultStatus:'放棄', defaultNote:'114-1放棄' },
  { id:'B12303002', name:'郭秉豐', dept:'經濟系', grade:3, year:113 },
  { id:'B12303054', name:'袁承亨', dept:'經濟系', grade:3, year:113 },
  { id:'B12303136', name:'彭晨紘', dept:'經濟系', grade:3, year:113 },
  { id:'B12305017', name:'呂政陽', dept:'社會系', grade:3, year:113 },
  { id:'B12305039', name:'余承熹', dept:'社會系', grade:3, year:113 },
  { id:'B12305049', name:'陳亮勳', dept:'社會系', grade:3, year:113 },
  { id:'B11310013', name:'胡傑凱', dept:'社會系', grade:4, year:113, defaultStatus:'畢業', defaultNote:'114畢業（首屆）' },
  { id:'B12310049', name:'游佩軒', dept:'社工系', grade:3, year:113 },
]

const COHORT_114 = [
  { id:'B13302107', name:'孫珮珈', dept:'政治系政論組', grade:2, year:114 },
  { id:'B12302144', name:'黃彩慈', dept:'政治系政論組', grade:3, year:114 },
  { id:'B13302230', name:'金柔旼', dept:'政治系國關組', grade:2, year:114 },
  { id:'B12302152', name:'蕭博仁', dept:'政治系國關組', grade:3, year:114 },
  { id:'B13302308', name:'蔡佳芸', dept:'政治系公行組', grade:2, year:114 },
  { id:'B13302332', name:'張芷瑜', dept:'政治系公行組', grade:2, year:114, defaultStatus:'放棄', defaultNote:'114-2放棄更換雙主修' },
  { id:'B13302342', name:'褚芳妘', dept:'政治系公行組', grade:2, year:114 },
  { id:'B12302314', name:'陳麗庭', dept:'政治系公行組', grade:3, year:114 },
  { id:'B13303035', name:'朱皓瑋', dept:'經濟系', grade:2, year:114 },
  { id:'B13303056', name:'黃冠予', dept:'經濟系', grade:2, year:114 },
  { id:'B13303057', name:'蔡睿燊', dept:'經濟系', grade:2, year:114 },
  { id:'B13303062', name:'林天麗', dept:'經濟系', grade:2, year:114 },
  { id:'B13303153', name:'詹舒宇', dept:'經濟系', grade:2, year:114 },
  { id:'B12302147', name:'詹怡安', dept:'經濟系', grade:3, year:114 },
  { id:'B12303010', name:'林宜萱', dept:'經濟系', grade:3, year:114 },
  { id:'B12303122', name:'林冠廷', dept:'經濟系', grade:3, year:114 },
  { id:'B12305003', name:'高唯琮', dept:'社會系', grade:3, year:114 },
  { id:'B12305019', name:'李芸熏', dept:'社會系', grade:3, year:114 },
  { id:'B12305025', name:'張佳瑩', dept:'社會系', grade:3, year:114 },
  { id:'B12305040', name:'吳士宏', dept:'社會系', grade:3, year:114 },
  { id:'B11305035', name:'吳秉霖', dept:'社會系', grade:4, year:114 },
  { id:'B11305043', name:'陳孝祤', dept:'社會系', grade:4, year:114, defaultStatus:'放棄', defaultNote:'114-2放棄' },
  { id:'B11310045', name:'林芷妤', dept:'社工系', grade:4, year:114 },
  { id:'B12702083', name:'徐苡茜', dept:'會計系', grade:3, year:114 },
  { id:'B12702097', name:'陳彥蓁', dept:'會計系', grade:3, year:114 },
  { id:'B11302211', name:'吳和華', dept:'會計系', grade:4, year:114 },
  { id:'B12703015', name:'楊政諺', dept:'財金系', grade:3, year:114 },
  { id:'B12801022', name:'賴禾凱', dept:'公衛系', grade:3, year:114 },
  { id:'B11H04006', name:'李　蕎', dept:'運動學士學程', grade:4, year:114, defaultStatus:'放棄', defaultNote:'已轉入政治系' },
]


const STATUS_OPTIONS = ['正常修習', '延修', '休學', '放棄', '畢業', '待確認']
const STATUS_COLORS = { '正常修習':'#27ae60', '延修':'#c47c1a', '休學':'#8a3a5a', '放棄':'#b5451b', '畢業':'#2e6b8a', '待確認':'#888' }

function CohortTable({ students, persist, sections, budgetState, freeNote, completedNotes, heartColors, statusData, setStatusData }) {
  return (
    <div style={{ background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'100px 80px 150px 1fr 120px', background:'#1c1c1c', padding:'8px 16px', gap:8 }}>
        {['姓名','年級','系所','就讀情形備註','修習狀態'].map(h => (
          <div key={h} style={{ fontSize:12, fontWeight:'bold', color:'#f2ede6' }}>{h}</div>
        ))}
      </div>
      {students.map((s, i) => (
        <StatusRow key={s.id} s={s} i={i}
          stKey={`status-${s.id}`} noteKey={`status-note-${s.id}`}
          statusOptions={STATUS_OPTIONS} statusColors={STATUS_COLORS}
          persist={persist} sections={sections} budgetState={budgetState} freeNote={freeNote}
          completedNotes={completedNotes} heartColors={heartColors}
          statusData={statusData} setStatusData={setStatusData}
        />
      ))}
    </div>
  )
}


function MentorRow({ m, i }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display:'grid', gridTemplateColumns:'160px 1fr auto', padding:'10px 16px', background: i%2===0 ? '#fff' : '#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:12 }}>
      <div style={{ fontSize:13.5, color:'#1c1c1c' }}>
        {m.name}
        {m.note && <span style={{ fontSize:10, color:'#b5451b', marginLeft:6, background:'#fde8e3', padding:'1px 6px', borderRadius:3 }}>{m.note}</span>}
      </div>
      <div style={{ fontSize:13, color:'#555', fontFamily:'monospace' }}>{m.email}</div>
      <button
        onClick={() => { navigator.clipboard.writeText(m.email); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
        style={{ fontSize:10, padding:'3px 8px', background: copied?'#27ae60':'#f0ede8', color: copied?'#fff':'#666', border:'none', borderRadius:3, cursor:'pointer', whiteSpace:'nowrap', transition:'background 0.2s' }}
      >{copied ? '✓' : '複製'}</button>
    </div>
  )
}

function LeftStudents({ students }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop:8 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ fontSize:11.5, color:'#999', background:'#f5f2ee', border:'1px solid #e0dbd4', borderRadius:4, padding:'4px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
        <span>{open ? '▲' : '▼'}</span>
        <span>已離開 {students.length} 人</span>
      </button>
      {open && (
        <div style={{ marginTop:6, background:'#fff', borderRadius:8, border:'1px solid #e0dbd4', overflow:'hidden', opacity:0.75 }}>
          <div style={{ display:'grid', gridTemplateColumns:'80px 100px 160px 1fr', background:'#888', padding:'7px 16px', gap:8 }}>
            {['學號','姓名','系所','狀態'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:'bold', color:'#fff' }}>{h}</div>
            ))}
          </div>
          {students.map((s, i) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'80px 100px 160px 1fr', padding:'8px 16px', background: i%2===0 ? '#fafaf8' : '#f5f2ee', borderTop:'1px solid #f0ede8', gap:8, alignItems:'center' }}>
              <div style={{ fontSize:11, color:'#aaa', fontFamily:'monospace' }}>{s.id}</div>
              <div style={{ fontSize:13, color:'#999' }}>{s.name}</div>
              <div style={{ fontSize:11.5, color:'#aaa' }}>{s.dept}</div>
              <div style={{ fontSize:11.5, color:'#b5451b' }}>{s.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusRow({ s, i, stKey, noteKey, statusOptions, statusColors, persist, sections, budgetState, freeNote, completedNotes, heartColors, statusData, setStatusData }) {
  const status = statusData[stKey] !== undefined ? statusData[stKey] : (s.defaultStatus || '正常修習')
  const note   = statusData[noteKey] !== undefined ? statusData[noteKey] : (s.defaultNote || '')
  const color  = statusColors[status] || '#888'

  async function update(key, val) {
    const next = { ...statusData, [key]: val }
    setStatusData(next)
    persist(sections, budgetState, freeNote, completedNotes, heartColors, next)

    // 連動通訊錄：狀態改為放棄/畢業 → 移到已離開；改回其他 → 還原
    if (key === stKey) {
      try {
        const contacts = await storageGet('contacts_115')
        if (!contacts) return
        const LEFT = ['放棄', '畢業']
        const noteVal = next[noteKey] !== undefined ? next[noteKey] : (s.defaultNote || '')
        // 判斷是 113 還是 114
        const cohortKey = s.year === 113 ? 'students113' : 'students114'
        const updated = contacts[cohortKey].map(stu => {
          if (stu.id !== s.id) return stu
          if (LEFT.includes(val)) {
            return { ...stu, left: true, leftReason: noteVal || val }
          } else {
            return { ...stu, left: false, leftReason: '' }
          }
        })
        await storageSet('contacts_115', { ...contacts, [cohortKey]: updated })
      } catch(e) { console.error('通訊錄連動失敗', e) }
    }
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'100px 80px 150px 1fr 120px', padding:'10px 16px', background: i%2===0 ? '#fff' : '#f9f6f2', borderTop:'1px solid #f0ede8', alignItems:'center', gap:8 }}>
      <div style={{ fontSize:13.5, fontWeight:'bold', color:'#1c1c1c' }}>{s.name}</div>
      <div style={{ fontSize:12, color:'#666' }}>{s.grade}年級</div>
      <div style={{ fontSize:12, color:'#555' }}>{s.dept}</div>
      <input
        value={note}
        onChange={e => update(noteKey, e.target.value)}
        placeholder="備註就讀情形…"
        style={{ fontSize:12, border:'none', borderBottom:'1px solid #e0dbd4', background:'transparent', outline:'none', color:'#333', fontFamily:'Georgia,serif', padding:'2px 4px', width:'100%' }}
      />
      <select
        value={status}
        onChange={e => update(stKey, e.target.value)}
        style={{ fontSize:11.5, padding:'4px 6px', border:`1px solid ${color}`, borderRadius:4, color, background:'#fff', cursor:'pointer', fontFamily:'Georgia,serif' }}
      >
        {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}


// ── 獵戶座臨時事項 ────────────────────────────────────────────────────────────
const ORION_STARS = [
  { x:28, y:22, name:'參宿四', r:5.5 },
  { x:72, y:18, name:'參宿五', r:4.5 },
  { x:38, y:58, name:'參宿一', r:3.5 },
  { x:50, y:63, name:'參宿二', r:4 },
  { x:63, y:58, name:'參宿三', r:3.5 },
  { x:22, y:100, name:'參宿六', r:5 },
  { x:78, y:96, name:'參宿七', r:5.5 },
]
const ORION_LINES = [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]]
const STAR_COLORS = ['#fff7ae','#aee8ff','#ffcfae','#cfaeff','#aeffcf','#ffaeae','#aecfff']

function OrionConstellation({ items, onChange }) {
  const [active, setActive] = useState(null) // starIdx 正在輸入
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (active !== null && inputRef.current) inputRef.current.focus()
  }, [active])

  function handleStarClick(idx) {
    const item = items[idx]
    if (item) {
      // 已有內容：點擊完成並消失
      const next = { ...items }
      delete next[idx]
      onChange(next)
    } else {
      // 空星：開始輸入
      setActive(idx)
      setInputVal('')
    }
  }

  function handleSubmit(idx) {
    if (!inputVal.trim()) { setActive(null); return }
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    onChange({ ...items, [idx]: { text: inputVal.trim(), color } })
    setActive(null)
    setInputVal('')
  }

  const filled = Object.keys(items).length
  const total = ORION_STARS.length

  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', gap:8 }}>
      {/* SVG 星座圖 */}
      <svg width={100} height={120} viewBox="0 0 100 120" style={{ flexShrink:0, cursor:'pointer' }}>
        {/* 連線 */}
        {ORION_LINES.map(([a,b], i) => {
          const sa = ORION_STARS[a], sb = ORION_STARS[b]
          const bothFilled = items[a] && items[b]
          return (
            <line key={i} x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
              stroke={bothFilled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'}
              strokeWidth={bothFilled ? 1.8 : 1.2} />
          )
        })}
        {/* 星點 */}
        {ORION_STARS.map((s, idx) => {
          const item = items[idx]
          const color = item ? item.color : 'rgba(255,255,255,0.25)'
          return (
            <g key={idx} onClick={() => handleStarClick(idx)} style={{ cursor:'pointer' }}>
              <circle cx={s.x} cy={s.y} r={s.r + 7} fill="transparent" />
              <circle cx={s.x} cy={s.y} r={s.r * 1.6}
                fill={color}
                style={{ filter: item ? `drop-shadow(0 0 4px ${color})` : 'none', transition:'all 0.2s' }} />
              {item && (
                <circle cx={s.x} cy={s.y} r={s.r * 1.6 + 3}
                  fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
              )}
            </g>
          )
        })}
      </svg>

      {/* 提示文字 */}
      {filled === 0 && (
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em', lineHeight:1.4 }}>
          點星星<br/>新增臨時事項
        </div>
      )}

      {/* 輸入框（浮出） */}
      {active !== null && (
        <div style={{ position:'absolute', top:130, left:0, background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'10px 12px', zIndex:200, minWidth:200, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>{ORION_STARS[active].name} · 臨時事項</div>
          <input ref={inputRef} value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter') handleSubmit(active); if(e.key==='Escape') setActive(null) }}
            placeholder="輸入事項，Enter 確認"
            style={{ width:'100%', fontSize:12, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:4, color:'#fff', padding:'5px 8px', outline:'none', fontFamily:'Georgia,serif', boxSizing:'border-box' }} />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:8 }}>
            <button onClick={() => setActive(null)} style={{ fontSize:10, padding:'3px 8px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', borderRadius:3, color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>取消</button>
            <button onClick={() => handleSubmit(active)} style={{ fontSize:10, padding:'3px 10px', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:3, color:'#fff', cursor:'pointer' }}>確認</button>
          </div>
        </div>
      )}

      {/* 已填事項列表（星星旁邊） */}
      {filled > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:3, maxWidth:160 }}>
          {ORION_STARS.map((s, idx) => {
            const item = items[idx]
            if (!item) return null
            return (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ color: item.color, fontSize:10 }}>★</span>
                <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.85)', lineHeight:1.3, flex:1 }}>{item.text}</span>
                <button onClick={() => handleStarClick(idx)}
                  style={{ fontSize:9, color:'rgba(255,255,255,0.3)', background:'transparent', border:'none', cursor:'pointer', padding:'0 2px' }}>✓</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


export default function App() {
  const [sections, setSections]           = useState(null)
  const [budgetState, setBudgetState]     = useState(null)
  const [freeNote, setFreeNote]           = useState('')
  const [activeTab, setActiveTab]         = useState('work')
  const [orionItems, setOrionItems]       = useState({}) // { starIdx: { text, color } | null }
  const [activeMonth, setActiveMonth]     = useState(null)
  const [editingNote, setEditingNote]     = useState(null)
  const [completedNotes, setCompletedNotes] = useState({})
  const [statusData, setStatusData] = useState({})
  const [currentYear, setCurrentYear] = useState(115)
  const [currentMonthId, setCurrentMonthId] = useState('now')
  const [heartColors, setHeartColors] = useState({})
  const [colorPickerOpen, setColorPickerOpen] = useState(null)
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
          if (saved.completedNotes) setCompletedNotes(saved.completedNotes)
          if (saved.heartColors) setHeartColors(saved.heartColors)
          if (saved.statusData) setStatusData(saved.statusData)
          if (saved.currentYear) setCurrentYear(saved.currentYear)
          if (saved.currentMonthId) setCurrentMonthId(saved.currentMonthId)
          if (saved.orionItems) setOrionItems(saved.orionItems)
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
  async function persist(sec, bud, fn, cn, hc, sd, oi) {
    setSaving(true)
    const _cn = cn !== undefined ? cn : completedNotes
    const _hc = hc !== undefined ? hc : heartColors
    const _sd = sd !== undefined ? sd : statusData
    const _oi = oi !== undefined ? oi : orionItems
    try {
      await storageSet(DB_KEY, { sections: sec, budget: bud, freeNote: fn, completedNotes: _cn, heartColors: _hc, statusData: _sd, currentYear, currentMonthId, orionItems: _oi, updatedAt: new Date().toISOString() })
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

  function updateCompletedNote(monthId, itemId, val) {
    const next = { ...completedNotes, [`${monthId}-${itemId}`]: val }
    setCompletedNotes(next)
    persist(sections, budgetState, freeNote, next, heartColors)
  }

  function updateHeartColor(monthId, itemId, color) {
    const next = { ...heartColors, [`${monthId}-${itemId}`]: color }
    setHeartColors(next)
    setColorPickerOpen(null)
    persist(sections, budgetState, freeNote, completedNotes, next)
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
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <OrionConstellation items={orionItems} onChange={next => { setOrionItems(next); persist(sections, budgetState, freeNote, completedNotes, heartColors, statusData, next) }} />
            <div style={{ textAlign:'right' }}>
              {activeTab === 'work'
                ? <div style={{ fontFamily:'monospace', fontSize:20 }}>{totalDone}<span style={{color:'#555',fontSize:14}}>/{totalItems}</span> <span style={{fontSize:11,color:'#666'}}>完成</span></div>
                : <div style={{ fontFamily:'monospace', fontSize:14, color:'#888' }}>支出 {fmt(grandSpent)} <span style={{color:'#555'}}>/ {fmt(grandTotal)}</span></div>
              }
              <div style={{ fontSize:10, color: statusColor, fontFamily:'monospace', marginTop:2 }}>{statusText}</div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {[['work','工作時程'],['budget','預算控管'],['timeline','時間軸'],['contacts','通訊錄'],['status','修習狀態'],['notes','工作筆記']].map(([key, label]) => (
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
            {/* 目前月份設定 */}
            <div style={{ background:'#1c1c1c', borderRadius:6, padding:'8px 10px', marginBottom:2 }}>
              <div style={{ fontSize:9, color:'#888', fontFamily:'monospace', marginBottom:4, letterSpacing:'0.1em' }}>設定「現在」</div>
              <select
                value={currentMonthId}
                onChange={e => { setCurrentMonthId(e.target.value); persist(sections, budgetState, freeNote, completedNotes, heartColors, statusData, e.target.value) }}
                style={{ width:'100%', fontSize:12, padding:'3px 4px', border:'1px solid #444', borderRadius:4, background:'#2a2a2a', color:'#f2ede6', cursor:'pointer' }}
              >
                {MONTHS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>

            {sections.map((month, idx) => {
              const orig = MONTHS[idx]
              const done = month.items.filter(i => i.done).length
              const total = month.items.length
              const isActive = activeMonth === month.id
              const isCurrent = month.id === currentMonthId
              // 計算「上個月」未完成事項數量（結轉提示）
              const currentIdx = MONTHS.findIndex(m => m.id === currentMonthId)
              const prevMonth = currentIdx > 0 ? sections[currentIdx - 1] : null
              const carryOverCount = isCurrent && prevMonth ? prevMonth.items.filter(i => !i.done).length : 0
              return (
                <button key={month.id} className="note-card" onClick={() => setActiveMonth(isActive ? null : month.id)}
                  style={{ width:'100%', background: isActive ? orig.color : '#fff', color: isActive ? '#fff' : '#1c1c1c', border: isCurrent ? `3px solid ${orig.color}` : `2px solid ${orig.color}`, borderRadius:6, padding:'12px 10px 10px', cursor:'pointer', textAlign:'left', position:'relative', boxShadow: isActive ? `0 4px 14px ${orig.color}55` : isCurrent ? `0 0 0 2px ${orig.color}33` : '2px 3px 8px rgba(0,0,0,0.09)', transition:'all 0.18s ease', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ position:'absolute', top:7, right:10, width:8, height:8, borderRadius:'50%', background: isActive ? 'rgba(255,255,255,0.5)' : orig.color, opacity:0.8 }} />
                  <div>
                    <div style={{ fontSize:18, fontWeight:'bold', lineHeight:1 }}>{orig.label}</div>
                    <div style={{ fontSize:10, opacity:0.6, marginTop:2, letterSpacing:'0.06em' }}>
                      {isCurrent ? '現在' : (orig.sub || '')}
                    </div>
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
                    {carryOverCount > 0 && (
                      <div style={{ marginTop:6, fontSize:9, color: isActive ? '#fff' : '#b5451b', background: isActive ? 'rgba(255,255,255,0.2)' : '#fde8e3', borderRadius:3, padding:'2px 5px', fontWeight:'bold' }}>
                        ⚠ {prevMonth.label}有 {carryOverCount} 件未完成
                      </div>
                    )}
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
                <div style={{ background:activeOriginal.color, color:'#fff', borderRadius:'10px 10px 0 0', padding:'18px 24px 14px' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: activeData.items.some(i=>i.done) ? 12 : 0 }}>
                    <div>
                      <div style={{ fontSize:10, letterSpacing:'0.18em', opacity:0.75, fontFamily:'monospace', marginBottom:3 }}>{activeOriginal.sub || '工作事項'}</div>
                      <div style={{ fontSize:24, fontWeight:'bold' }}>{activeOriginal.label}</div>
                    </div>
                    <div style={{ fontFamily:'monospace', fontSize:12, opacity:0.85 }}>{activeData.items.filter(i=>i.done).length} / {activeData.items.length} 完成</div>
                  </div>
                  {/* 已完成：愛心區（依顏色加入順序分組排列）*/}
                  {activeData.items.some(i=>i.done) && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.2)' }}>
                      {(() => {
                        const doneItems = activeData.items.filter(i=>i.done)
                        const colorOrder = []
                        doneItems.forEach(item => {
                          const c = heartColors[`${activeMonth}-${item.id}`] || '#ffffff'
                          if (!colorOrder.includes(c)) colorOrder.push(c)
                        })
                        const sorted = [...doneItems].sort((a, b) => {
                          const ca = heartColors[`${activeMonth}-${a.id}`] || '#ffffff'
                          const cb = heartColors[`${activeMonth}-${b.id}`] || '#ffffff'
                          return colorOrder.indexOf(ca) - colorOrder.indexOf(cb)
                        })
                        return sorted
                      })().map(item => {
                        const key = `${activeMonth}-${item.id}`
                        const heartColor = heartColors[key] || '#ffffff'
                        const isPickerOpen = colorPickerOpen === key
                        const COLORS = [
                          { c:'#ffffff', label:'白' },
                          { c:'#f4a7b9', label:'粉' },
                          { c:'#f4874b', label:'橘' },
                          { c:'#f9d85e', label:'黃' },
                          { c:'#7bc67e', label:'綠' },
                          { c:'#7ec8e3', label:'藍' },
                          { c:'#b39ddb', label:'紫' },
                          { c:'#1a1a1a', label:'黑' },
                          { c:'#8d6e63', label:'褐' },
                          { c:'#9e9e9e', label:'灰' },
                        ]
                        return (
                          <div key={item.id} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.14)', borderRadius:20, padding:'5px 10px 5px 8px', position:'relative' }}>
                            {/* 愛心（點取消完成） */}
                            <span
                              onClick={() => toggleDone(activeMonth, item.id)}
                              title="點擊取消完成"
                              style={{ fontSize:16, lineHeight:1, cursor:'pointer', color: heartColor, userSelect:'none', textShadow:'0 0 2px rgba(0,0,0,0.3)' }}
                            >♥</span>
                            {/* 色點（點選色） */}
                            <span
                              onClick={() => setColorPickerOpen(isPickerOpen ? null : key)}
                              style={{ width:8, height:8, borderRadius:'50%', background: heartColor, border:'1px solid rgba(255,255,255,0.5)', cursor:'pointer', display:'inline-block', flexShrink:0 }}
                            />
                            {/* 備註輸入 */}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={e => updateCompletedNote(activeMonth, item.id, e.currentTarget.textContent)}
                              style={{ display:'inline-block', minWidth:8, maxWidth:160, fontSize:11.5, color:'#fff', fontFamily:'Georgia,serif', outline:'none', borderBottom: completedNotes[key] ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.15)', padding:'1px 2px', whiteSpace:'nowrap', cursor:'text', lineHeight:1.5 }}
                              data-placeholder="備註"
                            >{completedNotes[key] || ''}</span>
                            {/* 色盤 */}
                            {isPickerOpen && (
                              <div style={{ position:'absolute', top:32, left:0, background:'#fff', borderRadius:10, padding:'10px', boxShadow:'0 4px 20px rgba(0,0,0,0.18)', display:'flex', gap:7, flexWrap:'wrap', width:164, zIndex:100 }}>
                                {COLORS.map(({ c, label }) => (
                                  <div key={c} onClick={() => updateHeartColor(activeMonth, item.id, c)}
                                    title={label}
                                    style={{ width:22, height:22, borderRadius:'50%', background:c, border: heartColor===c ? '2px solid #333' : '1px solid #ddd', cursor:'pointer', transition:'transform 0.1s' }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
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
                {/* 結轉提示：如果這是目前月份，且上個月有未完成事項 */}
                {(() => {
                  if (activeMonth !== currentMonthId) return null
                  const idx = MONTHS.findIndex(m => m.id === currentMonthId)
                  if (idx <= 0) return null
                  const prevSection = sections[idx - 1]
                  const prevOrig = MONTHS[idx - 1]
                  const carried = prevSection.items.filter(i => !i.done)
                  if (carried.length === 0) return null
                  return (
                    <div style={{ marginTop:14, background:'#fde8e3', border:`1px solid ${prevOrig.color}55`, borderRadius:8, overflow:'hidden' }}>
                      <div style={{ padding:'9px 16px', background:`${prevOrig.color}22`, fontSize:12, fontWeight:'bold', color:prevOrig.color }}>
                        ⚠ 延續自{prevOrig.label}（{carried.length} 件未完成）
                      </div>
                      {carried.map((item, i) => (
                        <div key={item.id} style={{ padding:'10px 16px', borderTop:'1px solid #f5e0db', display:'flex', gap:10, alignItems:'flex-start' }}>
                          <button onClick={() => toggleDone(prevOrig.id, item.id)} style={{ width:18, height:18, borderRadius:4, flexShrink:0, marginTop:2, border:`2px solid ${prevOrig.color}77`, background:'transparent', cursor:'pointer' }} />
                          <div>
                            <div style={{ fontSize:13, fontWeight:'bold', color:'#1c1c1c' }}>{item.text}</div>
                            <div style={{ fontSize:11, color:'#888', marginTop:2, whiteSpace:'pre-wrap' }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
                {/* 項目 */}
                <div style={{ background:'#fff', borderRadius:'0 0 10px 10px', border:`1px solid ${activeOriginal.color}44`, borderTop:'none', marginTop: activeMonth===currentMonthId ? 14 : 0 }}>
                  {activeData.items.filter(i => !i.done).length === 0 && (
                    <div style={{ padding:'28px', textAlign:'center', color:'#bbb', fontSize:13, fontStyle:'italic', borderRadius:'0 0 10px 10px' }}>
                      所有事項已完成
                    </div>
                  )}
                  {activeData.items.filter(i => !i.done).map((item, idx) => {
                    const todoItems = activeData.items.filter(i => !i.done)
                    const isEd = editingNote?.monthId === activeMonth && editingNote?.itemId === item.id
                    return (
                      <div key={item.id} style={{ padding:'16px 22px', borderBottom: idx < todoItems.length-1 ? '1px solid #f0ede8' : 'none', background:'#fff', borderRadius: idx === todoItems.length-1 ? '0 0 10px 10px' : 0 }}>
                        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                          <button onClick={() => toggleDone(activeMonth, item.id)} style={{ width:20, height:20, borderRadius:4, flexShrink:0, marginTop:3, border: item.done ? 'none' : `2px solid ${activeOriginal.color}77`, background: item.done ? activeOriginal.color : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                            {item.done && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:'bold', lineHeight:1.4, color: item.done ? '#bbb' : '#1c1c1c', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</div>
                            <div style={{ marginTop:5, fontSize:12.5, lineHeight:1.7, color: item.done ? '#ccc' : '#666', whiteSpace:'pre-wrap' }}>{item.desc}</div>
                            {item.attachment && (
                              <a href={item.attachment} download
                                style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:8, fontSize:12, padding:'5px 12px', background:activeOriginal.color, color:'#fff', borderRadius:5, textDecoration:'none', fontWeight:'bold' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>
                                {item.attachmentLabel || '下載附件'}
                              </a>
                            )}
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

      {/* ════════════════ 時間軸 ════════════════ */}
      {activeTab === 'timeline' && (
        <div style={{ display:'flex', flex:1, minHeight:0 }}>
          {/* 左側月份導覽 */}
          <div style={{ width:110, flexShrink:0, overflowY:'auto', padding:'16px 10px', display:'flex', flexDirection:'column', gap:6, borderRight:'1px solid #e0dbd4', background:'#ece8e1' }}>
            {[
              { id:'now', label:'六月', color:'#b5451b' },
              { id:'july', label:'七月', color:'#c47c1a' },
              { id:'august', label:'八月', color:'#5a7a3a' },
              { id:'sept', label:'九月', color:'#2e6b8a' },
              { id:'oct', label:'十月', color:'#5a3a8a' },
              { id:'nov', label:'十一月', color:'#8a3a5a' },
              { id:'dec', label:'十二月', color:'#b5451b' },
              { id:'jan', label:'一月', color:'#2e6b5a' },
            ].map(m => (
              <a key={m.id} href={`#tl-${m.id}`}
                style={{ display:'block', padding:'7px 10px', borderRadius:6, fontSize:13, fontWeight:'bold', color: m.id===currentMonthId ? '#fff' : m.color, background: m.id===currentMonthId ? m.color : '#fff', border:`1px solid ${m.color}44`, textDecoration:'none', textAlign:'center', transition:'all 0.15s', position:'relative' }}
                onMouseEnter={e => { if(m.id!==currentMonthId){e.target.style.background=m.color; e.target.style.color='#fff';} }}
                onMouseLeave={e => { if(m.id!==currentMonthId){e.target.style.background='#fff'; e.target.style.color=m.color;} }}
              >{m.label}{m.id===currentMonthId && <span style={{fontSize:9, marginLeft:4}}>●現在</span>}</a>
            ))}
          </div>

          {/* 右側時間軸 */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 28px 60px' }}>
            {/* 圖例 */}
            <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#999' }}>分類：</span>
              {[
                { color:'#2e6b8a', label:'院學士' },
                { color:'#8B5E3C', label:'東亞學程' },
                { color:'#4a7c59', label:'學程' },
                { color:'#666', label:'學校行事曆' },
              ].map(c => (
                <span key={c.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:c.color, display:'inline-block' }} />
                  <span style={{ color:'#555' }}>{c.label}</span>
                </span>
              ))}
            </div>

            {/* 各月時間軸 */}
            {[
              { id:'now', label:'六月', color:'#b5451b' },
              { id:'july', label:'七月', color:'#c47c1a' },
              { id:'august', label:'八月', color:'#5a7a3a' },
              { id:'sept', label:'九月', color:'#2e6b8a' },
              { id:'oct', label:'十月', color:'#5a3a8a' },
              { id:'nov', label:'十一月', color:'#8a3a5a' },
              { id:'dec', label:'十二月', color:'#b5451b' },
              { id:'jan', label:'一月', color:'#2e6b5a' },
            ].map(m => {
              const items = DEADLINES[m.id] || [];
              return (
                <div key={m.id} id={`tl-${m.id}`} style={{ marginBottom:36 }}>
                  {/* 月份標題 */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:m.color, flexShrink:0, boxShadow: m.id===currentMonthId ? `0 0 0 3px ${m.color}33` : 'none' }} />
                    <div style={{ fontSize:18, fontWeight:'bold', color:m.color }}>{m.label}</div>
                    {m.id===currentMonthId && <span style={{ fontSize:10, color:'#fff', background:m.color, padding:'2px 8px', borderRadius:10, fontWeight:'bold' }}>現在</span>}
                    <div style={{ flex:1, height:1, background:`${m.color}33` }} />
                    <div style={{ fontSize:11, color:'#bbb', fontFamily:'monospace' }}>{items.length} 件</div>
                  </div>

                  {/* 時間點 */}
                  <div style={{ marginLeft:22, borderLeft:`2px solid ${m.color}22`, paddingLeft:18 }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{
                        display:'flex', alignItems:'center', gap:14,
                        padding:'9px 0',
                        borderBottom: idx < items.length-1 ? '1px solid #f0ede8' : 'none',
                      }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:item.color, flexShrink:0, marginLeft:-22, marginRight:16 }} />
                        <div style={{ minWidth:80, fontSize:12, fontWeight:'bold', fontFamily:'monospace', color:item.color, flexShrink:0 }}>
                          {item.date}
                        </div>
                        <div style={{ fontSize:13.5, color:'#1c1c1c', flex:1 }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ════════════════ 通訊錄 ════════════════ */}
      {activeTab === 'contacts' && <Contacts />}

      {/* ════════════════ 修習狀態 ════════════════ */}
      {activeTab === 'status' && (() => {
        const COHORTS = [
          { key:'113', data: COHORT_113, color:'#b5451b', accent:'#f0d5cc' },
          { key:'114', data: COHORT_114, color:'#2e6b8a', accent:'#cce3ef' },
        ]
        // 計算各屆目前年級
        function calcGrade(entryYear, grade0) {
          return grade0 + (currentYear - (entryYear + grade0 - 1))
        }
        // 各狀態統計
        const STATUS_OPTIONS = ['正常修習', '延修', '休學', '放棄', '畢業', '待確認']
        const STATUS_COLORS = { '正常修習':'#27ae60', '延修':'#c47c1a', '休學':'#8a3a5a', '放棄':'#b5451b', '畢業':'#2e6b8a', '待確認':'#888' }
        const allStudents = [...COHORT_113, ...COHORT_114]
        const statusCount = {}
        STATUS_OPTIONS.forEach(o => { statusCount[o] = 0 })
        allStudents.forEach(s => {
          const st = statusData[`status-${s.id}`] !== undefined ? statusData[`status-${s.id}`] : (s.defaultStatus || '正常修習')
          statusCount[st] = (statusCount[st] || 0) + 1
        })
        const totalActive = (statusCount['正常修習'] || 0) + (statusCount['延修'] || 0) + (statusCount['休學'] || 0)

        return (
          <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 60px' }}>

            {/* ── 頂部：學年度設定 + 總覽 ── */}
            <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap', alignItems:'stretch' }}>
              {/* 學年度設定 */}
              <div style={{ background:'#1c1c1c', color:'#f2ede6', borderRadius:10, padding:'16px 20px', minWidth:160, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div style={{ fontSize:10, letterSpacing:'0.15em', color:'#888', fontFamily:'monospace', marginBottom:8 }}>目前學年度</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={() => { const y = currentYear-1; setCurrentYear(y); persist(sections, budgetState, freeNote, completedNotes, heartColors, statusData) }}
                    style={{ width:28, height:28, border:'1px solid #444', borderRadius:4, background:'transparent', color:'#f2ede6', cursor:'pointer', fontSize:16, lineHeight:1 }}>−</button>
                  <div style={{ fontSize:28, fontWeight:'bold', fontFamily:'monospace', minWidth:50, textAlign:'center' }}>{currentYear}</div>
                  <button onClick={() => { const y = currentYear+1; setCurrentYear(y); persist(sections, budgetState, freeNote, completedNotes, heartColors, statusData) }}
                    style={{ width:28, height:28, border:'1px solid #444', borderRadius:4, background:'transparent', color:'#f2ede6', cursor:'pointer', fontSize:16, lineHeight:1 }}>＋</button>
                </div>
                <div style={{ fontSize:10, color:'#666', marginTop:8, fontFamily:'monospace' }}>年級自動換算</div>
              </div>

              {/* 總人數 */}
              <div style={{ background:'#fff', border:'1px solid #e0dbd4', borderRadius:10, padding:'16px 20px', minWidth:140 }}>
                <div style={{ fontSize:10, letterSpacing:'0.12em', color:'#888', fontFamily:'monospace', marginBottom:6 }}>總修讀人數</div>
                <div style={{ fontSize:28, fontWeight:'bold', fontFamily:'monospace', color:'#1c1c1c' }}>{totalActive}</div>
                <div style={{ fontSize:11, color:'#aaa', marginTop:6 }}>共 {allStudents.length} 人（含已離開）</div>
              </div>

              {/* 各狀態數字 */}
              {STATUS_OPTIONS.map(opt => (
                <div key={opt} style={{ background:'#fff', border:`1px solid ${STATUS_COLORS[opt]}44`, borderRadius:10, padding:'14px 18px', minWidth:90 }}>
                  <div style={{ fontSize:9.5, letterSpacing:'0.1em', color: STATUS_COLORS[opt], fontFamily:'monospace', marginBottom:6 }}>{opt}</div>
                  <div style={{ fontSize:26, fontWeight:'bold', fontFamily:'monospace', color: STATUS_COLORS[opt] }}>{statusCount[opt] || 0}</div>
                </div>
              ))}
            </div>

            {/* ── 各屆並置兩欄 ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>
              {COHORTS.map(({ key, data, color, accent }) => {
                const active = data.filter(s => {
                  const st = statusData[`status-${s.id}`] !== undefined ? statusData[`status-${s.id}`] : (s.defaultStatus || '正常修習')
                  return !['放棄','畢業'].includes(st)
                }).length
                return (
                  <div key={key} style={{ background:'#fff', borderRadius:10, border:`1px solid ${color}33`, overflow:'hidden' }}>
                    {/* 屆別標題 */}
                    <div style={{ background:color, padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ color:'#fff', fontWeight:'bold', fontSize:16 }}>{key}學年度入學</div>
                      <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, fontFamily:'monospace' }}>在籍 {active}/{data.length}</div>
                    </div>
                    {/* 表頭 */}
                    <div style={{ display:'grid', gridTemplateColumns:'64px 72px 1fr 90px', background:'#f5f2ee', padding:'6px 14px', gap:6, borderBottom:'1px solid #e8e5e0' }}>
                      {['姓名','年級','就讀情形','狀態'].map(h => (
                        <div key={h} style={{ fontSize:10.5, fontWeight:'bold', color:'#888' }}>{h}</div>
                      ))}
                    </div>
                    {/* 學生列 */}
                    {data.map((s, i) => {
                      const stKey = `status-${s.id}`
                      const noteKey = `status-note-${s.id}`
                      const status = statusData[stKey] !== undefined ? statusData[stKey] : (s.defaultStatus || '正常修習')
                      const note = statusData[noteKey] !== undefined ? statusData[noteKey] : (s.defaultNote || '')
                      const stColor = STATUS_COLORS[status] || '#888'
                      const currentGrade = s.year + (currentYear - s.year) - (s.grade - 1) + (s.grade - 1)
                      // 入學年 = s.year，目前年級 = currentYear - s.year + 1
                      const grade = currentYear - s.year + 1
                      const isLeft = ['放棄','畢業'].includes(status)
                      return (
                        <div key={s.id} style={{ display:'grid', gridTemplateColumns:'64px 72px 1fr 90px', padding:'8px 14px', background: isLeft ? '#fafaf8' : (i%2===0?'#fff':'#f9f9f9'), borderTop:'1px solid #f0ede8', gap:6, alignItems:'center', opacity: isLeft ? 0.55 : 1 }}>
                          <div style={{ fontSize:12.5, fontWeight:'bold', color:'#1c1c1c' }}>{s.name}</div>
                          <div style={{ fontSize:11, color:'#666' }}>{grade}年級</div>
                          <input
                            value={note}
                            onChange={e => {
                              const next = { ...statusData, [noteKey]: e.target.value }
                              setStatusData(next)
                              persist(sections, budgetState, freeNote, completedNotes, heartColors, next)
                            }}
                            placeholder="備註…"
                            style={{ fontSize:11, border:'none', borderBottom:'1px solid #e8e5e0', background:'transparent', outline:'none', color:'#555', fontFamily:'Georgia,serif', padding:'1px 3px', width:'100%' }}
                          />
                          <select
                            value={status}
                            onChange={async e => {
                              const val = e.target.value
                              const next = { ...statusData, [stKey]: val }
                              setStatusData(next)
                              persist(sections, budgetState, freeNote, completedNotes, heartColors, next)
                              // 連動通訊錄
                              try {
                                const contacts = await storageGet('contacts_115')
                                if (!contacts) return
                                const cohortKey = s.year === 113 ? 'students113' : 'students114'
                                const noteVal = next[noteKey] !== undefined ? next[noteKey] : (s.defaultNote || '')
                                const updated = contacts[cohortKey].map(stu =>
                                  stu.id !== s.id ? stu :
                                  ['放棄','畢業'].includes(val)
                                    ? { ...stu, left:true, leftReason: noteVal || val }
                                    : { ...stu, left:false, leftReason:'' }
                                )
                                await storageSet('contacts_115', { ...contacts, [cohortKey]: updated })
                              } catch(e) { console.error('通訊錄連動失敗', e) }
                            }}
                            style={{ fontSize:10.5, padding:'3px 4px', border:`1px solid ${stColor}`, borderRadius:4, color: stColor, background:'#fff', cursor:'pointer', fontFamily:'Georgia,serif' }}
                          >
                            {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ════════════════ 工作筆記 ════════════════ */}
      {activeTab === 'notes' && <Notes />}

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
