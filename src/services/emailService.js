const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const service = process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || (user && user.includes('@gmail.com') ? 'gmail' : undefined);

  if (!user || !pass) {
    console.warn(
      '⚠️ [Nodemailer] EMAIL_USER and/or EMAIL_PASS not found in environment variables. Email notification will not be dispatched until SMTP credentials are configured.'
    );
    return null;
  }

  const transportConfig = host
    ? {
        host,
        port,
        secure,
        auth: { user, pass }
      }
    : {
        service: service || 'gmail',
        auth: { user, pass }
      };

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
}

/**
 * Sends a notification email to portfolio owner when a new contact message is submitted.
 * @param {Object} contact - { name, email, subject, message, createdAt }
 */
async function sendContactNotification({ name, email, subject, message, createdAt = new Date() }) {
  const mailTransporter = getTransporter();
  const recipient = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'chakitsharma7@gmail.com';
  const senderUser = process.env.EMAIL_USER || process.env.SMTP_USER || recipient;

  if (!mailTransporter) {
    return {
      success: false,
      skipped: true,
      message: 'SMTP credentials (EMAIL_USER / EMAIL_PASS) not configured.'
    };
  }

  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const mailOptions = {
    from: `"Portfolio Contact Form" <${senderUser}>`,
    to: recipient,
    replyTo: `"${name}" <${email}>`,
    subject: `New Message: ${subject} — ${name}`,
    text: `New message from your portfolio contact form

From: ${name} (${email})
Subject: ${subject}
Date: ${formattedDate}

Message:
${message}

---
You can reply directly to this email to respond to ${name}.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Portfolio Message</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f5f7; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                
                <!-- Brand / Header -->
                <tr>
                  <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b;">Portfolio Inquiry</span>
                          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">${subject}</h1>
                        </td>
                        <td align="right" valign="top">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #f1f5f9; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569;">
                            ${formattedDate}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Sender Meta Info -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 70px; font-weight: 500;">From:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Email:</td>
                        <td style="padding: 4px 0;">
                          <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message Body -->
                <tr>
                  <td style="padding: 28px 32px;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 12px;">
                      Message Content
                    </div>
                    <div style="font-size: 15px; line-height: 1.65; color: #334155; white-space: pre-wrap; word-break: break-word;">${message}</div>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <table cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #0f172a;">
                          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; padding: 11px 22px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                            Reply to ${name} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                      Tip: You can also hit &ldquo;Reply&rdquo; directly in your email app.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      Sent from your developer portfolio contact form
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✉️ [Nodemailer] Contact notification delivered to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Nodemailer] Error sending notification email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendContactNotification,
  getTransporter
};
