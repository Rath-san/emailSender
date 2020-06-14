const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

require('dotenv').config({ silent: process.env.NODE_ENV !== 'developement' });


const sendEmail = ({name, email, message}, onError, onSuccess) => {

    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    const mailOptions = {
        from: email,
        sender: email,
        to: process.env.TO,
        subject: `${name} | new message !`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            onError(error)
        } else {
            onSuccess('Email sent');
        }
    });
};

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.options('/send', cors())
app.post('/send', cors(), (req, res) => {
    sendEmail(
        req.body,
        (err) => {
            res
                .sendStatus(500)
                .send('Internal server error')
        },
        () => {
            res
                .sendStatus(200)
                .send('OK')
        }
    );
});

app.listen(4000, () => console.log('server started @ 4000'));
