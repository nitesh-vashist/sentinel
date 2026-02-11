export async function POST(req: Request) {
  const isCron = req.headers.get("x-vercel-cron") === "1";

  console.log("AI cron endpoint hit");

  if (!isCron) {
    console.log("Blocked non-cron request");
    return new Response("Forbidden", { status: 403 });
  }

  if (!process.env.AI_ENGINE_URL) {
    console.error("AI_ENGINE_URL not defined");
    return new Response("Server misconfigured", { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s

    const res = await fetch(
      `${process.env.AI_ENGINE_URL}/cron/run-daily-ai`,
      {
        method: "POST",
        headers: {
          "x-cron-secret": process.env.CRON_SECRET!,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("AI engine returned error:", res.status);
      return new Response("AI cron failed", { status: 500 });
    }

    console.log("AI cron completed successfully");

    return Response.json({ status: "AI cron triggered" });

  } catch (err) {
    console.error("AI cron exception:", err);
    return new Response("AI cron crashed", { status: 500 });
  }
}

