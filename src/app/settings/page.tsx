import { SettingsPage } from "@/components/settings/settings-page";
export const metadata = { title: "Settings" };
export default async function Page({ searchParams }: { searchParams: Promise<{ social?: string }> }) {
  const { social } = await searchParams;
  return <SettingsPage noticeKey={social} />;
}
