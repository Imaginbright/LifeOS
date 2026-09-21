import { TasksPage } from "@/components/tasks/tasks-page";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/shared/skeletons";
export const metadata = { title: "Tasks" };
export default function Page() {
  return (
    <Suspense fallback={<CardSkeleton kind="chart" />}>
      <TasksPage />
    </Suspense>
  );
}
