import { Workspace } from "@/components/workspace/Workspace";
import tasksData from "@/data/tasks.json";
import workspaceData from "@/data/workspace.json";
import { tasksSchema, workspaceSchema } from "@/lib/schema";

export default function Page() {
  const tasksResult = tasksSchema.safeParse(tasksData);
  const wsResult = workspaceSchema.safeParse(workspaceData);

  if (!tasksResult.success || !wsResult.success) {
    const errors = [
      !tasksResult.success &&
        `tasks.json: ${tasksResult.error.issues[0]?.message}`,
      !wsResult.success &&
        `workspace.json: ${wsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  return (
    <Workspace
      initialTasks={tasksResult.data}
      workspace={wsResult.data}
    />
  );
}
