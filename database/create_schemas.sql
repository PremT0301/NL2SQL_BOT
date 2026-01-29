-- Schema Creation Script for Novotel and PVRINOX

-- ==========================================
-- 1. NOVOTEL_DB (Restaurant)
-- ==========================================
CREATE DATABASE IF NOT EXISTS novotel_db;
USE novotel_db;

DROP TABLE IF EXISTS SalesSummary;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS FoodItems;

CREATE TABLE FoodItems (
    FoodId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Category VARCHAR(100),
    Price DECIMAL(10, 2),
    Availability BOOLEAN DEFAULT TRUE
);

CREATE TABLE Staff (
    StaffId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100), -- Chef, Waiter, Manager
    Shift VARCHAR(50)  -- Morning, Evening, Night
);

CREATE TABLE Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    FoodId INT,
    Quantity INT,
    OrderDate DATE,
    FOREIGN KEY (FoodId) REFERENCES FoodItems(FoodId)
);

CREATE TABLE SalesSummary (
    FoodId INT,
    TotalSold INT DEFAULT 0,
    FOREIGN KEY (FoodId) REFERENCES FoodItems(FoodId)
);

-- ==========================================
-- 2. PVRINOX_DB (Cinema)
-- ==========================================
CREATE DATABASE IF NOT EXISTS pvrinox_db;
USE pvrinox_db;

DROP TABLE IF EXISTS SalesSummary;
DROP TABLE IF EXISTS Shows;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Snacks;
DROP TABLE IF EXISTS Movies;

CREATE TABLE Movies (
    MovieId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Genre VARCHAR(100),
    Rating DECIMAL(3, 1),
    Duration INT -- Minutes
);

CREATE TABLE Snacks (
    SnackId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Price DECIMAL(10, 2),
    StockQty INT
);

CREATE TABLE Staff (
    StaffId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100) -- Projectionist, Counter, Cleaning
);

CREATE TABLE Shows (
    ShowId INT AUTO_INCREMENT PRIMARY KEY,
    MovieId INT,
    ShowTime DATETIME,
    ScreenNo INT,
    TicketsSold INT,
    FOREIGN KEY (MovieId) REFERENCES Movies(MovieId)
);

CREATE TABLE SalesSummary (
    MovieId INT,
    TotalTicketsSold INT DEFAULT 0,
    FOREIGN KEY (MovieId) REFERENCES Movies(MovieId)
);
