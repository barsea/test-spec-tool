/**
 * POST /api/init
 *
 * tasks テーブルを作成する（IF NOT EXISTS なので何度呼んでも安全）。
 * 開発時にブラウザや curl で叩いてテーブルを初期化するためのエンドポイント。
 * 本番では削除するか認証を付けること。
 */

import { sql } from "@/lib/db";

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id         TEXT        PRIMARY KEY,
        name       TEXT        NOT NULL,
        status     TEXT        NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'review', 'done')),
        archived   BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at DATE        NOT NULL DEFAULT CURRENT_DATE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    return Response.json({
      ok: true,
      message: "tasks テーブルを作成しました（または既に存在します）",
    });
  } catch (error) {
    console.error("[api/init] テーブル作成エラー:", error);
    return Response.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
