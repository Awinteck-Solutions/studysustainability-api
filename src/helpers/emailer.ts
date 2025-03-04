import * as nodemailer from 'nodemailer';

export const sendMail = async (to: string,firstname:string, subject: string, html: string, data:any) => {
  let transporter = nodemailer.createTransport({
    host: 'awinteck.com',
    port:465,
    secure: true,
    authMethod:"PLAIN",
    auth: { 
        user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
    },            
})


    const mailOptions = {
        from: `studysustainabilityhub <info@awinteck.com>`,
        to: to,
        subject: subject,
      html: html == 'signupHtml' ? SignupHtml(firstname) :
        html == 'resetHtml' ? resetHtml(firstname,data) :
          html == 'resetSuccessHtml' ? resetSuccessHtml(firstname) :
            html == 'adminCreationHtml' ? adminCreationHtml(firstname,data) :
        'No response'
    };

    console.info(`Sending mail to - ${to}`);
    transporter.sendMail(mailOptions, (error, info)=> {
        if (error) {
            console.error(error);
        } else {
          console.info('Email sent: ' + info.response, 'html',html);
        }
    });
}


const SignupHtml = (firstname)=>
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StudySustainabilityHub</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #651800;
      font-size: 24px;
    }
    p {
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #651800;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>Welcome to Study Sustainability Hub!</h1>
    <p>Hi ${firstname},</p>
    <p>Thank you for signing up with us! We’re excited to have you on board. Here are some quick tips to get you started:</p>
    <ul>
      <li>Explore our features and services.</li>
      <li>Customize your profile and settings.</li>
      <li>Contact our support if you need any assistance.</li>
    </ul>
    <p>We look forward to helping you achieve your goals. Click the button below to log in to your account:</p>
    <a href="https://www.StudySustainabilityHub.com" class="button">Log In to Your Account</a>
    <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
    <p>Best regards,<br>The Study Sustainability Hub Team</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Study Sustainability Hub. All rights reserved.</p>
      <p><a href="https://www.StudySustainabilityHub.com">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`

const resetHtml = (firstname,token) => 
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color:rgb(0, 13, 101);
      font-size: 24px;
    }
    p {
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: rgb(0, 13, 101);;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>Password Reset Request</h1>
    <p>Hi ${firstname},</p>
    <p>We received a request to reset your password. Your reset token is:</p>
    <p class="button">${token}</p>
    <p>If you didn’t request a password reset, you can ignore this email, and your password will remain the same.</p>
    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
    <p>Best regards,<br>The StudySustainabilityHub Team</p>
     <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Study Sustainability Hub. All rights reserved.</p>
      <p><a href="https://www.studysustainabilityhub.com">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`

const resetSuccessHtml = (firstname) => 
 
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: rgb(0, 13, 101);
      font-size: 24px;
    }
    p {
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: rgb(0, 13, 101);
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>Password Reset Successful</h1>
    <p>Hi ${firstname},</p>
    <p>Your password has been successfully reset. You can now log in to your account using your new password.</p>
    <p>If you did not perform this action, please contact our support team immediately for assistance.</p>
     <p>Best regards,<br>The StudySustainabilityHub Team</p>
     <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Study Sustainability Hub. All rights reserved.</p>
      <p><a href="https://www.studysustainabilityhub.com">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`

const adminCreationHtml = (firstname, token) => { 
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StudySustainabilityHub</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color:rgb(1, 52, 33);
      font-size: 24px;
    }
    p {
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: rgb(1, 52, 33);
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>Welcome to Study Sustainability Hub!</h1>
    <p>Hi ${firstname},</p>
    <p>Your account has been setup by Admin! We’re excited to have you on board. Here are some quick tips to get you started:</p>
    <ul>
      <li>Reset your account password</li>
      <li>Login with your new password at least once</li>
      <li>Contact our support if you need any assistance.</li>
    </ul>
    <p>Click the button below to reset your account password:</p>
    <a href=${token} class="button" _target="blank">Link</a>
    <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
    <p>Best regards,<br>The Study Sustainability Hub Team</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Study Sustainability Hub. All rights reserved.</p>
      <p><a href="https://www.StudySustainabilityHub.com">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`
}
