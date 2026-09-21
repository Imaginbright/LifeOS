import Link from "next/link";
import { EmptyState } from "@/components/shared/primitives";
export default function NotFound() {
  return (
    <div className="card">
      <EmptyState
        title="A little off the path."
        description="This page isn't part of your space yet."
        action={
          <Link href="/" className="button primary">
            Back to your dashboard
          </Link>
        }
      />
    </div>
  );
}
