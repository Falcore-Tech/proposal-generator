import { createClient } from "@/utils/supabase/server";
import type { AnimatedProposal } from "@/types/animated-proposal";

export async function fetchPublicProposal(token: string): Promise<AnimatedProposal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_animated_by_token", { p_token: token });
  if (error) return null;
  const proposal = Array.isArray(data) ? data[0] : data;
  return (proposal ?? null) as unknown as AnimatedProposal | null;
}
