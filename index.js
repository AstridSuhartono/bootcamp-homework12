
var mysql = require("mysql");
var inquirer = require("inquirer");
//var query = require("query.js");
const cTable = require('console.table');

// ==== CREATE THE CONNECTION INFO FOR MYSQL ====
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: process.env.PORT || 3306,

    // Your username for mysql 
    user: "root",

    // Your password for mysql
    password: "password",

    database: "companyDB"
});

// ==== CONNECT TO MYSQL SERVER AND DATABASE ====
connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    console.log("Welcome to the employees tracker application!");
    start();
});

// ==== FUNCTION TO PROMPT USER WHICH ACTION THEY WANT TO DO ====
function start() {
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
// ==== FUNCTION TO VIEW DATA IN THE DATABASE ====
function viewCase() {
    inquirer.prompt({
        type: "list",
        name: "viewcase",
        message: "Which table would you like to view [department], [role], or [employee]?",
        choices: ["department", "role", "employee", "cancel"]
    })
        .then(function (answer) {
            if (answer.viewcase === "cancel") {
                start();
            }
            else {
                viewQuery(answer.viewcase);
            }
        });
}

// ==== FUNCTION TO INSERT DATA INTO THE DATABASE ====
function addCase() {
    inquirer.prompt(
        {
            type: "list",
            name: "addcase",
            message: "Which table would you like to add data into [department], [role], or [employee]?",
            choices: ["department", "role", "employee", "cancel"]
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
            }
            else if (answer.addcase === "role") {
                //TODO add function to check if department data is not 0
                inquirer.prompt(
                    {
                        type: "input",
                        name: "title",
                        message: "What is the role title?"
                    },
                    {
                        type: "input",
                        name: "salary",
                        message: "How much is the salary?"
                    },
                    {
                        type: "input",
                        name: "department",
                        message: "which department it belongs to?"
                    })
                    .then(function (answer) {
                        addRoleQuery(answer.title, answer.salary, answer.department);
                    });
            }
            else if (answer.addcase === "employee") {
                //TODO add function to check if role data is not 0
                inquirer.prompt([
                    {
                        type: "input",
                        name: "firstname",
                        message: "What is the employee first name?"
                    },
                    {
                        type: "input",
                        name: "lastname",
                        message: "What is the employee last name?"
                    },
                    {
                        type: "input",
                        name: "role",
                        message: "what is the employee role? (enter the role id number)"
                    },
                    {
                        type: "input",
                        name: "manager",
                        message: "Who is the manager? (enter the manager id number)",
                        default: null
                    }
                ])
                    .then(function (answer) {
                        addEmployeeQuery(answer.firstname, answer.lastname, answer.role, answer.manager);
                    });
            }
            else {
                start();
            }
        });
}




//TODO create function to validate the input from inquirer both string max 30 chars and number (int and decimal)


// ==== QUERIES FUNCTIONS ====
function viewQuery(table){
    connection.query("SELECT * FROM " + table, function(err,results){ 
        if (err) throw err;
        console.table(results);
        start();
    });
}

function addDeptQuery(name) {
    connection.query("INSERT INTO department SET ?", { name: name }, function (err) {
        if (err) throw err;
        console.log(name + " department has been successfully added");
        start();
    });
}

function addRoleQuery(title, salary, department) {
    let role = { title: title, salary: salary, department: department };
    connection.query("INSERT INTO role SET ?", role, function (err) {
        if (err) throw err;
        console.log(title + "role has been successfuly added");
        start();
    });
}

function addEmployeeQuery(firstName, lastName, role, manager) {
    let employee = { first_name: firstName, last_name: lastName, role_id: role, manager_id: manager };
    connection.query("INSERT INTO employee SET ?", employee, function (err) {
        if (err) throw err;
        console.log("New employee has been successfuly added");
        start();
    });
}