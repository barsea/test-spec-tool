/**
 * テスト仕様書管理ドメインのファクトリ関数。
 * 旧採用管理ドメインのファクトリ（createMinimalProfile / createMinimalScorecard）は
 * 3ペイン移行に伴い削除済み。
 */

import { type Task, type TaskStatus } from "@/lib/schema";

/** 新規タスクの最小構成を生成する。Workspace の addTask ハンドラから使用。 */
export function createTask(name: string, status: TaskStatus): Task {
  return {
    id: `t-${Date.now()}`,
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    status,
    sections: [],
    archived: false,
  };
}
