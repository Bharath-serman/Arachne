import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";

export interface ContactInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: ContactInput) => {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Name is required.");
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Valid email address is required.");
    }
    if (!data.message || data.message.trim().length < 5) {
      throw new Error("Message must be at least 5 characters.");
    }
    return data;
  })
  .handler(async ({ data }): Promise<ContactResponse> => {
    const apiKey = process.env["RESEND_API_KEY"] || "re_placeholder_key";
    const toEmail = process.env["CONTACT_EMAIL"] || "studio@arachne.tv";

    // Development / testing fallback if using placeholder key
    if (apiKey === "re_placeholder_key" || !apiKey || apiKey.startsWith("re_placeholder")) {
      console.log("[Resend Dev Mode] Contact Signal Received:", {
        fromName: data.name,
        fromEmail: data.email,
        subject: data.subject || "New Studio Contact Inquiry",
        message: data.message,
        targetEmail: toEmail,
        timestamp: new Date().toISOString(),
      });
      return {
        success: true,
        message: "Signal recorded! (Placeholder key active: message logged to studio receiver)",
      };
    }

    try {
      const resend = new Resend(apiKey);
      const timestamp = new Date().toUTCString();
      const channelLabel = data.subject || "General Transmission";

      const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ARACHNÉ Studio — Incoming Signal</title>
</head>
<body style="margin:0;padding:0;background:#050506;font-family:'Courier New',monospace;">

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050506;padding:32px 16px;">
<tr><td align="center">

<!-- Card -->
<table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background:#0a0a0e;border:1px solid #2a0a08;border-radius:12px;overflow:hidden;box-shadow:0 0 60px rgba(226,36,47,0.2);">

  <!-- Header Banner with web SVG -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f0202 0%,#1a0404 50%,#0a0a0e 100%);padding:0;position:relative;overflow:hidden;">
      <!-- Spider web SVG art -->
      <div style="position:relative;padding:28px 36px 22px;overflow:hidden;">
        <svg style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0.18;" viewBox="0 0 620 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Radial web spokes from top-left corner -->
          <line x1="0" y1="0" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <line x1="120" y1="0" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <line x1="0" y1="40" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <!-- Radial web spokes from top-right corner -->
          <line x1="620" y1="0" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <line x1="500" y1="0" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <line x1="620" y1="40" x2="310" y2="60" stroke="#e2242f" stroke-width="0.8"/>
          <!-- Sagging spiral rings -->
          <path d="M 40,8 Q 160,42 310,28 Q 460,14 580,8" fill="none" stroke="#e2242f" stroke-width="0.7" opacity="0.6"/>
          <path d="M 20,22 Q 165,56 310,44 Q 455,32 600,22" fill="none" stroke="#e2242f" stroke-width="0.6" opacity="0.5"/>
          <path d="M 0,38 Q 155,70 310,60 Q 465,50 620,38" fill="none" stroke="#e2242f" stroke-width="0.5" opacity="0.4"/>
          <!-- Center hub knot -->
          <circle cx="310" cy="60" r="3.5" fill="#e2242f" opacity="0.7"/>
          <circle cx="310" cy="60" r="8" fill="none" stroke="#e2242f" stroke-width="0.6" stroke-dasharray="2 4" opacity="0.4"/>
        </svg>

        <!-- Logo & Title -->
        <div style="position:relative;z-index:1;">
          <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.3em;color:#e2242f;text-transform:uppercase;">ARACHNÉ STUDIO</p>
          <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:300;letter-spacing:0.08em;color:#f1f5f9;line-height:1.2;">Incoming Transmission</h1>
          <p style="margin:0;font-size:10px;letter-spacing:0.2em;color:#64748b;text-transform:uppercase;">Signal received at studio relay receiver</p>
        </div>
      </div>

      <!-- Red accent bar -->
      <div style="height:2px;background:linear-gradient(90deg,transparent,#e2242f 30%,#e2242f 70%,transparent);"></div>
    </td>
  </tr>

  <!-- Metadata rows -->
  <tr>
    <td style="padding:28px 36px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">

        <!-- From -->
        <tr>
          <td style="padding:0 0 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#0d1117;padding:10px 16px;width:120px;border-right:1px solid #1e293b;">
                  <span style="font-size:9px;letter-spacing:0.25em;color:#e2242f;text-transform:uppercase;">01 / FROM</span>
                </td>
                <td style="background:#0d1117;padding:10px 16px;">
                  <span style="font-size:13px;color:#e2e8f0;font-family:'Courier New',monospace;">${escapeHtml(data.name)}</span>
                  <span style="font-size:11px;color:#64748b;margin-left:8px;">&lt;${escapeHtml(data.email)}&gt;</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Channel -->
        <tr>
          <td style="padding:0 0 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#0d1117;padding:10px 16px;width:120px;border-right:1px solid #1e293b;">
                  <span style="font-size:9px;letter-spacing:0.25em;color:#e2242f;text-transform:uppercase;">02 / CHANNEL</span>
                </td>
                <td style="background:#0d1117;padding:10px 16px;">
                  <span style="font-size:13px;color:#00f5d4;font-family:'Courier New',monospace;">${escapeHtml(channelLabel)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Timestamp -->
        <tr>
          <td style="padding:0 0 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#0d1117;padding:10px 16px;width:120px;border-right:1px solid #1e293b;">
                  <span style="font-size:9px;letter-spacing:0.25em;color:#e2242f;text-transform:uppercase;">03 / LOGGED</span>
                </td>
                <td style="background:#0d1117;padding:10px 16px;">
                  <span style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;">${timestamp}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- Message divider with web art -->
  <tr>
    <td style="padding:0 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-top:1px solid #1e293b;padding-top:16px;">
            <svg width="100%" height="20" viewBox="0 0 548 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="10" x2="200" y2="10" stroke="#1e293b" stroke-width="1"/>
              <circle cx="220" cy="10" r="2.5" fill="#e2242f" opacity="0.7"/>
              <path d="M 240,2 Q 274,14 308,2" fill="none" stroke="#e2242f" stroke-width="0.8" opacity="0.5"/>
              <circle cx="274" cy="10" r="2" fill="#e2242f" opacity="0.5"/>
              <path d="M 240,18 Q 274,6 308,18" fill="none" stroke="#e2242f" stroke-width="0.8" opacity="0.3"/>
              <circle cx="328" cy="10" r="2.5" fill="#e2242f" opacity="0.7"/>
              <line x1="348" y1="10" x2="548" y2="10" stroke="#1e293b" stroke-width="1"/>
            </svg>
            <p style="margin:6px 0 0;font-size:9px;letter-spacing:0.3em;color:#e2242f;text-transform:uppercase;text-align:center;">04 / SIGNAL CONTENT</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Message body -->
  <tr>
    <td style="padding:0 36px 28px;">
      <div style="background:#070b0f;border:1px solid #1e293b;border-left:3px solid #e2242f;border-radius:0 8px 8px 0;padding:20px 22px;position:relative;overflow:hidden;">
        <!-- Subtle web corner art -->
        <svg style="position:absolute;top:0;right:0;width:80px;height:80px;opacity:0.08;" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <line x1="80" y1="0" x2="40" y2="40" stroke="#e2242f" stroke-width="1"/>
          <line x1="80" y1="20" x2="40" y2="40" stroke="#e2242f" stroke-width="1"/>
          <line x1="80" y1="40" x2="40" y2="40" stroke="#e2242f" stroke-width="1"/>
          <line x1="60" y1="0" x2="40" y2="40" stroke="#e2242f" stroke-width="1"/>
          <path d="M 80,8 Q 60,24 40,40" fill="none" stroke="#e2242f" stroke-width="0.8"/>
          <path d="M 80,22 Q 62,34 40,40" fill="none" stroke="#e2242f" stroke-width="0.6"/>
          <circle cx="40" cy="40" r="2.5" fill="#e2242f"/>
        </svg>
        <p style="margin:0;font-size:13px;line-height:1.75;color:#cbd5e1;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(data.message)}</p>
      </div>
    </td>
  </tr>

  <!-- CTA — Reply button -->
  <tr>
    <td style="padding:0 36px 28px;text-align:center;">
      <a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background:transparent;border:1px solid #e2242f;color:#e2242f;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;padding:10px 28px;border-radius:4px;">
        ↩ REPLY TO SENDER
      </a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:0;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#e2242f 30%,#e2242f 70%,transparent);"></div>
      <div style="background:#070710;padding:16px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:9px;letter-spacing:0.18em;color:#334155;text-transform:uppercase;">ARACHNÉ Studio — Silk Signal Relay System</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;font-size:9px;color:#334155;font-family:'Courier New',monospace;">studio@arachne.tv</p>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

</table>
<!-- /Card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;

      const { error } = await resend.emails.send({
        from: "Arachne Studio Web <onboarding@resend.dev>",
        to: [toEmail],
        replyTo: data.email,
        subject: data.subject ? `[Arachné Signal] ${data.subject} — from ${data.name}` : `[Arachné Signal] Message from ${data.name}`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return {
          success: false,
          message: error.message || "Failed to transmit email via Resend.",
        };
      }

      return {
        success: true,
        message: "Signal transmitted to studio inbox via Resend!",
      };
    } catch (err: unknown) {
      console.error("Transmission Error:", err);
      const errMsg = err instanceof Error ? err.message : "Unknown server error.";
      return {
        success: false,
        message: `Transmission error: ${errMsg}`,
      };
    }
  });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
