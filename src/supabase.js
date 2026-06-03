import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[worklog] Supabase 環境變數未設定。\n' +
    '請在 .env 填入 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。\n' +
    '資料將暫時存在 localStorage（重新整理後仍在，但換裝置會遺失）。'
  )
}

export const supabase = url && key ? createClient(url, key) : null
