/**
 * PATCH /api/tasks/[id]  — タスクを更新（アーカイブ・復元・ステータス変更）
 */

import { sql, rowToTask } from "@/lib/db";
import { type TaskStatus } from "@/lib/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      archived?: boolean;
      status?: TaskStatus;
    };

    let rows;

    if (body.archived !== undefined && body.status !== undefined) {
      // archived と status を同時に更新
      rows = await sql`
        UPDATE tasks
        SET archived = ${body.archived}, status = ${body.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, status, archived, created_at
      `;
    } else if (body.archived !== undefined) {
      // アーカイブ / 復元
      rows = await sql`
        UPDATE tasks
        SET archived = ${body.archived}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, status, archived, created_at
      `;
    } else if (body.status !== undefined) {
      // ステータス変更
      rows = await sql`
        UPDATE tasks
        SET status = ${body.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, status, archived, created_at
      `;
    } else {
      return Response.json(
        { error: "更新するフィールドがありません" },
        { status: 400 },
      );
    }

    if (rows.length === 0) {
      return Response.json({ error: "タスクが見つかりません" }, { status: 404 });
    }
    return Response.json(rowToTask(rows[0]));
  } catch (error) {
    console.error("[PATCH /api/tasks/[id]]", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
