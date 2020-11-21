const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const timeago = require('epoch-timeago').default;
const sessionSecret = `KZTC$@eBn+9ug75VhF!twY#sW'X3/]v%Epxz<(]j&fcL)a?q6Q`;
const mysql = require('mysql');
const { serverName, serverHost, port } = require('./config.json');
const completed = require('./config.json').completedDontTouchThis;
const {  database_USER, database_NAME, database_HOST, database_PASS } = require('./db_info.json');
const http = require('http').createServer(app);
const db_config = {
    host: database_HOST,
    user: database_USER,
    password: database_PASS,
    database: database_NAME
};
let con;

// functions
function handleDisconnect() {
    con = mysql.createConnection(db_config); 
    con.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            console.log('reconnecting, this is normal');
            setTimeout(handleDisconnect, 2000);
        }                                    
    });
    con.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
function millisToSeconds(millis) {
    return (millis / 1000).toFixed(0);
}
function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return [dDisplay, hDisplay, mDisplay, sDisplay]
}
function do404(req, res, next) {
    res.type('text/html').status(404).sendFile(__dirname + '/errors/404.html');
}
function do500(err, req, res, text) {
    if(err.message != 'error is not defined') console.log(err.stack)
    res.type('text/html').status(500).sendFile(__dirname + '/errors/500.html');
}
// actual code
if(database_USER == "" || database_NAME == "" || database_HOST == "") {

}
else {
    handleDisconnect();
}


app.use(express.static('public'));
app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ secret: sessionSecret, store: new session.MemoryStore(), expires: new Date(Date.now() + 604800), resave: false, saveUninitialized: false }));

app.get('/', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || !completed) return res.redirect('/admin/setup');
    else return res.redirect('/punishments');
});
app.get(`/admin/setup`, async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "") return res.redirect('/admin/setup/database');
    else return res.redirect('/admin/setup/config');
})
app.get('/admin/setup/database', async (req, res) => {
    let err = ``;
    if(database_USER == "" || database_NAME == "" || database_HOST == "") {

    } else {
        return res.redirect('/admin/setup/config');
    }
    if(req.session.error) { 
        err = `<div class="bg-red-600 py-4 px-4 rounded">${req.session.error}</div>`; 
        req.session.error = undefined;
    }
    let out = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    <title>Setup</title>
</head>
<body>
<script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.js" defer></script>
<div class="container max-w-full mx-auto py-24 px-6">
  <div class="max-w-sm mx-auto px-6">
        <div class="relative flex flex-wrap">
            <div class="w-full relative">
                <div class="md:mt-6">
                    <div class="text-center font-semibold text-black">
                        Database Setup
                    </div>
                    <form action="" method="POST" class="mt-8">
                    ${err}
                        <div class="mx-auto max-w-lg ">
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Host<span class="text-sm text-red-700"><b>*</b></span></span>
                                <input placeholder="" name="host" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Database<span class="text-sm text-red-700"><b>*</b></span></span>
                                <input placeholder="" name="database" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Username<span class="text-sm text-red-700"><b>*</b></span></span>
                                <input placeholder="" name="user" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Password<span class="text-sm text-red-700"><b>*</b></span></span>
                                <input placeholder="" name="password" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <button class="mt-3 text-lg font-semibold
            bg-gray-800 w-full text-white rounded-lg
            px-6 py-3 block shadow-xl hover:text-white hover:bg-black">
                                Connect
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`
res.send(out);
})

app.post('/admin/setup/database', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || completed) {

    } else {
        return res.redirect('/admin/setup/config');
    }
    let db = req.body;
    let connection = mysql.createConnection(db);
    connection.connect(async (err) => {
        if(err) {
            if(err.code == "ETIMEDOUT") {
                req.session.error = 'MySQL Error: Invalid Host';
                res.redirect('/admin/setup/database');
            } else {
                req.session.error = `MySQL Error: ${err.sqlMessage}`;
                res.redirect('/admin/setup/database');
            }
            connection.end();
        } else {
            let db_towrite = `{
                "database_HOST": "${req.body.host}",
                "database_USER": "${req.body.user}",
                "database_PASS": "${req.body.password}",
                "database_NAME": "${req.body.database}"
            }`
            fs.writeFileSync('db_info.json', db_towrite, {encoding: 'utf-8'});
            res.redirect('/admin/setup/config');
            connection.end();
        }
    })
})

app.get('/admin/setup/config', async (req, res) => {
    if(completed) return res.redirect('/punishments');
    let err = ``;
    if(serverName == "") {

    } else {
        return res.redirect('/');
    }
    if(req.session.error) { 
        err = `<div class="bg-red-600 py-4 px-4 rounded">${req.session.error}</div>`; 
        req.session.error = undefined;
    }
    let out = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    <title>Setup</title>
    
</head>
<body>


<script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.js" defer></script>
<div class="container max-w-full mx-auto py-24 px-6">
  <div class="max-w-sm mx-auto px-6">
        <div class="relative flex flex-wrap">
            <div class="w-full relative">
                <div class="md:mt-6">
                    <div class="text-center font-semibold text-black">
                        Configuration Setup
                    </div>
                    <form action="" method="POST" class="mt-8">
                    ${err}
                        <div class="mx-auto max-w-lg ">
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Server Name</span>
                                <input placeholder="" name="serverName" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Hostname</span>
                                <input placeholder="" name="hostName" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <div class="py-1">
                                <span class="px-1 text-sm text-gray-600">Port (to host the webserver on, default 3000)<span class="text-sm text-red-700"><b>*</b></span></span>
                                <input placeholder="" value="3000" onkeypress="return isNumberKey(event)" id="port" name="port" type="text"
                                       class="text-md block px-3 py-2 rounded-lg w-full
                bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none">
                            </div>
                            <button class="mt-3 text-lg font-semibold
            bg-gray-800 w-full text-white rounded-lg
            px-6 py-3 block shadow-xl hover:text-white hover:bg-black">
                                Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script>function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    console.log(evt)
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
        
    if(Number(evt.value) < 65535) return false;
    return true;
}
</script>
</body>
</html>`
res.send(out);
})

