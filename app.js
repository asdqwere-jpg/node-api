// Access Environment Variables
require(`dotenv`).config();

// Database Configurations
const Pool = require(`pg`).Pool;
const pool = new Pool({
    user: `${process.env.USER}`,
    password: `${process.env.PASSWORD}`,
    port: `${process.env.DATABASEPORT}`,
    host: `${process.env.HOST}`,
    database: `${process.env.DATABASE}`,
});

// Moment Configurations
const moment = require(`moment`);

// Express Configurations
const express = require(`express`);
const app = express();

// BodyParser Configurations
const bodyParser = require(`body-parser`);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function sendOutput(statusCode = null, message = null, model = null) {
    return {
        StatusCode: statusCode,
        Message: message,
        Data: model
    }
}

function setHeader(respond, object = {}) {
    return respond.set(object);
}

app.post(`/create`, (req, res) => {
    if (res.statusCode != "200") res.send(sendOutput(res.statusCode, res.statusMessage));
    setHeader(res, {'content-type' : `application/json`});
    pool.query(`INSERT INTO schedule (id, title, group_code, start_date, end_date, latitude, longitude, radius, detail, date_created) VALUES (DEFAULT, '${req.body.title}', '${req.body.group_code}', '${req.body.start_date}', '${req.body.end_date}', '${req.body.location.latitude}', '${req.body.location.longitude}', '${req.body.location.radius}', '${req.body.detail}', '${moment().format(`YYYY-MM-DD`)}')`, (error, result, fields) => {
        if (error) res.send(sendOutput(error.code, error.name));
        res.send(sendOutput(res.statusCode, `Ok!`));
    });
});

app.get(`/read`, (req, res) => {
    if (res.statusCode != "200") res.send(sendOutput(res.statusCode, res.statusMessage));
    setHeader(res, {'content-type': `application/json`});
    pool.query(`SELECT * FROM schedule`, (error, result) => {
        if (error) res.send(sendOutput(error.code, error.name));
        res.send(sendOutput(res.statusCode, `Ok!`, result.rows));
    });
});

app.listen(process.env.PORT, () => {
    console.log(`App Running On Port ${process.env.PORT}`);
});