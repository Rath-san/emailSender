const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ silent: process.env.NODE_ENV !== 'developement' });

const port = process.env.PORT || 4000;

const sendEmail = ({ name, email, message }, onError, onSuccess) => {
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
        to: process.env.TO.split(','),
        subject: `${name} | new message !`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            onError(error);
        } else {
            onSuccess('Email sent');
        }
    });
};

const whitelist = process.env.CORS_WHITELIST.split(',');

const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.options('/send', cors(corsOptionsDelegate));
app.post('/send', cors(), (req, res) => {
    sendEmail(
        req.body,
        (err) => {
            res.sendStatus(500).send('Internal server error');
        },
        (message) => {
            console.info(message);
            res.sendStatus(200).send('OK');
        }
    );
});

app.listen(port, () => console.log(`Server's running @ port ${port}`));
