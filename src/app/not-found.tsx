import Link from "next/link";
import { EmptyState } from "@/components/shared/primitives";
export default function NotFound() {
  return (
    <div className="card">
      <EmptyState
        title="Page not found"
        description="The page you're looking for could not be found."
        action={
          <Link href="/" className="button primary">
            Back to your dashboard
          </Link>
        }
      />
    </div>
  );
}
