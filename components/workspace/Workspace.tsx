"use client";

/**
 * Workspace: 3 ペインの親コンポーネント（テスト仕様書管理）。
 *
 * レイアウト構造:
 * ```
 * <div className="flex h-screen flex-col">
 *   <GlobalHeader />                        // 全幅ヘッダー（h-12）
 *   <div className="flex flex-1">
 *     <TaskListPane />                      // Pane 1: タスク一覧（w-[260px]）
 *     <SpecEditorPane />                    // Pane 2: 仕様書エディタ（flex-1）
 *     <DetailMemoPane />                    // Pane 3: 詳細・メモ欄（w-[320px] | w-12）
 *   </div>
 * </div>
 * ```
 *
 * - Pane 3 は SelectedItem !== null かつ手動で閉じていない場合に展開
 * - 旧 SidebarProvider / PositionPane は 3 ペイン移行に伴い削除
 */

import { useState, useCallback } from "react";

import {
  type Task,
  type TaskStatus,
  type Section,
  type SelectedItem,
} from "@/lib/schema";
import { createTask } from "@/lib/data/factories";
import { GlobalHeader } from "@/components/workspace/GlobalHeader";
import { TaskListPane } from "@/components/workspace/CandidateListPane";
import { SpecEditorPane } from "@/components/workspace/CandidateDashboardPane";
import { DetailMemoPane } from "@/components/workspace/CandidateDetailPane";

type WorkspaceProps = {
  initialTasks: Task[];
  workspace: { name: string; icon: string };
};

export function Workspace({ initialTasks, workspace }: WorkspaceProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    initialTasks.find((t) => !t.archived)?.id ?? "",
  );
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [pane4ManuallyClosed, setPane4ManuallyClosed] = useState(false);

  // Pane 3 の展開状態を派生計算。
  const pane4Open = selectedItem !== null && !pane4ManuallyClosed;

  // アクティブタスクを取得。
  const activeTask =
    tasks.find((t) => t.id === selectedTaskId) ??
    tasks.find((t) => !t.archived) ??
    tasks[0];

  // ===== タスク操作 =====

  const selectTask = useCallback((id: string) => {
    setSelectedTaskId(id);
    setSelectedItem(null);
    setPane4ManuallyClosed(false);
  }, []);

  const addTask = useCallback((status: TaskStatus, name: string) => {
    const newTask = createTask(name, status);
    setTasks((prev) => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
    setSelectedItem(null);
    setPane4ManuallyClosed(false);
  }, []);

  const archiveTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, archived: true } : t));
      setSelectedTaskId((prevId) => {
        if (prevId !== id) return prevId;
        const fallback = next.find((t) => !t.archived);
        return fallback ? fallback.id : "";
      });
      return next;
    });
    setSelectedItem(null);
    setPane4ManuallyClosed(false);
  }, []);

  const restoreTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, archived: false } : t)),
    );
  }, []);

  // ===== セクション操作（SpecEditorPane と DetailMemoPane が共有） =====

  const updateActiveTaskSections = useCallback(
    (sections: Section[]) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTaskId ? { ...t, sections } : t,
        ),
      );
    },
    [selectedTaskId],
  );

  // ===== 詳細・メモ操作 =====

  const openDetail = useCallback((item: SelectedItem) => {
    setSelectedItem(item);
    setPane4ManuallyClosed(false);
  }, []);

  const togglePane4 = useCallback(() => {
    setPane4ManuallyClosed((v) => !v);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <GlobalHeader
        workspaceName={workspace.name}
        taskName={activeTask?.name ?? ""}
      />
      <div className="flex min-h-0 flex-1">
        <TaskListPane
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={selectTask}
          onAddTask={addTask}
          onArchiveTask={archiveTask}
          onRestoreTask={restoreTask}
        />
        {activeTask ? (
          <>
            <SpecEditorPane
              task={activeTask}
              selectedItem={selectedItem}
              onSelectItem={openDetail}
              onUpdateSections={updateActiveTaskSections}
            />
            <DetailMemoPane
              task={activeTask}
              selectedItem={selectedItem}
              pane4Open={pane4Open}
              onTogglePane4={togglePane4}
              onUpdateSections={updateActiveTaskSections}
            />
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              タスクがありません。左ペインから追加してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
