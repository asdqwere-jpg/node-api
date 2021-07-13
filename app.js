// Access Environment Variables *
require(`dotenv`).config();

// Database Configurations *
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

// Output Function
function sendOutput(statusCode = null, message = null, data = null) {
    return {
        StatusCode: statusCode,
        Message: message,
        Data: data
    }
}

// Header Function
function setHeader(respond, object = {}) {
    return respond.set(object);
}

// Validate Function 
function validateRequest(respond, data = {}) {
    if (data.title.length < 1) {
        return sendOutput(400, "Title Cannot Be Blank");
    } else if (data.detail.length < 1) {
        return sendOutput(400, "Detail Cannot Be Blank");
    } else if (data.start_date.length < 1) {
        return sendOutput(400, "Start Date Cannot Be Blank");
    } else if (typeof data.start_date != `number`) {
        return sendOutput(400, "Start Date Must Be Integer");
    } else if (data.end_date.length < 1) {
        return sendOutput(400, "End Date Cannot Be Blank");
    } else if (typeof data.end_date != `number`) {
        return sendOutput(400, "End Date Must Be Integer");
    } else if (data.location.latitude.length < 1) {
        return sendOutput(400, "Latitude Cannot Be Blank");
    } else if (typeof data.location.latitude != `number`) {
        return sendOutput(400, "Latitude Must Be Integer");
    } else if (data.location.longitude.length < 1) {
        return sendOutput(400, "Longitude Cannot Be Blank");
    } else if (typeof data.location.longitude != `number`) {
        return sendOutput(400, "Longitude Must Be Integer");
    } else if (data.location.radius.length < 1) {
        return sendOutput(400, "Radius Cannot Be Blank");
    } else if (typeof data.location.radius != `number`) {
        return sendOutput(400, "Radius Must Be Integer");
    } else {
        return true;
    }
}

// Update Existing Data
app.put(`/update`, (req, res) => {
    if (res.statusCode != "200") res.send(sendOutput(res.statusCode, res.statusMessage));
    setHeader(res, { 'content-type': `application/json` });

    let validate = validateRequest(res, req.body);

    // Validate Request
    if (req.body.id == "") res.send(sendOutput(400, `ID Cannot Be Blank`));
    if (validate != true) {
        res.send(validate);
    } else {
        pool.query(`UPDATE schedule SET title = '${req.body.title}', group_code = '${req.body.group_code}', start_date = '${req.body.start_date}', end_date = '${req.body.end_date}', latitude = '${req.body.location.latitude}', longitude = '${req.body.location.longitude}', radius = '${req.body.location.radius}', detail = '${req.body.detail}' WHERE id = ${req.body.id}`, (error, result) => {
            if (error) {
                res.send(sendOutput(error.code, error.name));
            } else {
                res.send((result.rowCount < 1) ? sendOutput(400, `Data Not Found`) : sendOutput(res.statusCode, `Ok!`));
            }
        });
    }
    
});

// Create New Data
app.post(`/create`, (req, res) => {
    if (res.statusCode != "200") res.send(sendOutput(res.statusCode, res.statusMessage));
    setHeader(res, {'content-type' : `application/json`});

    let validate = validateRequest(res, req.body);

    // Validate Request
    if (validate != true) {
        res.send(validate);
    } else {
        pool.query(`INSERT INTO schedule (id, title, group_code, start_date, end_date, latitude, longitude, radius, detail, date_created) VALUES (DEFAULT, '${req.body.title}', '${req.body.group_code}', '${req.body.start_date}', '${req.body.end_date}', '${req.body.location.latitude}', '${req.body.location.longitude}', '${req.body.location.radius}', '${req.body.detail}', '${moment().format(`YYYY-MM-DD`)}')`, (error, result, fields) => {
            if (error) {
                res.send(sendOutput(error.code, error.name));
            } else {
                res.send((result.rowCount < 1) ? sendOutput(400, `Task Failed`) : sendOutput(res.statusCode, `Ok!`));
            }
        });
    }
});

// Read Existing Data
app.get(`/read`, (req, res) => {
    if (res.statusCode != "200") res.send(sendOutput(res.statusCode, res.statusMessage));
    setHeader(res, {'content-type': `application/json`});
    pool.query(`SELECT * FROM schedule`, (error, result) => {
        if (error) {
            res.send(sendOutput(error.code, error.name));
        } else {
            res.send(sendOutput(res.statusCode, `Ok!`, result.rows));
        }
    });
});

app.listen(process.env.PORT, () => {
    console.log(`App Running On Port ${process.env.PORT}`);
});