DROP DATABASE IF EXISTS companyDB;

CREATE DATABASE companyDB;

USE companyDB;

CREATE TABLE Department (
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
);
  
CREATE TABLE Role (
	id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR(30) NOT NULL,
	salary DECIMAL(10,2) NOT NULL,
	department_id INT,
	PRIMARY KEY (id),
	FOREIGN KEY (department_id) 
		REFERENCES Department(id)
        ON DELETE SET NULL
);

CREATE TABLE Employee (
	id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id)
		REFERENCES Role(id),
	FOREIGN KEY (manager_id)
		REFERENCES Employee(id)
);
