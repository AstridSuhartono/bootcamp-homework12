
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
                inquirer.prompt([
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
                    }
                ])
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

// ==== FUNCTION TO UPDATE DATA IN THE DATABASE ====
function updateCase() {
    inquirer.prompt({
        type: "list",
        name: "viewcase",
        message: "Which table would you like to update [department], [role], or [employee]?",
        choices: ["department", "role", "employee", "cancel"]
    })
        .then(function (answer) {
            if (answer.viewcase === "department") {
                connection.query("SELECT * FROM department", function (err, results) {
                    if (err) throw err;
                    inquirer.prompt([
                        {
                            type: "rawlist",
                            name: "choice",
                            choices: function () {
                                var choiceArray = [];
                                for (var i = 0; i < results.length; i++) {
                                    choiceArray.push(results[i].name);
                                }
                                return choiceArray;
                            },
                            message: "Which department would you like to update?"
                        },
                        {
                            type: "input",
                            name: "deptname",
                            message: "What is the new department name?"
                        }
                    ])
                        .then(function (answer) {
                            const chosenItem;
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].name === answer.choice) {
                                    chosenItem = results[i];
                                }
                            }
                            updateDepartmentQuery(chosenItem.id, answer.deptname);
                        });
                });
            }
            else if(answer.viewcase === "role"){
                connection.query("SELECT * FROM role", function (err, results) {
                    if (err) throw err;
                    inquirer.prompt([
                        {
                            type: "rawlist",
                            name: "choice",
                            choices: function () {
                                var choiceArray = [];
                                for (var i = 0; i < results.length; i++) {
                                    choiceArray.push(results[i].name);
                                }
                                return choiceArray;
                            },
                            message: "Which role would you like to update?"
                        },
                        {
                            type: "input",
                            name: "title",
                            message: "What is the new role name?"
                        },
                        {
                            type: "input",
                            name: "salary",
                            message: "What is the new salary?"
                        },
                        {
                            type: "input",
                            name: "department",
                            message: "What is the new department it belongs to?"
                        }
                    ])
                        .then(function (answer) {
                            const chosenItem;
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].name === answer.choice) {
                                    chosenItem = results[i];
                                }
                            }
                            updateRoleQuery(chosenItem.id, answer.title, answer.salary, answer.department);
                        });
                });
            }
            else {
                start();
            }
        });
}





//TODO create function to validate the input from inquirer both string max 30 chars and number (int and decimal)


// ==== QUERIES FUNCTIONS ====
function viewQuery(table) {
    connection.query("SELECT * FROM " + table, function (err, results) {
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
    const role = { title: title, salary: salary, department: department };
    connection.query("INSERT INTO role SET ?", role, function (err) {
        if (err) throw err;
        console.log(title + "role has been successfuly added");
        start();
    });
}

function addEmployeeQuery(firstName, lastName, role, manager) {
    const employee = { first_name: firstName, last_name: lastName, role_id: role, manager_id: manager };
    connection.query("INSERT INTO employee SET ?", employee, function (err) {
        if (err) throw err;
        console.log("New employee has been successfuly added");
        start();
    });
}

function updateDepartmentQuery(selectedId, updatedName){
    const updatedDepartment = {name: updatedName, id: selectedId}
    const query = connection.query("UPDATE department SET ? WHERE ?", updatedDepartment, function(err){
        if (error) throw err;
        console.log(query.sql);
        start();
    });
}

function updateRoleQuery(selectedId, updatedTitle, updatedSalary, updatedDepartment){
    const updatedRole = {title: updatedTitle, salary: updatedSalary, department_id: updatedDepartment};
    const query = connection.query("UPDATE role SET ? WHERE ?", [updatedRole, selectedId], function(err){
        if(error) throw err;
        console.log(query.sql);
        start();
    });
}