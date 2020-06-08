// sending emails
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    // port should be 465 for SSL connection or 587 for TLS
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'yourusername@gmail.com',
        pass: 'yourpassword'
    }
});
