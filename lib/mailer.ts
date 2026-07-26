import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!transporter) {
    // Graceful no-op so the app is fully usable before SMTP creds are wired up.
    console.log(`[mailer] SMTP not configured — logging email instead of sending.
  To: ${to}
  Subject: ${subject}
  ${text || html.replace(/<[^>]+>/g, " ")}`);
    return { sent: false, reason: "smtp_not_configured" as const };
  }
  await transporter.sendMail({
    from: EMAIL_FROM || "DocketPilot <reminders@docketpilot.app>",
    to,
    subject,
    html,
    text,
  });
  return { sent: true as const };
}

export function reminderEmailHtml(opts: {
  clientName: string;
  caseNumber?: string | null;
  court?: string | null;
  type: string;
  dueDateLabel: string;
  daysLabel: string;
  notes?: string | null;
  appUrl: string;
}) {
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#4f46e5">Deadline reminder — ${opts.daysLabel}</h2>
    <p><strong>${opts.clientName}</strong>${opts.caseNumber ? ` &middot; #${opts.caseNumber}` : ""}</p>
    <p>${opts.type} at ${opts.court || "court"} is due on <strong>${opts.dueDateLabel}</strong>.</p>
    ${opts.notes ? `<p style="color:#475569">${opts.notes}</p>` : ""}
    <p><a href="${opts.appUrl}/dashboard" style="color:#4f46e5">Open DocketPilot &rarr;</a></p>
  </div>`;
}