app.post('/admin/setup/config', async (req, res) => {
    if(completed) return res.redirect('/punishments');
    let config_towrite = `{
        "serverName": "${req.body.serverName}",
        "serverHost": "${req.body.hostName}",
        "port": ${req.body.port},
        "completedDontTouchThis": true
    }`
    fs.writeFileSync('config.json', config_towrite, {encoding: 'utf-8'});
    res.redirect('/admin/setup/done');
})

app.get('/admin/setup/done', async (req, res) => {
    if(completed) return res.redirect('/');
    let out = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    <title>Setup</title>
    
</head>
<body>


<script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.js" defer></script>
<div class="container max-w-full pt-24 px-6">
  <div class="max-w-sm mx-auto px-1/2">
        <div class="relative flex flex-wrap">
            <div class="w-full relative">
                <div class="md:mt-6">
                    <p class="text-xl">Setup is complete. Please restart the script for changes to take effect.</p>
                </div>
            </div>
        </div>
    </div>
</div>
<script>function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    console.log(evt)
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
        
    if(Number(evt.value) < 65535) return false;
    return true;
}
</script>
</body>
</html>`
await res.send(out);
process.exit(0);
})

app.get('/punishments', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || !completed) return res.redirect('/admin/setup');
    let bans = [];
    let sql = `SELECT * FROM \`Punishments\` ORDER BY start DESC`;
    con.query(sql, async (err, result) => {
        if(result.length < 1) { 
            bans[0] = 'There are no active punishments.'; 
        } else {
            result.forEach(async punishment => {
                let ends = '';
                let seconds = millisToSeconds(punishment.end) - Math.round(Date.now() / 1000);
                if(punishment.end == '-1') { 
                    if(punishment.punishmentType == "KICK") ends = `<td class="border px-4 py-2"><span class="text-green-700"><b>Ended</b></span></td>`;
                    else ends = '<td class="border px-4 py-2 text-red-700"><b>Permanent</b></td>'; 
                }
                else { 
                    let untilEnds = secondsToDhms(seconds);
                    let i;
                    if(untilEnds[0] !== "" && untilEnds[1] !== "") i = `${untilEnds[0]}, ${untilEnds[1]}`;
                    else if(untilEnds[0] !== "") i = untilEnds[0];
                    else if(untilEnds[1] !== "") i = untilEnds[1];
                    else if(untilEnds[2] !== "") i = untilEnds[2];
                    else if(untilEnds[3] !== "") i = untilEnds[3];
                    else i = `<span class="text-green-700"><b>Ended</b></span>`
                    ends = `<td class="border px-4 py-2">${i}</td>`; 
                }
                let type = '';
                if(punishment.punishmentType == 'IP_BAN') type = `<td class="border px-4 py-2 text-red-800"><b>IP Ban</b></td>`;
                else if(punishment.punishmentType == 'BAN') type = `<td class="border px-4 py-2 text-red-700"><b>Ban</b></td>`;
                else if(punishment.punishmentType == 'TEMP_BAN') type = `<td class="border px-4 py-2 text-red-600"><b>Temp-Ban</b></td>`;
                else if(punishment.punishmentType == 'WARNING') type = `<td class="border px-4 py-2 text-orange-700"><b>Warning</b></td>`;
                else if(punishment.punishmentType == 'TEMP_WARNING') type = `<td class="border px-4 py-2 text-orange-600"><b>Temp-Warning</b></td>`;
                else if(punishment.punishmentType == 'KICK') type = `<td class="border px-4 py-2 text-yellow-600"><b>Kick</b></td>`;
                else type = `<td class="border px-4 py-2 text-yellow-600"><b>${punishment.punishmentType}</b></td>`;


                bans.push(`
                <tr>
                    <td class="border px-4 py-2"><a href="/punishments/${punishment.id}">${punishment.name}</a></td>
                    <td class="border px-4 py-2">${punishment.operator}</td>
                    ${type}
                    <td class="border px-4 py-2">${punishment.reason}</td>
                    <td class="border px-4 py-2">${timeago(punishment.start)}</td>
                    ${ends}
                  </tr>`);
            });
        }
        bans = bans.join('')
        let title = '';
        let hostname = '';
        if(serverName != "") title = ` - ${serverName}`;
        if(serverHost != "" && serverName != "") hostname = ` - ${serverHost}`;
        else if(serverHost != "" && servername == "") hostname = serverHost;
        let out = `
        <!DOCTYPE html>
        <html>
            <head>
                <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
                <title>Punishments${title}</title>
            </head>
            <body class="overflow-x-hidden">
            <div class="flex">
            <div class="overflow-hidden shadow-md border-t-4 bg-white mb-4 rounded-b-lg rounded-t border-red-light w-full md:w-1/4">
                <div class="px-6 py-4 mb-2 mt-4 mb-8">
                    <div class="uppercase tracking-wide text-c2 mb-4">${serverName}${hostname}</div>
                    <div onclick="window.location.href='/punishments'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest border-b-0" style="border-left: 4px solid #e2624b !important;">
                    <img width="18" height="18" src="/svg/sledgehammer.svg" />
                        <div class="pl-2">Punishments</div>
                    </div>
                    <div onclick="window.location.href='/punishments/history'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest">
                        <svg width="18" height="18" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg">
                            <path d="M640 896v512h-256v-512h256zm384-512v1024h-256v-1024h256zm1024 1152v128h-2048v-1536h128v1408h1920zm-640-896v768h-256v-768h256zm384-384v1152h-256v-1152h256z"
                            />
                        </svg>
                        <div class="pl-2">History</div>
</div>


      <input type="search" id="search" onkeyup="search()" class="flex text-lg w-full bg-purple-white shadow rounded border-0 px-6 py-4 mb-2 mt-4 mb-8" placeholder="Search">
    
    </div>
    </div>
        <table id="results" class="table-fixed w-full align-end">
                <thead>
                  <tr>
                    <th class="w-1/2 px-4 py-2">Player</th>
                    <th class="w-1/4 px-4 py-2">Operator</th>
                    <th class="w-1/4 px-4 py-2">Type</th>
                    <th class="w-1/4 px-4 py-2">Reason</th>
                    <th class="w-1/4 px-4 py-2">Created</th>
                    <th class="w-1/4 px-4 py-2">Ends</th>
                  </tr>
                </thead>
                <tbody>
                  ${bans}
                </tbody>
              </table>
              <script>
function search() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  table = document.getElementById("results");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}
</script>
            </body>
            </div>
        </html>
        `;
        res.send(out);
    })
});

