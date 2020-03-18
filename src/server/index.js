/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let jsforce = require('jsforce');
const { Client } = require('pg');
let conn = new jsforce.Connection();
let bodyParser = require('body-parser');
let XLSX = require('xlsx');

let loginResult;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
client.connect();

let process_wb = function (workbook) {
    let result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        let roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        if (roa.length) result[sheetName] = roa;
    });
    return JSON.stringify(result, 2, 2);
}

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    let jsonParser = bodyParser.json()

    app.post('/api/saveFile', jsonParser, function (req, res) {
        let result;
        let data = req.body.data;
        let workbook = XLSX.read(data, { type: "base64", WTF: false });
        result = process_wb(workbook);
        res.send({ data: result });
    });

    app.post('/api/login', jsonParser, async function (req, res) {
        let loginData = req.body;
        try {
            loginResult = await conn.login(
                loginData.userName,
                loginData.passAndToken
            );
        } catch (e) {
            res.send({ error: e.message });
        }
        res.send({ data: loginResult });
    });

    app.get('/api/logout', jsonParser, function (req, res) {
        conn.logout(function (err) {
            if (err) { res.send({ error: err }); }
            res.send({ data: 'success' });
        });
    });
};