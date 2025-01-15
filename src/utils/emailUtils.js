import sgMail from '@sendgrid/mail';
import config from '../config/config.js'

sgMail.setApiKey(config.EMAIL_CONFIG.SENDGRID_API_KEY);

/* reason should be an array 
sendTemplatedEmail('user@example.com', 'resubmission', {
  userName: 'John Doe',
  reasons: [
    'Incomplete business information',
    'Missing required documents',
    'Invalid contact details',
  ],
}); */

/**
 * Send an email using SendGrid
 * @param {string | Array<string>} to - The email address[es] to send the email to
 * @param {string} subject - The subject of the email
 * @param {string} text - The plain text content of the email
 * @param {string} html - The HTML content of the email
 * @returns {Promise<object|null>} - The response from SendGrid or null if an error occurred
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: config.EMAIL_CONFIG.ADMIN_EMAIL,
    subject,
    text,
    html,
  };

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    const errorMessage = error.response ? error.response.body : error.message;
    console.error('Error sending email:', errorMessage);
    return null;
  }
};

/**
 * Example Usage:
 * sendTemplatedEmail('test@example.com', 'welcome', { userName: 'John Doe' });
 * sendTemplatedEmail('test@example.com', 'passwordReset', { userName: 'John Doe', resetLink: 'https://example.com/reset' });
 * sendTemplatedEmail('test@example.com', 'accountVerification', { userName: 'John Doe', verificationLink: 'https://example.com/verify' });
 */

/**
 * Send an email using a template
 * @param {string} to - The email address to send the email to
 * @param {string} templateType - The type of email template to use
 * @param {object} params - The parameters to pass to the email template
 * @returns {Promise<object|null>} - The response from SendGrid or null if an error occurred
 */
export const sendTemplatedEmail = async (to, templateType, params) => {
  const templateFunction = emailTemplates[templateType];
  if (!templateFunction) {
    throw new Error('Unknown template type');
  }

  const template = templateFunction(params);
  return sendEmail(to, template.subject, template.text, template.html);
};

const platFormName = config.GENERAL_CONFIG.PLATFORM_NAME || 'Soulsadhna';
/**
 * Email templates
 */
const emailTemplates = {
  welcome: (params) => ({
    subject: `Welcome to ${platFormName}!`,
    text: `Hello ${params.userName},
            Welcome to ${platFormName}! We're thrilled to have you join our community.
            If you have any questions or need assistance, feel free to reach out. We’re here to help!
            Best regards,
            The ${platFormName} Team`,
    html: `
            <h1>Hello, ${params.userName}!</h1>
            <p>Welcome to ${platFormName}! We're thrilled to have you join our community.</p>
            <p>If you have any questions or need assistance, feel free to reach out. We’re here to help!</p>
            <p>Best regards,<br>Your ${platFormName} Team</p>`,
  }),
  passwordReset: (params) => ({
    subject: 'Password Reset Request',
    text: `
            Hi ${params.userName},
            We received a request to reset your password. To proceed, please click the following link:
            ${params.resetLink}
            If you didn't request this password reset, please ignore this email.
            Best regards,
            The ${platFormName} Team`,
    html: `
            <h1>Password Reset Request</h1>
            <p>Hi ${params.userName},</p>
            <p>We received a request to reset your password. To proceed, please click the button below:</p>
            <a href="${params.resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>${platFormName} Team</p>`,
  })
};
