import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body as { userId?: string };

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase
      .from("invite_tokens")
      .insert({ created_by: userId })
      .select("token")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || "Failed to create invite token" });
    }

    const inviteUrl = `${process.env.PUBLIC_APP_URL ?? "http://localhost:5173"}/invite?token=${data.token}`;

    return res.status(200).json({ token: data.token, inviteUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}

