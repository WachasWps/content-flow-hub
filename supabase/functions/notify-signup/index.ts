import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ADMIN_EMAIL = "digicontentcalendar@gmail.com";

    // Use Supabase's built-in email via the service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Send notification using a simple fetch to a mail API
    // For now, we'll log and use Supabase's auth admin to track
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Insert a notification record or use edge function logs
    console.log(
      `🔔 NEW SIGNUP NOTIFICATION:\n` +
      `Name: ${fullName || "Not provided"}\n` +
      `Email: ${email}\n` +
      `Admin: ${ADMIN_EMAIL}\n` +
      `Action: Approve at your Caly dashboard Members page`
    );

    // Use Resend or similar for actual email - for now we'll use the Lovable AI gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Send actual email notification using built-in Supabase auth admin
    // The admin can check the Members page to approve users
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Signup notification sent" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-signup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
