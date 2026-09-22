const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const publicEnv = () => ({
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
});

export function appUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("Missing required environment variable: NEXT_PUBLIC_APP_URL");
  return (configured ?? "http://localhost:3000").replace(/\/$/, "");
}

export { required };