app.get('/punishments/history', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || !completed) return res.redirect('/admin/setup');
    let bans = [];
    let sql = `SELECT * FROM \`PunishmentHistory\` ORDER BY start DESC`;
    con.query(sql, async (err, result) => {
        if(result.length < 1) { 
            bans[0] = 'There are no active punishments.'; 
        } else {
            result.forEach(async punishment => {
                let ends = '';
                let seconds = millisToSeconds(punishment.end) - Math.round(Date.now() / 1000);
                if(punishment.end == '-1') { 
                    if(punishment.punishmentType == "KICK") ends = `<td class="border px-4 py-2"><span class="text-green-700"><b>Ended</b></span></td>`;
                    else ends = '<td class="border px-4 py-2 text-red-700"><b>Permanent</b></td>'; 
                }
                else { 
                    let untilEnds = secondsToDhms(seconds);
                    let i;
                    if(untilEnds[0] !== "" && untilEnds[1] !== "") i = `${untilEnds[0]}, ${untilEnds[1]}`;
                    else if(untilEnds[0] !== "") i = untilEnds[0];
                    else if(untilEnds[1] !== "") i = untilEnds[1];
                    else if(untilEnds[2] !== "") i = untilEnds[2];
                    else if(untilEnds[3] !== "") i = untilEnds[3];
                    else i = `<span class="text-green-700"><b>Ended</b></span>`
                    ends = `<td class="border px-4 py-2">${i}</td>`; 
                }
                let type = '';
                if(punishment.punishmentType == 'IP_BAN') type = `<td class="border px-4 py-2 text-red-800"><b>IP Ban</b></td>`;
                else if(punishment.punishmentType == 'BAN') type = `<td class="border px-4 py-2 text-red-700"><b>Ban</b></td>`;
                else if(punishment.punishmentType == 'TEMP_BAN') type = `<td class="border px-4 py-2 text-red-600"><b>Temp-Ban</b></td>`;
                else if(punishment.punishmentType == 'WARNING') type = `<td class="border px-4 py-2 text-orange-700"><b>Warning</b></td>`;
                else if(punishment.punishmentType == 'TEMP_WARNING') type = `<td class="border px-4 py-2 text-orange-600"><b>Temp-Warning</b></td>`;
                else if(punishment.punishmentType == 'KICK') type = `<td class="border px-4 py-2 text-yellow-600"><b>Kick</b></td>`;
                else type = `<td class="border px-4 py-2 text-yellow-600"><b>${punishment.punishmentType}</b></td>`;


                bans.push(`
                <tr>
                    <td class="border px-4 py-2"><a href="/punishments/history/${punishment.id}">${punishment.name}</a></td>
                    <td class="border px-4 py-2">${punishment.operator}</td>
                    ${type}
                    <td class="border px-4 py-2">${punishment.reason}</td>
                    <td class="border px-4 py-2">${timeago(punishment.start)}</td>
                    ${ends}
                  </tr>`);
            });
        }
        bans = bans.join('')
        
        let title = '';
        let hostname = '';
        if(serverName != "") title = ` - ${serverName}`;
        if(serverHost != "" && serverName != "") hostname = ` - ${serverHost}`;
        else if(serverHost != "" && servername == "") hostname = serverHost;
        let out = `
        <!DOCTYPE html>
        <html>
            <head>
                <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
                <title>Punishments${title}</title>
            </head>
            <body class="overflow-x-hidden">
            <div class="flex">
            <div class="overflow-hidden shadow-md border-t-4 bg-white mb-4 rounded-b-lg rounded-t border-red-light w-full md:w-1/4">
                <div class="px-6 py-4 mb-2 mt-4 mb-8">
                    <div class="uppercase tracking-wide text-c2 mb-4">${serverName}${hostname}</div>
                    <div onclick="window.location.href='/punishments'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest border-b-0">
                    <img width="18" height="18" src="/svg/sledgehammer.svg" />
                        <div class="pl-2">Punishments</div>
                    </div>
                    <div onclick="window.location.href='/punishments/history'" style="border-left: 4px solid #e2624b !important;" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest">
                        <svg width="18" height="18" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg">
                            <path d="M640 896v512h-256v-512h256zm384-512v1024h-256v-1024h256zm1024 1152v128h-2048v-1536h128v1408h1920zm-640-896v768h-256v-768h256zm384-384v1152h-256v-1152h256z"
                            />
                        </svg>
                        <div class="pl-2">History</div>
                        </div>


                        <input type="search" id="search" onkeyup="search()" class="flex text-lg w-full bg-purple-white shadow rounded border-0 px-6 py-4 mb-2 mt-4 mb-8" placeholder="Search">
                      
                      </div>
                      </div>
                <table id="results" class="table-fixed w-full align-end">
                <thead>
                  <tr>
                    <th class="w-1/2 px-4 py-2">Player</th>
                    <th class="w-1/4 px-4 py-2">Operator</th>
                    <th class="w-1/4 px-4 py-2">Type</th>
                    <th class="w-1/4 px-4 py-2">Reason</th>
                    <th class="w-1/4 px-4 py-2">Created</th>
                    <th class="w-1/4 px-4 py-2">Ends</th>
                  </tr>
                </thead>
                <tbody>
                  ${bans}
                </tbody>
              </table>
              </div>
              
<script>
function search() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  table = document.getElementById("results");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}
</script>
            </body>
            </div>
        </html>
        `;
        res.send(out);
    })
});

