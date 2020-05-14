var mysql = require("mysql");
var inquirer = require("inquirer");
//var query = require("query.js");
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
    console.log("Welcome to the employees tracker application!");
    inquirer.prompt(
        {
            type: "list",
            name: "maincase",
            message: "Which functionality would you like to choose [ADD] , [VIEW] , [UPDATE], or [DELETE]?",
            choices: ["ADD", "VIEW", "UPDATE", "DELETE", "EXIT"]
        })
        .then(function (answer) {
            // based on their answer, call the related functions
            if (answer.maincase === "ADD") {
                addCase();
            }
            else if (answer.maincase === "VIEW") {
                viewCase();
            }
            else if (answer.maincase === "UPDATE") {
                updateCase();
            }
            else if (answer.maincase === "DELETE") {
                deleteCase();
            }
            else {
                console.log("Exit the application.")
                connection.end();
            }
        });
}

function addCase() {
    inquirer.prompt(
        {
            type: "list",
            name: "addcase",
            message: "Which table would you like to add data into [department], [role], or [employee]?",
            choices: ["department", "role", "employee"]
        })
        .then(function (answer) {
            if (answer.addcase === "department") {
                inquirer.prompt(
                    {
                        type: "input",
                        name: "deptname",
                        message: "What is the department name?"
                    })
                    .then(function (answer) {
                        addDeptQuery(answer.deptname);
                    });
            };
        });
}

function addDeptQuery(answer) {
    connection.query("INSERT INTO department SET ?", { name: answer }, function (err) {
        if (err) throw err;
        console.log("New department have been successfully added");
        start();
    });
}