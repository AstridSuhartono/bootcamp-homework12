
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

// ==== CREATE THE CONNECTION INFO FOR MYSQL ====
const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: process.env.PORT || 3306,

    // Your username for mysql 
    user: "root",

    // Your password for mysql
    password: "",

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
            message: "Which functionality would you like to choose?",
            choices: ["ADD DATA", "VIEW DATA", "UPDATE DATA", "DELETE DATA", "VIEW EMPLOYEES BY MANAGER", "DEPARTMENT UTILISED BUDGET", "EXIT"]
        })
        .then(function (answer) {
            // based on their answer, call the related functions
            if (answer.maincase === "ADD DATA") {
                addCase();
            }
            else if (answer.maincase === "VIEW DATA") {
                viewCase();
            }
            else if (answer.maincase === "UPDATE DATA") {
                console.log("INFO: change in role id or manager id must be number")
                updateCase();
            }
            else if (answer.maincase === "DELETE DATA") {
                deleteCase();
            }
            else if (answer.maincase === "VIEW EMPLOYEES BY MANAGER") {
                viewEmployeeByManager();
            }
            else if (answer.maincase === "DEPARTMENT UTILISED BUDGET") {
                utilisedBudget();
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

// ==== FUNCTION TO ADD DATA INTO THE DATABASE ====
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
                console.log("INFO: department name must be less than 31 characters");
                inquirer.prompt(
                    {
                        type: "input",
                        name: "deptname",
                        message: "What is the department name?",
                        validate: validateLengthInput
                    })
                    .then(function (answer) {
                        addDeptQuery(answer.deptname);
                    });
            }
            else if (answer.addcase === "role") {
                console.log("INFO: salary and department id must be in number, title must be less than 31 characters");
                inquirer.prompt([
                    {
                        type: "input",
                        name: "title",
                        message: "What is the role title?",
                        validate: validateLengthInput
                    },
                    {
                        type: "input",
                        name: "salary",
                        message: "How much is the salary?",
                        validate: validateNumberInput
                    },
                    {
                        type: "input",
                        name: "department",
                        message: "which department id it belongs to?",
                        validate: validateNumberInput
                    }
                ])
                    .then(function (answer) {
                        addRoleQuery(answer.title, answer.salary, answer.department);
                    });
            }
            else if (answer.addcase === "employee") {
                console.log("INFO: role and manager id must be in number, other information must be less than 31 characters");
                inquirer.prompt([
                    {
                        type: "input",
                        name: "firstname",
                        message: "What is the employee first name?",
                        validate: validateLengthInput
                    },
                    {
                        type: "input",
                        name: "lastname",
                        message: "What is the employee last name?",
                        validate: validateLengthInput
                    },
                    {
                        type: "input",
                        name: "role",
                        message: "what is the employee role? (enter the role id number)",
                        validate: validateNumberInput
                    },
                    {
                        type: "input",
                        name: "manager",
                        message: "Who is the manager? (enter the manager id number or leave empty if no manager to report to)",
                        default: ""
                    }
                ])
                    .then(function (answer) {
                        if (answer.manager != "") {
                            addEmployeeWithManagerQuery(answer.firstname, answer.lastname, answer.role, answer.manager);
                        }
                        else {
                            addEmployeeQuery(answer.firstname, answer.lastname, answer.role);
                        }
                    });
            }
            else {
                start();
            }
        });
}

// ==== FUNCTION TO UPDATE EMPLOYEE IN THE DATABASE ====
function updateCase() {
    inquirer.prompt({
        type: "list",
        name: "updatecase",
        message: "Do you want to update employee [role], or [manager]?",
        choices: ["role", "manager", "cancel"]
    })
        .then(function (answer) {
            if (answer.updatecase === "cancel") {
                start();
            }
            else {
                connection.query("SELECT * FROM employee", function (err, results) {
                    if (err) throw err;
                    if (answer.updatecase === "role") {
                        inquirer.prompt([
                            {
                                type: "list",
                                name: "choice",
                                choices: renderChoices(results),
                                message: "Which employee id has role change?"
                            },
                            {
                                type: "input",
                                name: "role",
                                message: "What is the new role id of the employee?",
                                validate: validateNumberInput
                            }
                        ])
                            .then(function (answer) {
                                let chosenItem = setDataChosen(answer, results);
                                updateRoleQuery(answer.role, chosenItem.id);
                            });
                    }
                    else if (answer.updatecase === "manager") {
                        inquirer.prompt([
                            {
                                type: "list",
                                name: "choice",
                                choices: renderChoices(results),
                                message: "Which employee id to update the manager?"
                            },
                            {
                                type: "input",
                                name: "manager",
                                message: "What is the new manager id of the employee?",
                                validate: validateNumberInput
                            }
                        ])
                            .then(function (answer) {
                                let chosenItem = setDataChosen(answer, results);
                                updateManagerQuery(answer.manager, chosenItem.id);
                            });
                    }
                });
            }
        });
}

