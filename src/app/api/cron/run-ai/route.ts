export async function POST() {
  const res = await fetch(
    `${process.env.AI_ENGINE_URL}/cron/run-daily-ai`,
    {
      method: "POST",
      headers: {
        "x-cron-secret": process.env.CRON_SECRET!,
      },
    }
  );

  if (!res.ok) {
    return new Response("AI cron failed", { status: 500 });
  }

  return Response.json({ status: "AI cron triggered" });
}
