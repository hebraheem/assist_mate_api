import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pug from 'pug';
import path, { dirname } from 'path';
import { convert } from 'html-to-text';
import { fileURLToPath } from 'url';

dotenv.config();
export default class TransportEmail {
  constructor(user, url) {
    /**
     * @private
     * @type {string}
     */
    this.to = user.email;
    /**
     * @private
     * @type {string}
     */
    this.name = user.name;
    /**
     * @private
     * @type {string}
     */
    this.url = url;
    /**
     * @private
     * @type {string}
     */
    this.sender = `Assist mate - <${process.env.SENDER_EMAIL}>`;
  }

  /**
   * @private
   * @returns {nodemailer.Transporter}
   */
  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.TRANSPORT_HOST,
        port: process.env.TRANSPORT_PORT,
        auth: {
          user: process.env.TRANSPORT_EMAIL,
          pass: process.env.TRANSPORT_PASS,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.TRANSPORT_HOST_LOCAL,
        port: process.env.TRANSPORT_PORT_LOCAL,
        auth: {
          user: process.env.TRANSPORT_EMAIL_LOCAL,
          pass: process.env.TRANSPORT_PASS_LOCAL,
        },
      });
    }
  }

  /**
   * @param {string} subject
   * @param {string} template
   * @returns {nodemailer.SendMailOptions}
   * @private
   */
  async send(subject, template) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = pug.renderFile(
      path.join(
        `${__dirname}`,
        '..',
        '..',
        'public',
        'templates',
        `${template}.pug`,
      ),
      { user: this.name, subject, url: this.url },
    );

    const mailConfig = {
      from: this.sender,
      to: this.to,
      subject,
      html,
      text: convert(html, { wordwrap: 130 }),
    };
    await this.createTransport().sendMail(mailConfig);
  }

  async sendWelcome() {
    await this.send('Welcome', 'welcome');
  }

  async sendVerifyEmail() {
    await this.send('Verify', 'verify');
  }

  async sendPasswordReset() {
    await this.send('Password Reset', 'password');
  }

  async verifyUser() {
    await this.send('Verify Your Email', 'verify');
  }
}
