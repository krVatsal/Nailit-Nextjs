import { NextResponse } from "next/server";
import { store, maybeFail } from "../store";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  const id = params.id;
  const idx = store.findIndex((t: any) => t.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  const id = params.id;
  const idx = store.findIndex((t: any) => t.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const removed = store.splice(idx, 1)[0];
  return NextResponse.json(removed);
}
