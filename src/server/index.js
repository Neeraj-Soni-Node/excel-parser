/* eslint-disable no-console */
// eslint-disable-next-line no-undef

var jsforce = require('jsforce');
const { Client } = require('pg');
var conn = new jsforce.Connection();
var bodyParser = require('body-parser');
let loginResult;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
client.connect();

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    var jsonParser = bodyParser.json()

    app.post('/api/saveFile', jsonParser, function (req, res) {
        console.log('req.body  ', req.body.data);

        //Decoding the Excel file to insert into DB
        let data = req.body.data;
        let fileName = req.body.name;
        let buff = new Buffer(data, 'base64');
        let text = buff.toString('ascii');
        console.log('text   ' , text );
        
        client.query('INSERT INTO excel-parser(id, fileName, fileData)VALUES('+ fileName +',' +  data + ')', (err, res) => {
            if (err) throw err;
            console.log(JSON.stringify(res));
            client.end();
        });
    });

    app.post('/api/login', jsonParser, async function (req, res) {
        var loginData = req.body;
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