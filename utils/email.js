const nodemailer = require('nodemailer');

// module.exports = class Email {
//   constructor (user, url) {
//     this.to = user.email,
//     this.firstName = user.name.split(' ')[0],
//     this.url = url,
//     this.from = `Natours Firm <${process.env.EMAIL_FROM}>`
//   }
// }

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Natours Firm <natours@io.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
