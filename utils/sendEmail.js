const { createTransport } = require('nodemailer')


exports.sendEmail = async(to, subject, text) => {
    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "fixebuy.official@gmail.com",
            pass: "bvaliiczaplexibw"
        },
        tls: {
            // do not fail on invalid certs
            pendingUnauthorized: false
        },
    });

    await transporter.sendMail({ to, subject, text });

}