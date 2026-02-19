export async function GET() {
  try {
    const response = await fetch(process.env.AI_ENGINE_URL + "/health", {
      method: "GET",
      cache: "no-store",
    });

    return Response.json({ status: "pinged" });
  } catch (err) {
    return Response.json({ status: "failed", error: "AI unreachable" });
  }
}
