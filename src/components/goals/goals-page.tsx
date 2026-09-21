"use client";
import { useApp } from "@/components/shared/app-provider";
import {
  AddButton,
  EmptyState,
  PageHeader,
} from "@/components/shared/primitives";
import { GoalCard } from "./goal-card";
export function GoalsPage() {
  const { goals, setAddKind } = useApp();
  return (
    <>
      <PageHeader
        eyebrow="Your next chapter"
        title="Good things take intention."
        description="A few meaningful goals. A little progress, every day."
        action={
          <AddButton onClick={() => setAddKind("goal")}>Add goal</AddButton>
        }
      />
      <div className="goals-page-label">
        <span className="eyebrow">What you’re working toward</span>
        <span>{goals.length} goals</span>
      </div>
      {goals.length ? (
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard goal={goal} key={goal.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No goals yet."
          description="Start with something that matters to you."
          action={
            <AddButton onClick={() => setAddKind("goal")}>Add goal</AddButton>
          }
        />
      )}
    </>
  );
}
