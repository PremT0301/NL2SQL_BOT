CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE Products (
    ProductId INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    StockQty INT NOT NULL,
    Price DECIMAL(10,2)
);

CREATE TABLE Suppliers (
    SupplierId INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Contact VARCHAR(100)
);

CREATE TABLE Orders (
    OrderId INT PRIMARY KEY AUTO_INCREMENT,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    OrderDate DATE,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

INSERT INTO Suppliers (Name, Contact) VALUES
('TechGlobal Inc.', 'contact@techglobal.com'),
('Office Depot Pro', 'support@officedepotpro.com'),
('Gadget World', 'sales@gadgetworld.com'),
('AudioPhile Gear', 'admin@audiophilegear.com'),
('Network Solutions', 'help@networksolutions.com');

INSERT INTO Products (Name, Category, StockQty, Price) VALUES
('Laptop Pro X1', 'Electronics', 5, 1200.00),
('Wireless Mouse', 'Accessories', 150, 25.50),
('Mechanical Keyboard', 'Accessories', 45, 89.99),
('HD Monitor 24inch', 'Electronics', 8, 199.99),
('USB-C Docking Station', 'Accessories', 200, 149.50),
('Ergonomic Chair', 'Office', 12, 350.00),
('Standing Desk', 'Office', 3, 550.00),
('Noise Cancelling Headphones', 'Electronics', 60, 299.99),
('Webcam 4K', 'Electronics', 4, 129.99),
('Desk Lamp', 'Office', 80, 45.00),
('HDMI Cable 2m', 'Accessories', 500, 12.50),
('Office Paper Ream', 'Office', 1000, 5.99),
('Smartphone Stand', 'Accessories', 75, 15.99),
('Bluetooth Speaker', 'Electronics', 25, 79.99),
('Portable SSD 1TB', 'Electronics', 9, 110.00);

CREATE TABLE IF NOT EXISTS QueryLogs (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    QueryText TEXT NOT NULL,
    Intent VARCHAR(50) NOT NULL,
    IsRejected BOOLEAN DEFAULT FALSE,
    RejectionReason TEXT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES
(1, 1, '2023-10-01'),
(2, 5, '2023-10-02'),
(12, 10, '2023-10-03'),
(4, 1, '2023-10-05'),
(8, 2, '2023-10-06'),
(3, 1, '2023-10-08'),
(11, 3, '2023-10-10'),
(6, 1, '2023-10-12'),
(5, 2, '2023-10-15'),
(9, 1, '2023-10-18'),
(7, 1, '2023-10-20'),
(2, 2, '2023-10-22'),
(10, 4, '2023-10-25'),
(1, 1, '2023-10-28'),
(15, 1, '2023-10-30');
