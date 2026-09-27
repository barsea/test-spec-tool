/**
 * Server Component: タスクを DB から取得して Workspace に渡す。
 * データ取得は Server Component で直接 DB クエリ（/api/tasks を fetch しない）。
 *
 * force-dynamic: DB クエリを含むためビルド時の静的プリレンダリングを無効化。
 */

export const dynamic = "force-dynamic";

import { Workspace } from "@/components/workspace/Workspace";
import workspaceData from "@/data/workspace.json";
import { workspaceSchema } from "@/lib/schema";
import { sql, rowToTask } from "@/lib/db";

export default async function Page() {
  // ワークスペース設定を検証
  const wsResult = workspaceSchema.safeParse(workspaceData);
  if (!wsResult.success) {
    throw new Error(
      `workspace.json の形式が正しくありません: ${wsResult.error.issues[0]?.message}`,
    );
  }

  // DB からタスク一覧を取得
  let initialTasks;
  try {
    const rows = await sql`
      SELECT id, name, status, archived, created_at
      FROM tasks
      ORDER BY created_at DESC, updated_at DESC
    `;
    initialTasks = rows.map(rowToTask);
  } catch (error) {
    // テーブルが未作成の場合など
    throw new Error(
      `DB の取得に失敗しました。POST /api/init でテーブルを作成してください。\n${error}`,
    );
  }

  return (
    <Workspace
      initialTasks={initialTasks}
      workspace={wsResult.data}
    />
  );
}
