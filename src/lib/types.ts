export type Platform = "tiktok" | "instagram" | "youtube";
export type SocialAccount = {
  id: string;
  platform: Platform;
  displayName: string;
  metricLabel: string;
  followers: number;
  previousFollowers: number;
  change: number;
  changePercentage?: number;
};
export type SocialSnapshot = {
  platform: Platform;
  date: string;
  followers: number;
};
export type Category =
  "Content" | "Development" | "Personal" | "Admin" | "Health" | "Other";
export type Task = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High";
  category: Category;
  scope: "daily" | "monthly";
};
export type Goal = {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  category: string;
};
export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  billingCycle: "monthly" | "yearly" | "weekly" | "custom";
  customIntervalDays?: number;
  renewalDate: string;
  category: string;
  icon?: string;
  active: boolean;
};
export type InboxItem = {
  id: string;
  category:
    | "Subscription"
    | "Tasks"
    | "Goals"
    | "Creator"
    | "Review"
    | "Calendar"
    | "System";
  title: string;
  description: string;
  date: string;
  read: boolean;
  action: string;
  href: string;
};
export type CalendarItem = {
  id: string;
  title: string;
  date: string;
  category: "task" | "renewal" | "goal";
  href: string;
};
export type Preferences = {
  appearance: "light" | "dark" | "system";
  currency: Currency;
  startOfWeek: "sunday" | "monday";
  notifications: boolean;
  name: string;
};
