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
        title="Goals"
        action={
          <AddButton onClick={() => setAddKind("goal")}>Add goal</AddButton>
        }
      />
      <div className="goals-page-label">
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
          action={
            <AddButton onClick={() => setAddKind("goal")}>Add goal</AddButton>
          }
        />
      )}
    </>
  );
}