// ==== FUNCTION TO DELETE DATA IN DATABASE ====
function deleteCase() {
    inquirer.prompt({
        type: "list",
        name: "deletecase",
        message: "Do you want to delete [department], [role] or [employee]?",
        choices: ["department", "role", "employee", "cancel"]
    })
        .then(function (answer) {
            if (answer.deletecase === "department") {
                connection.query("SELECT * FROM department", function (err, results) {
                    if (err) throw err;
                    inquirer.prompt({
                        type: "list",
                        name: "choice",
                        choices: renderChoices(results),
                        message: "Which department id to delete?"
                    })
                        .then(function (answer) {
                            deleteDeptQuery(answer.choice);
                        });
                });
            }
            else if (answer.deletecase === "role") {
                connection.query("SELECT * FROM role", function (err, results) {
                    if (err) throw err;
                    inquirer.prompt({
                        type: "list",
                        name: "choice",
                        choices: renderChoices(results),
                        message: "Which role id to delete?"
                    })
                        .then(function (answer) {
                            deleteRoleQuery(answer.choice);
                        });
                });
            }
            else if (answer.deletecase === "employee") {
                connection.query("SELECT * FROM employee", function (err, results) {
                    if (err) throw err;
                    inquirer.prompt({
                        type: "list",
                        name: "choice",
                        choices: renderChoices(results),
                        message: "Which employee id to delete?"
                    })
                        .then(function (answer) {
                            deleteEmployeeQuery(answer.choice);
                        });
                });
            }
            else {
                start();
            }
        });
}

// ==== EXTRA FUNCTIONS ====
function viewEmployeeByManager() {
    connection.query("SELECT manager_id FROM employee WHERE manager_id IS NOT NULL", function (err, results) {
        if (err) throw err;
        inquirer.prompt({
            type: "list",
            name: "managerid",
            message: "Under which manager id would you like to get employees from?",
            choices: function () {
                let choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].manager_id);
                }
                return choiceArray;
            }
        })
            .then(function (answer) {
                employeeByManagerQuery(answer.managerid);
            });
    });
}


function utilisedBudget() {
    console.log("utilised budget per department function is trigerred");
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        inquirer.prompt({
            type: "list",
            name: "deptid",
            message: "Which department to view total utilised budget?",
            choices: function () {
                let choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].id);
                }
                return choiceArray;
            }
        })
            .then(function (answer) {
                budgetPerDepartmentQuery(answer.deptid);
            });
    });
}

// ==== VALIDATION FUNCTIONS ====
function validateNumberInput(value) {
    var num = value.match(/^[0-9]+$/);
    if (num) {
        return true;
    }
    return `Please enter a valid number`;
}

function validateLengthInput(value) {
    if (value.length < 31) {
        return true;
    }
    return `Please enter a value of less than 31 characters`;
}


// ==== HELPER FUNCTIONS ====
function renderChoices(results) {
    let choiceArray = [];
    for (var i = 0; i < results.length; i++) {
        choiceArray.push(results[i].id);
    }
    return choiceArray;
}

function setDataChosen(answer, results) {
    let chosenItem;
    for (var i = 0; i < results.length; i++) {
        if (results[i].id === answer.choice) {
            chosenItem = results[i];
        }
    }
    return chosenItem;
}

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
    const role = { title: title, salary: salary, department_id: department };
    connection.query("INSERT INTO role SET ?", role, function (err) {
        if (err) throw err;
        console.log(title + "role has been successfuly added");
        start();
    });
}

function addEmployeeWithManagerQuery(firstName, lastName, role, manager) {
    const employee = { first_name: firstName, last_name: lastName, role_id: role, manager_id: manager };
    connection.query("INSERT INTO employee SET ?", employee, function (err) {
        if (err) throw err;
        console.log("New employee has been successfuly added");
        start();
    });
}

function addEmployeeQuery(firstName, lastName, role) {
    const employee = { first_name: firstName, last_name: lastName, role_id: role };
    connection.query("INSERT INTO employee SET ?", employee, function (err) {
        if (err) throw err;
        console.log("New employee has been successfuly added");
        start();
    });
}

function updateRoleQuery(updatedRole, selectedId) {
    const updatedEmployee = [{ role_id: updatedRole }, { id: selectedId }];
    let query = connection.query("UPDATE employee SET ? WHERE ?", updatedEmployee, function (err) {
        if (err) throw err;
        console.log(query.sql);
        start();
    });
}

function updateManagerQuery(updatedManager, selectedId) {
    const updatedEmployee = [{ manager_id: updatedManager }, { id: selectedId }];
    let query = connection.query("UPDATE EMPLOYEE SET ? WHERE ?", updatedEmployee, function (err) {
        if (err) throw err;
        console.log(query.sql);
        start();
    });
}

function deleteDeptQuery(selectedId) {
    let query = connection.query("DELETE FROM department WHERE ?", { id: selectedId }, function (err, results) {
        if (err) throw err;
        console.log(query.sql);
        console.log(results.affectedRows + " department deleted!\n");
        start();
    });
}

function deleteRoleQuery(selectedId) {
    let query = connection.query("DELETE FROM role WHERE ?", { id: selectedId }, function (err, results) {
        if (err) throw err;
        console.log(query.sql);
        console.log(results.affectedRows + " role deleted!\n");
        start();
    });
}

function deleteEmployeeQuery(selectedId) {
    let query = connection.query("DELETE FROM employee WHERE ?", { id: selectedId }, function (err, results) {
        if (err) throw err;
        console.log(query.sql);
        console.log(results.affectedRows + " employee deleted!\n");
        start();
    });
}

function employeeByManagerQuery(managerId) {
    connection.query("SELECT id, first_name, last_name, role_id FROM employee WHERE manager_id = ?", managerId, function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    });
}

function budgetPerDepartmentQuery(departmentId) {
    connection.query("SELECT d.name, SUM(r.salary) AS 'Total' FROM department d JOIN role r ON d.id = r.department_Id JOIN employee e ON r.id = e.role_id WHERE d.id = ?",
        departmentId, function (err, results) {
            if (err) throw err;
            console.table(results);
            start();
        });
}