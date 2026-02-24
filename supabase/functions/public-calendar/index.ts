import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify token
    const { data: share, error: shareErr } = await supabase
      .from("shared_calendars")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (shareErr || !share) {
      return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get month param or default to current month
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const startDate = `${month}-01`;
    const endDate = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0)
      .toISOString()
      .slice(0, 10);

    // Fetch posts for the month
    const { data: posts, error: postsErr } = await supabase
      .from("posts")
      .select("id, title, platform, status, publish_date, caption")
      .gte("publish_date", startDate)
      .lte("publish_date", endDate + "T23:59:59")
      .order("publish_date", { ascending: true });

    if (postsErr) throw postsErr;

    return new Response(
      JSON.stringify({ posts: posts || [], label: share.label }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

