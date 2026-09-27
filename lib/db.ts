/**
 * Neon（PostgreSQL）への接続とデータ変換ユーティリティ。
 *
 * @neondatabase/serverless の `neon()` は tagged template literal として使う。
 * Server Component や Route Handler（Node.js ランタイム）から直接呼ぶ。
 * Client Component からは呼ばない。
 */

import { neon } from "@neondatabase/serverless";
import type { Task } from "@/lib/schema";

// DATABASE_URL はサーバーサイドでのみ参照される環境変数
const sql = neon(process.env.DATABASE_URL!);
export { sql };

/**
 * DB の行（snake_case）を Task 型（camelCase）に変換する。
 * phase 1 では sections はまだ DB に保存しないため空配列を返す。
 *
 * Neon は DATE 型を JavaScript の Date オブジェクトとして返すため、
 * toISOString() で "YYYY-MM-DD" に変換する。
 */
export function rowToTask(row: Record<string, unknown>): Task {
  const raw = row.created_at;
  const createdAt =
    raw instanceof Date
      ? raw.toISOString().slice(0, 10)          // Date オブジェクト → "2026-09-27"
      : String(raw).slice(0, 10);               // 文字列の場合もスライスで対応

  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as Task["status"],
    createdAt,
    archived: row.archived as boolean,
    sections: [], // phase 2 で DB 保存対応予定
  };
}
