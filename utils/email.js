// Looking to send emails in production? Check out our Email API/SMTP product!
const nodemailer = require("nodemailer");
const pug = require("pug");
const { MailtrapTransport } = require("mailtrap");
const { htmlToText } = require("html-to-text");
require("dotenv").config();
const mg = require("nodemailer-mailgun-transport");
const brevoTransport = require("nodemailer-brevo-transport");

// new Email(User, url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    // this.from = `Sani Abdulrahman <saniabdulrahman851@gmail.com>`;

    this.from = `Sani Abdulrahman <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport(
        brevoTransport({
          apiKey: process.env.BREVO_API_KEY,
        })
      );
    
    }
 

    return nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
        testInboxId: 3366356,
      })
    );
  }
  async send(template, subject) {
    //1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
      category: "Integration Test",
      sandbox: true,
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
