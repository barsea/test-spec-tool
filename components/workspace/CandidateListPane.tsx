"use client";

/**
 * Pane 1: タスク一覧
 *
 * タスクをステータス（作成中 / レビュー待ち / 完成）でグループ表示する。
 * アーカイブ済みは末尾の折りたたみグループに表示。
 */

import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type Task, type TaskStatus, TASK_STATUS_ORDER } from "@/lib/schema";
import {
  TASK_STATUS_LABELS,
  ARCHIVED_GROUP_LABEL,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";

type TaskListPaneProps = {
  tasks: Task[];
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
  onAddTask: (status: TaskStatus, name: string) => void;
  onArchiveTask: (id: string) => void;
  onRestoreTask: (id: string) => void;
};

export function TaskListPane({
  tasks,
  selectedTaskId,
  onSelectTask,
  onAddTask,
  onArchiveTask,
  onRestoreTask,
}: TaskListPaneProps) {
  const [addDialogStatus, setAddDialogStatus] = useState<TaskStatus | null>(
    null,
  );
  const [archiveTarget, setArchiveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);

  const statusGroups = TASK_STATUS_ORDER.map((status) => ({
    status,
    label: TASK_STATUS_LABELS[status],
    items: activeTasks.filter((t) => t.status === status),
  }));

  return (
    <section className="flex w-[260px] shrink-0 flex-col border-r border-border bg-background">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h2 className="truncate text-sm font-semibold text-foreground">
          タスク一覧
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-3 py-4">
          {statusGroups.map((group) => (
            <StatusGroup
              key={group.status}
              status={group.status}
              label={group.label}
              items={group.items}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onAddRequest={() => setAddDialogStatus(group.status)}
              onArchiveRequest={(id, name) => setArchiveTarget({ id, name })}
            />
          ))}
          {archivedTasks.length > 0 && (
            <ArchivedGroup
              label={ARCHIVED_GROUP_LABEL}
              items={archivedTasks}
              open={archivedOpen}
              onOpenChange={setArchivedOpen}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onRestore={onRestoreTask}
            />
          )}
        </div>
      </ScrollArea>

      {addDialogStatus && (
        <AddItemDialog
          open={addDialogStatus !== null}
          onOpenChange={(open) => {
            if (!open) setAddDialogStatus(null);
          }}
          title="タスクを追加"
          description={`「${TASK_STATUS_LABELS[addDialogStatus]}」にタスクを追加します`}
          fieldLabel="タスク名"
          fieldId="task-name"
          placeholder="例: #123 パスワードリセット実装"
          onAdd={(name) => {
            onAddTask(addDialogStatus!, name);
            setAddDialogStatus(null);
          }}
        />
      )}

      <DeleteConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="タスクをアーカイブしますか？"
        itemName={archiveTarget?.name ?? ""}
        description={`「${archiveTarget?.name ?? ""}」をアーカイブします。後で「アーカイブ済み」から復元できます。`}
        actionLabel="アーカイブ"
        onConfirm={() => {
          if (archiveTarget) {
            onArchiveTask(archiveTarget.id);
            setArchiveTarget(null);
          }
        }}
      />
    </section>
  );
}

// ===== ステータスグループ =====

function StatusGroup({
  status,
  label,
  items,
  selectedTaskId,
  onSelectTask,
  onAddRequest,
  onArchiveRequest,
}: {
  status: TaskStatus;
  label: string;
  items: Task[];
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
  onAddRequest: () => void;
  onArchiveRequest: (id: string, name: string) => void;
}) {
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-3 mb-1.5 flex items-center justify-between gap-2 bg-background px-5 py-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </h3>
          <Badge variant="secondary" size="xs">
            {items.length}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onAddRequest}
          aria-label={`${label} にタスクを追加`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-10 items-center justify-center rounded-md border border-dashed border-border/70 px-2">
          <p className="text-xs text-muted-foreground" aria-hidden>
            タスクなし
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {items.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              selected={task.id === selectedTaskId}
              onSelect={onSelectTask}
              onArchive={(id, name) => onArchiveRequest(id, name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== タスク行 =====

function TaskRow({
  task,
  selected,
  onSelect,
  onArchive,
}: {
  task: Task;
  selected: boolean;
  onSelect: (id: string) => void;
  onArchive: (id: string, name: string) => void;
}) {
  return (
    <li className="group/task relative">
      <button
        type="button"
        onClick={() => onSelect(task.id)}
        className={cn(
          "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2.5 text-left transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        )}
      >
        <p className="truncate text-sm">{task.name}</p>
        {task.createdAt && (
          <p
            className={cn(
              "text-xs",
              selected
                ? "text-accent-foreground/70"
                : "text-muted-foreground",
            )}
          >
            {task.createdAt}
          </p>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2",
                "opacity-0 transition-opacity",
                "group-hover/task:opacity-100 group-focus-within/task:opacity-100",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${task.name} の操作`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onArchive(task.id, task.name)}
            >
              <Archive />
              アーカイブ
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

// ===== アーカイブ済みグループ =====

function ArchivedGroup({
  label,
  items,
  open,
  onOpenChange,
  selectedTaskId,
  onSelectTask,
  onRestore,
}: {
  label: string;
  items: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        nativeButton={false}
        render={
          <div
            className={cn(
              "group/archived-trigger sticky top-0 z-10 -mx-3 mb-1.5 flex cursor-pointer items-center justify-between gap-2 bg-background px-5 py-1.5",
              "rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        }
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </h3>
          <Badge variant="secondary" size="xs">
            {items.length}
          </Badge>
        </div>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-[color,transform] group-hover/archived-trigger:text-foreground in-data-[panel-open]:rotate-180"
        />
        <span className="sr-only">{`${label}を開く`}</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ul className="flex flex-col gap-0.5">
          {items.map((task) => (
            <ArchivedTaskRow
              key={task.id}
              task={task}
              selected={task.id === selectedTaskId}
              onSelect={onSelectTask}
              onRestore={onRestore}
            />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ArchivedTaskRow({
  task,
  selected,
  onSelect,
  onRestore,
}: {
  task: Task;
  selected: boolean;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <li className="group/task relative">
      <button
        type="button"
        onClick={() => onSelect(task.id)}
        className={cn(
          "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2.5 text-left transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        )}
      >
        <p className="truncate text-sm text-muted-foreground">{task.name}</p>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2",
                "opacity-0 transition-opacity",
                "group-hover/task:opacity-100 group-focus-within/task:opacity-100",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${task.name} の操作`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onRestore(task.id)}>
              <ArchiveRestore />
              復元
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
