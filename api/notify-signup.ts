import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, fullName } = req.body as { email?: string; fullName?: string };

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const ADMIN_EMAIL = "digicontentcalendar@gmail.com";

    console.log(
      `🔔 NEW SIGNUP NOTIFICATION:\n` +
        `Name: ${fullName || "Not provided"}\n` +
        `Email: ${email}\n` +
        `Admin: ${ADMIN_EMAIL}\n` +
        `Action: Approve at your Caly dashboard Members page`
    );

    // You can integrate an email provider like Resend or SendGrid here later.

    return res.status(200).json({
      success: true,
      message: "Signup notification logged",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}

