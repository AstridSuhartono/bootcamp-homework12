var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: process.env.PORT || 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "companyDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    start();
});

function start() {
    inquirer.prompt(
        {
            type: "list",
            name: "maincase",
            message: "Which functionality would you like to choose [ADD] , [VIEW] , or [UPDATE]?",
            choices: ["ADD", "VIEW", "UPDATE"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.maincase === "ADD") {
                addCase();
            }
            else if (answer.maincase === "VIEW") {
                viewCase();
            }
            else if (answer.maincase === "UPDATE") {
                updateCase();
            }
            else {
                connection.end();
            }
        });
}

function addCase() {
    inquirer.prompt(
        {
            type: "list",
            name: "addcase",
            message: "Would you like to add data into [department], [role], or [employee]?",
            choices: ["department", "role", "employee"]
        })
        .then(function(answer){
            if (answer.addcase === "department"){
         
            }
        });
}