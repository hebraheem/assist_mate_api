import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pug from 'pug';
import path from 'path';
import { convert } from 'html-to-text';

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
        service: 'sendGrid',
        auth: {
          user: process.env.SEND_GRID_USERNAME,
          pass: process.env.SEND_GRID_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.TRANSPORT_HOST,
        port: process.env.TRANSPORT_PORT,
        auth: {
          user: process.env.TRANSPORT_EMAIL,
          pass: process.env.TRANSPORT_PASS,
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
    const html = pug.renderFile(
      path.join(
        `${import.meta.dirname}`,
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
