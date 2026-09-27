/**
 * GET  /api/tasks  — タスク一覧を取得
 * POST /api/tasks  — タスクを新規追加
 */

import { sql, rowToTask } from "@/lib/db";
import { type TaskStatus } from "@/lib/schema";

// GET: 全タスクを返す（作成日降順）
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, status, archived, created_at
      FROM tasks
      ORDER BY created_at DESC, updated_at DESC
    `;
    return Response.json(rows.map(rowToTask));
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

// POST: タスクを追加する
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id: string;
      name: string;
      status: TaskStatus;
    };

    const rows = await sql`
      INSERT INTO tasks (id, name, status)
      VALUES (${body.id}, ${body.name}, ${body.status})
      RETURNING id, name, status, archived, created_at
    `;
    return Response.json(rowToTask(rows[0]), { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
