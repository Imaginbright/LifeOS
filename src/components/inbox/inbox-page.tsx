"use client";
import { CheckCheck } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import { EmptyState, PageHeader } from "@/components/shared/primitives";
import { todayDate } from "@/lib/date";
import { InboxItem } from "./inbox-item";
export function InboxPage() {
  const { inbox, markRead } = useApp();
  const today = todayDate();
  const unread = inbox.filter((item) => !item.read).length;
  return (
    <>
      <PageHeader
        eyebrow="On your radar"
        title="A little heads-up."
        description={`${unread} unread ${unread === 1 ? "notification" : "notifications"}. Just the things worth your attention.`}
        action={
          <button
            className="button secondary"
            disabled={!unread}
            onClick={() => markRead()}
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        }
      />
      {inbox.length ? (
        <div className="full-inbox">
          {["Today", "Earlier"].map((group) => {
            const items = inbox.filter((item) =>
              group === "Today"
                ? item.date.startsWith(today)
                : !item.date.startsWith(today),
            );
            return (
              items.length > 0 && (
                <section key={group}>
                  <div className="inbox-group-heading">
                    <h2>{group}</h2>
                    <span>{items.length}</span>
                  </div>
                  <div className="card">
                    {items.map((item) => (
                      <InboxItem item={item} key={item.id} />
                    ))}
                  </div>
                </section>
              )
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            title="You're all caught up."
            description="When something needs your attention, it will be here."
          />
        </div>
      )}
    </>
  );
}
