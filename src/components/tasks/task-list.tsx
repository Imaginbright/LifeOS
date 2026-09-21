"use client";
import { Check } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import { EmptyState, Progress } from "@/components/shared/primitives";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
export function TaskProgress({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((task) => task.completed).length;
  const value = tasks.length ? (completed / tasks.length) * 100 : 0;
  return (
    <div className="task-progress">
      <div>
        <span>
          <strong>{completed}</strong>
          <span className="muted"> / {tasks.length} completed</span>
        </span>
        <span className="progress-caption">{Math.round(value)}%</span>
      </div>
      <Progress value={value} label="Task completion" />
    </div>
  );
}
export function TaskRow({ task }: { task: Task }) {
  const { toggleTask } = useApp();
  return (
    <div className={cn("task-row", task.completed && "completed")}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          aria-label={`Complete ${task.title}`}
        />
        <span>{task.completed && <Check size={12} strokeWidth={3} />}</span>
      </label>
      <div className="task-name">
        <span>{task.title}</span>
        <small>{task.category}</small>
      </div>
      <span className={`priority ${task.priority.toLowerCase()}`}>
        <i />
        {task.priority}
      </span>
    </div>
  );
}
export function TaskList({ tasks }: { tasks: Task[] }) {
  return tasks.length ? (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskRow task={task} key={task.id} />
      ))}
    </div>
  ) : (
    <EmptyState
      title="Nothing planned for today."
      description="A little breathing room. Add a task when you're ready."
    />
  );
}
