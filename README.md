# 院學士 × 學分學程 工作紀錄

## 快速開始

### 1. 在 StackBlitz 開啟

直接把整個 `worklog-app` 資料夾拖進 [stackblitz.com](https://stackblitz.com)，
或是新建一個 **Vite + React** 專案後把這些檔案覆蓋進去。

---

### 2. 建立 Supabase 資料表

在 [Supabase](https://supabase.com) 建立一個新專案，
然後到 **SQL Editor** 執行以下 SQL：

```sql
create table worklog (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

-- 允許匿名讀寫（不需要登入驗證的簡單版本）
alter table worklog enable row level security;
create policy "allow all" on worklog
  for all using (true) with check (true);
```

---

### 3. 填入環境變數

複製 `.env.example` 為 `.env`，填入你的 Supabase 設定：

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

這兩個值在 Supabase 後台 **Project Settings → API** 可以找到。

**StackBlitz**：直接在左側檔案列表新增 `.env` 檔案填入。  
**Netlify**：在 **Site configuration → Environment variables** 填入，
不需要 `.env` 檔案。

---

### 4. 部署到 Netlify

1. 把 StackBlitz 專案 Export 到 GitHub
2. 在 Netlify 連結該 GitHub repo
3. Build command：`npm run build`  
   Publish directory：`dist`
4. 在 Netlify 的 Environment variables 填入 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY`
5. 重新 Deploy

---

## 沒有設定 Supabase 時

環境變數未填入時，資料會自動 fallback 到 **localStorage**。
頂欄會顯示「本地暫存（未連 Supabase）」提醒。
這個模式下資料只存在當前瀏覽器，換裝置或清快取會遺失。

---

## 檔案結構

```
worklog-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example        ← 複製為 .env 填入環境變數
└── src/
    ├── main.jsx        ← React 進入點
    ├── App.jsx         ← 主元件（UI 邏輯）
    ├── data.js         ← 所有靜態資料（月份工作事項、預算）
    ├── storage.js      ← 存取層（Supabase 優先，fallback localStorage）
    └── supabase.js     ← Supabase client 初始化
```
