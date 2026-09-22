"use client";
import { Flag, ArrowUpRight, CalendarDays } from "lucide-react";
import { Progress } from "@/components/shared/primitives";
import { useApp } from "@/components/shared/app-provider";
import type { Goal } from "@/lib/types";
import { EntityActions } from "@/components/shared/entity-actions";
import { number, percent, shortDate, money } from "@/lib/utils";
export function GoalCard({
  goal,
  compact = false,
}: {
  goal: Goal;
  compact?: boolean;
}) {
  const { setEditingGoal, deleteGoal } = useApp();
  const progress = percent(goal.currentValue, goal.targetValue);
  const value = (v: number) => (goal.unit === "NGN" ? money(v) : number(v));
  return (
    <article className={compact ? "goal-preview" : "card goal-card"}>
      {!compact && (
        <div className="goal-top">
          <span className="soft-icon">
            <Flag size={21} />
          </span>
          <div className="goal-card-actions"><span className="tag">{goal.category}</span><EntityActions kind="goal" name={goal.title} onEdit={() => setEditingGoal(goal)} onDelete={() => deleteGoal(goal.id)} /></div>
        </div>
      )}
      <div className="goal-title">
        <h3>{goal.title}</h3>
        {compact && <button
          className="icon-button"
          aria-label={`Update ${goal.title}`}
          onClick={() => setEditingGoal(goal)}
        >
          <ArrowUpRight size={17} />
        </button>}
      </div>
      {!compact && <p className="goal-description">{goal.description}</p>}
      <div className="goal-numbers">
        <span>
          <strong>{value(goal.currentValue)}</strong>{" "}
          <span className="muted">
            / {value(goal.targetValue)}
            {goal.unit !== "NGN" && goal.unit !== "%" ? ` ${goal.unit}` : ""}
          </span>
        </span>
        <strong>
          {Math.round(progress)}
          <small>%</small>
        </strong>
      </div>
      <Progress
        label={`${goal.title} progress`}
        value={progress}
        className={
          goal.category === "Development" ? "sage-progress" : undefined
        }
      />
      <div className="goal-deadline">
        <CalendarDays size={13} />
        {shortDate(goal.deadline)}
        {!compact && (
          <span>{progress >= 100 ? "You did it" : "In progress"}</span>
        )}
      </div>
    </article>
  );
}
