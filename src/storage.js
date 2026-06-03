/**
 * storage.js
 * 統一的資料存取層。
 * - Supabase 可用時：讀寫 `worklog` 資料表的 key/value 欄位
 * - Supabase 未設定時：fallback 到 localStorage（本地暫存）
 *
 * Supabase 資料表建立 SQL（貼到 Supabase SQL Editor 執行一次）：
 *
 *   create table worklog (
 *     key   text primary key,
 *     value jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 *
 *   -- 允許匿名讀寫（若你不需要登入驗證）
 *   alter table worklog enable row level security;
 *   create policy "allow all" on worklog for all using (true) with check (true);
 */

import { supabase } from './supabase'

const LS_PREFIX = 'ntu_worklog_'

export async function storageGet(key) {
  if (supabase) {
    const { data, error } = await supabase
      .from('worklog')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error) throw error
    return data ? data.value : null
  } else {
    const raw = localStorage.getItem(LS_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  }
}

export async function storageSet(key, value) {
  if (supabase) {
    const { error } = await supabase
      .from('worklog')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
  } else {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value))
  }
}
