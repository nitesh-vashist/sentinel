import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { trialId } = await req.json();

  await fetch(
    `${process.env.AI_ENGINE_URL}/run-ai/${trialId}`,
    { method: "POST" }
  );

  return NextResponse.json({ status: "started" });
}
