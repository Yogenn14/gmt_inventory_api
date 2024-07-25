const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: `${process.env.SMTP_HOST}`,
  port: 465,
  secure: true,
  auth: {
    user: `yuva@grandmtech.com`,
    pass: `akDJFhB4G[yu`,
  },
});

const createNotification = (to, subject, text) => {
  const mailOptions = {
    from: '"Inventory System"',
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = createNotification;
