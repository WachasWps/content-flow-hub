import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.query.token as string | undefined;
    const month = (req.query.month as string | undefined) || new Date().toISOString().slice(0, 7);

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const { data: share, error: shareErr } = await supabase
      .from("shared_calendars")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (shareErr || !share) {
      return res.status(404).json({ error: "Invalid or expired link" });
    }

    const startDate = `${month}-01`;
    const endDate = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0)
      .toISOString()
      .slice(0, 10);

    const { data: posts, error: postsErr } = await supabase
      .from("posts")
      .select("id, title, platform, status, publish_date, caption")
      .eq("calendar_id", share.calendar_id)
      .gte("publish_date", startDate)
      .lte("publish_date", `${endDate}T23:59:59`)
      .order("publish_date", { ascending: true });

    if (postsErr) {
      throw postsErr;
    }

    return res.status(200).json({ posts: posts || [], label: share.label });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}

