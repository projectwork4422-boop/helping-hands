interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Mock Mode
    console.log("=========================================");
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("=========================================");
    return { success: true, mock: true };
  }

  try {
    // Real Resend Integration
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Helping Hands <noreply@helpinghands.com>",
        to,
        subject,
        html: `<div style="font-family: sans-serif; color: #000;">${body.replace(/\n/g, '<br/>')}</div>`,
      }),
    });

    if (!res.ok) {
      console.error("Failed to send email via Resend:", await res.text());
      return { success: false, error: "Failed to send email" };
    }

    return { success: true, mock: false };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "Email sending error" };
  }
}
