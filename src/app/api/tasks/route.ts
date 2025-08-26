import { NextResponse } from "next/server";
import { store, maybeFail } from "./store";

export async function GET() {
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  const id = Math.random().toString(36).slice(2, 9);
  const task = { id, title: body.title, description: body.description || "", priority: body.priority || "medium", status: "todo" };
  store.unshift(task);
  return NextResponse.json(task, { status: 201 });
}
