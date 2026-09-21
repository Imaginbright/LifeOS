"use client";
import Link from "next/link";
import {
  CreditCard,
  CheckCheck,
  Flag,
  ChartNoAxesCombined,
  BookOpen,
  CalendarDays,
  Bell,
  X,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import type { InboxItem as InboxItemType } from "@/lib/types";
import { cn, shortDate } from "@/lib/utils";
const icons = {
  Subscription: CreditCard,
  Tasks: CheckCheck,
  Goals: Flag,
  Creator: ChartNoAxesCombined,
  Review: BookOpen,
  Calendar: CalendarDays,
  System: Bell,
};
export function InboxItem({
  item,
  compact = false,
}: {
  item: InboxItemType;
  compact?: boolean;
}) {
  const { markRead, dismiss } = useApp();
  const Icon = icons[item.category];
  return (
    <article
      className={cn("inbox-item", !item.read && "unread", compact && "compact")}
    >
      <span className={`inbox-icon category-${item.category.toLowerCase()}`}>
        <Icon size={18} strokeWidth={1.6} />
      </span>
      <div className="inbox-content">
        {!compact && <span className="eyebrow">{item.category}</span>}
        <Link
          href={item.href}
          onClick={() => markRead(item.id)}
          className="inbox-title"
        >
          {item.title}
        </Link>
        <p>{item.description}</p>
        {!compact && (
          <div className="inbox-item-bottom">
            <span>{shortDate(item.date)}</span>
            <Link href={item.href} onClick={() => markRead(item.id)}>
              {item.action}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </div>
      {compact ? (
        <span className={item.read ? "read-dot" : "unread-dot"} />
      ) : (
        <div className="inbox-actions">
          {!item.read && (
            <button
              className="icon-button"
              aria-label={`Mark read: ${item.title}`}
              onClick={() => markRead(item.id)}
            >
              <Check size={17} />
            </button>
          )}
          <button
            className="icon-button"
            aria-label={`Dismiss: ${item.title}`}
            onClick={() => dismiss(item.id)}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </article>
  );
}
