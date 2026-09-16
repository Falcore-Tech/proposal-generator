import { NextResponse } from "next/server";
import { fetchPublicProposalByToken } from "@/lib/db/queries/animated-proposals";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  const proposal = await fetchPublicProposalByToken(token);
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found or not yet active" }, { status: 404 });
  }
  return NextResponse.json(proposal);
}