// Individual Punishments
app.get('/punishments/:id', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || !completed) return res.redirect('/admin/setup');
    if(isNaN(req.params.id)) return do404(req, res);
    let sql = `SELECT * FROM \`Punishments\` WHERE id=${req.params.id}`;
    con.query(sql, async (err, result) => {
        if(err) throw err;
        if(result.length < 1) return do404(req, res);
        else {
            let ban = []
            result.forEach(async punishment => {
                let ends = '';
                let seconds = millisToSeconds(punishment.end) - Math.round(Date.now() / 1000);
                if(punishment.end == '-1') { 
                    if(punishment.punishmentType == "KICK") ends = `<td class="border px-4 py-2"><span class="text-green-700"><b>Ended</b></span></td>`;
                    else ends = '<td class="border px-4 py-2 text-red-700"><b>Permanent</b></td>'; 
                }
                else { 
                    let untilEnds = secondsToDhms(seconds);
                    let i;
                    if(untilEnds[0] !== "" && untilEnds[1] !== "") i = `${untilEnds[0]}, ${untilEnds[1]}`;
                    else if(untilEnds[0] !== "") i = untilEnds[0];
                    else if(untilEnds[1] !== "") i = untilEnds[1];
                    else if(untilEnds[2] !== "") i = untilEnds[2];
                    else if(untilEnds[3] !== "") i = untilEnds[3];
                    else i = `<span class="text-green-700"><b>Ended</b></span>`
                    ends = `<td class="border px-4 py-2">${i}</td>`; 
                }
                let type = '';
                if(punishment.punishmentType == 'IP_BAN') type = `<td class="border px-4 py-2 text-red-800"><b>IP Ban</b></td>`;
                else if(punishment.punishmentType == 'BAN') type = `<td class="border px-4 py-2 text-red-700"><b>Ban</b></td>`;
                else if(punishment.punishmentType == 'TEMP_BAN') type = `<td class="border px-4 py-2 text-red-600"><b>Temp-Ban</b></td>`;
                else if(punishment.punishmentType == 'WARNING') type = `<td class="border px-4 py-2 text-orange-700"><b>Warning</b></td>`;
                else if(punishment.punishmentType == 'TEMP_WARNING') type = `<td class="border px-4 py-2 text-orange-600"><b>Temp-Warning</b></td>`;
                else if(punishment.punishmentType == 'KICK') type = `<td class="border px-4 py-2 text-yellow-600"><b>Kick</b></td>`;
                else type = `<td class="border px-4 py-2 text-yellow-600"><b>${punishment.punishmentType}</b></td>`;


                ban.push(`
                <tr>
                    <td class="border px-4 py-2"><a href="/punishments/history/${punishment.id}">${punishment.name}</a></td>
                    <td class="border px-4 py-2">${punishment.operator}</td>
                    ${type}
                    <td class="border px-4 py-2">${punishment.reason}</td>
                    <td class="border px-4 py-2">${timeago(punishment.start)}</td>
                    ${ends}
                  </tr>`);
            });
            ban.join('')
            
        let title = '';
        let hostname = '';
        if(serverName != "") title = ` - ${serverName}`;
        if(serverHost != "" && serverName != "") hostname = ` - ${serverHost}`;
        else if(serverHost != "" && servername == "") hostname = serverHost;
        let out = `
        <!DOCTYPE html>
        <html>
            <head>
                <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
                <title>Punishment${title}</title>
            </head>
            <body class="overflow-x-hidden">
            <div class="flex">
            <div class="overflow-hidden shadow-md border-t-4 bg-white mb-4 rounded-b-lg rounded-t border-red-light w-full md:w-1/4">
                <div class="px-6 py-4 mb-2 mt-4 mb-8">
                    <div class="uppercase tracking-wide text-c2 mb-4">${serverName}${hostname}</div>
                    <div onclick="window.location.href='/punishments'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest border-b-0">
                    <img width="18" height="18" src="/svg/sledgehammer.svg" />
                        <div class="pl-2">Punishments</div>
                    </div>
                    <div onclick="window.location.href='/punishments/history'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest">
                        <svg width="18" height="18" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg">
                            <path d="M640 896v512h-256v-512h256zm384-512v1024h-256v-1024h256zm1024 1152v128h-2048v-1536h128v1408h1920zm-640-896v768h-256v-768h256zm384-384v1152h-256v-1152h256z"
                            />
                        </svg>
                        <div class="pl-2">History</div>
                        </div>
                      </div>
                      </div>
              
              <table id="results" class="table-fixed w-full align-end">
              <thead>
                <tr>
                  <th class="w-1/2 px-4 py-2">Player</th>
                  <th class="w-1/4 px-4 py-2">Operator</th>
                  <th class="w-1/4 px-4 py-2">Type</th>
                  <th class="w-1/4 px-4 py-2">Reason</th>
                  <th class="w-1/4 px-4 py-2">Created</th>
                  <th class="w-1/4 px-4 py-2">Ends</th>
                </tr>
              </thead>
              <tbody>
                ${ban}
              </tbody>
            </table>
            </div>
            </body>
            </div>
        </html>`
            res.send(out)
        };
    })
});
app.get('/punishments/history/:id', async (req, res) => {
    if(database_USER == "" || database_NAME == "" || database_HOST == "" || !completed) return res.redirect('/admin/setup');
    if(isNaN(req.params.id)) return do404(req, res);
    let sql = `SELECT * FROM \`PunishmentHistory\` WHERE id=${req.params.id}`;
    con.query(sql, async (err, result) => {
        if(err) throw err;
        if(result.length < 1) return do404(req, res);
        else {
            let ban = []
            result.forEach(async punishment => {
                let ends = '';
                let seconds = millisToSeconds(punishment.end) - Math.round(Date.now() / 1000);
                if(punishment.end == '-1') { 
                    if(punishment.punishmentType == "KICK") ends = `<td class="border px-4 py-2"><span class="text-green-700"><b>Ended</b></span></td>`;
                    else ends = '<td class="border px-4 py-2 text-red-700"><b>Permanent</b></td>'; 
                }
                else { 
                    let untilEnds = secondsToDhms(seconds);
                    let i;
                    if(untilEnds[0] !== "" && untilEnds[1] !== "") i = `${untilEnds[0]}, ${untilEnds[1]}`;
                    else if(untilEnds[0] !== "") i = untilEnds[0];
                    else if(untilEnds[1] !== "") i = untilEnds[1];
                    else if(untilEnds[2] !== "") i = untilEnds[2];
                    else if(untilEnds[3] !== "") i = untilEnds[3];
                    else i = `<span class="text-green-700"><b>Ended</b></span>`
                    ends = `<td class="border px-4 py-2">${i}</td>`; 
                }
                let type = '';
                if(punishment.punishmentType == 'IP_BAN') type = `<td class="border px-4 py-2 text-red-800"><b>IP Ban</b></td>`;
                else if(punishment.punishmentType == 'BAN') type = `<td class="border px-4 py-2 text-red-700"><b>Ban</b></td>`;
                else if(punishment.punishmentType == 'TEMP_BAN') type = `<td class="border px-4 py-2 text-red-600"><b>Temp-Ban</b></td>`;
                else if(punishment.punishmentType == 'WARNING') type = `<td class="border px-4 py-2 text-orange-700"><b>Warning</b></td>`;
                else if(punishment.punishmentType == 'TEMP_WARNING') type = `<td class="border px-4 py-2 text-orange-600"><b>Temp-Warning</b></td>`;
                else if(punishment.punishmentType == 'KICK') type = `<td class="border px-4 py-2 text-yellow-600"><b>Kick</b></td>`;
                else type = `<td class="border px-4 py-2 text-yellow-600"><b>${punishment.punishmentType}</b></td>`;


                ban.push(`
                <tr>
                    <td class="border px-4 py-2"><a href="/punishments/history/${punishment.id}">${punishment.name}</a></td>
                    <td class="border px-4 py-2">${punishment.operator}</td>
                    ${type}
                    <td class="border px-4 py-2">${punishment.reason}</td>
                    <td class="border px-4 py-2">${timeago(punishment.start)}</td>
                    ${ends}
                  </tr>`);
            });
            ban.join('')
            
        let title = '';
        let hostname = '';
        if(serverName != "") title = ` - ${serverName}`;
        if(serverHost != "" && serverName != "") hostname = ` - ${serverHost}`;
        else if(serverHost != "" && servername == "") hostname = serverHost;
        let out = `
        <!DOCTYPE html>
        <html>
            <head>
                <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
                <title>Punishment${title}</title>
            </head>
            <body class="overflow-x-hidden">
            <div class="flex">
            <div class="overflow-hidden shadow-md border-t-4 bg-white mb-4 rounded-b-lg rounded-t border-red-light w-full md:w-1/4">
                <div class="px-6 py-4 mb-2 mt-4 mb-8">
                    <div class="uppercase tracking-wide text-c2 mb-4">${serverName}${hostname}</div>
                    <div onclick="window.location.href='/punishments'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest border-b-0">
                    <img width="18" height="18" src="/svg/sledgehammer.svg" />
                        <div class="pl-2">Punishments</div>
                    </div>punish
                    <div onclick="window.location.href='/punishments/history'" class="flex cursor-pointer border px-4 py-2 text-lg text-grey-darkest">
                        <svg width="18" height="18" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg">
                            <path d="M640 896v512h-256v-512h256zm384-512v1024h-256v-1024h256zm1024 1152v128h-2048v-1536h128v1408h1920zm-640-896v768h-256v-768h256zm384-384v1152h-256v-1152h256z"
                            />
                        </svg>
                        <div class="pl-2">History</div>
                        </div>
                      </div>
                      </div>
              
              <table id="results" class="table-fixed w-full align-end">
              <thead>
                <tr>
                  <th class="w-1/2 px-4 py-2">Player</th>
                  <th class="w-1/4 px-4 py-2">Operator</th>
                  <th class="w-1/4 px-4 py-2">Type</th>
                  <th class="w-1/4 px-4 py-2">Reason</th>
                  <th class="w-1/4 px-4 py-2">Created</th>
                  <th class="w-1/4 px-4 py-2">Ends</th>
                </tr>
              </thead>
              <tbody>
                ${ban}
              </tbody>
            </table>
            </div>
            </body>
            </div>
        </html>`
            res.send(out)
        };
    })
});
app.get('/error/500',(req, res)=>res.send(error()));
app.use( async(err, req, res, text) => do500(err, req, res, text))
app.use( async(req, res, next) => do404(req, res, next))
http.listen(port);
