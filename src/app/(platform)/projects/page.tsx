import { requireUser } from "@/server/auth/guards";
import { projectService } from "@/services/project/project-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeMarkdown } from "@/components/safe-markdown";
import { CompleteTaskButton } from "@/features/learn/complete-task-button";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await projectService.list(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">پروژه‌ها</h1>
      {projects.map((project) => {
        const done = new Set(project.attempts.filter((item) => item.status !== "FAILED").map((item) => item.taskId));
        return (
          <Card key={project.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <CardTitle>{project.titleFa}</CardTitle>
              {project.isFinal ? <Badge tone="accent">نهایی</Badge> : null}
            </div>
            <SafeMarkdown content={project.descriptionMd} />
            <ul className="space-y-2">
              {project.tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                  <span>{task.titleFa}</span>
                  {done.has(task.id) ? (
                    <Badge tone="success">انجام شد</Badge>
                  ) : (
                    <CompleteTaskButton taskId={task.id} />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
