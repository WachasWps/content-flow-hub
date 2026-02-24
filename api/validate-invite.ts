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
    const { token } = req.body as { token?: string };

    if (!token) {
      return res.status(400).json({ valid: false, error: "Token required" });
    }

    const { data: invite, error: inviteErr } = await supabase
      .from("invite_tokens")
      .select("*")
      .eq("token", token)
      .is("used_by", null)
      .single();

    if (inviteErr || !invite) {
      return res.status(200).json({ valid: false, error: "Invalid or already used invite" });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return res.status(200).json({ valid: false, error: "Invite link has expired" });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ valid: false, error: message });
  }
}

