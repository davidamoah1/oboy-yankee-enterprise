import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      resendInstance = new Resend(key);
    }
  }
  return resendInstance;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  /**
   * Sends an email using Resend.
   * If RESEND_API_KEY is not set, it logs to console instead.
   */
  async sendEmail({ to, subject, html }: EmailPayload) {
    const resend = getResend();
    
    if (!resend) {
      const msg = 'Email service is unconfigured: RESEND_API_KEY environment variable is missing in the hosting environment.';
      console.error(msg);
      throw new Error(msg);
    }

    try {
      const data = await resend.emails.send({
        from: 'OBOY YANKEE ENTERPRISE <no-reply@oboyyankee.gh>',
        to,
        subject,
        html,
      });
      return { success: true, data };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  },

  /**
   * Generates a template for subscription expiry
   */
  async sendSubscriptionExpiryAlert(email: string, businessName: string, expiryDate: string) {
    const subject = `Action Required: Your OBOY YANKEE ENTERPRISE Subscription for ${businessName} is expiring soon`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Subscription Expiry Notice</h2>
        <p>Hello,</p>
        <p>This is a friendly reminder that your subscription for <strong>${businessName}</strong> is set to expire on <strong>${expiryDate}</strong>.</p>
        <p>To avoid any disruption to your business operations, please log in to your dashboard and renew your plan.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.VITE_APP_URL || 'https://oboyyankee.gh'}/settings/billing" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Renew Now
          </a>
        </div>
        <p>If you have already renewed, please ignore this message.</p>
        <p>Best regards,<br/>The OBOY YANKEE Team</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, html });
  },

  /**
   * Generates a template for a new invoice
   */
  async sendInvoiceNotification(email: string, businessName: string, amount: string, reference: string) {
    const subject = `Invoice Generated: Your OBOY YANKEE ENTERPRISE Payment for ${businessName}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">New Invoice Available</h2>
        <p>Hello,</p>
        <p>A new invoice has been generated for your recent payment of <strong>GHS ${amount}</strong> for <strong>${businessName}</strong>.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.VITE_APP_URL || 'https://oboyyankee.gh'}/settings/billing" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Invoice
          </a>
        </div>
        <p>Thank you for choosing OBOY YANKEE ENTERPRISE!</p>
        <p>Best regards,<br/>The OBOY YANKEE Team</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, html });
  },

  /**
   * Sends an invitation to a new staff member with their credentials.
   */
  async sendStaffInvitation(email: string, businessName: string, password: string, role: string, department?: string, shift?: string) {
    const subject = `You've been invited to join ${businessName} on OBOY YANKEE ENTERPRISE`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #10b981; font-size: 28px; font-weight: 900; font-style: italic; margin: 0; text-transform: uppercase; letter-spacing: -1px;">OBOY YANKEE <span style="color: #0f172a;">ENTERPRISE</span></h1>
        </div>
        
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; font-style: italic; text-transform: uppercase;">Security Clearance Granted</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">You have been added to <strong>${businessName}</strong>. You can now access the business ecosystem using the credentials below:</p>
        
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px dashed #cbd5e1;">
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 900; text-transform: uppercase; tracking: 1px;">Access Details</p>
          <p style="margin: 0; font-size: 16px; color: #0f172a;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
          <p style="margin: 15px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Role:</strong> ${role.toUpperCase()}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Department:</strong> ${department || 'General'}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Work Shift:</strong> ${shift || 'Morning'}</p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.VITE_APP_URL || 'https://oboyyankee.gh'}/login" 
             style="background-color: #10b981; color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; display: inline-block;">
            Enter Ecosystem
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center;">For security reasons, please change your password immediately after your first login.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; 2026 OBOY YANKEE ENTERPRISE. All systems operational.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, html });
  }
};
