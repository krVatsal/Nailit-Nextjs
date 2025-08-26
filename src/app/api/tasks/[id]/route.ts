import { NextResponse } from "next/server";
import { store, maybeFail } from "../store";

export async function PATCH(req: Request, context: any) {
  const { params } = context;
  const { id } = params;
  const body = await req.json();
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body, updatedAt: new Date().toISOString() };
  return NextResponse.json(store[idx]);
}

export async function DELETE(req: Request, context: any) {
  const { params } = context;
  const { id } = params;
  if (maybeFail()) return NextResponse.json({ message: "Simulated failure" }, { status: 500 });
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const [removed] = store.splice(idx, 1);
  return NextResponse.json(removed);
}
