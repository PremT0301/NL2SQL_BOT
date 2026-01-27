import random
import datetime

# Configuration
NUM_PRODUCTS = 150
NUM_SUPPLIERS = 60
NUM_ORDERS = 350
OUTPUT_FILE = 'd:/EDU/NL2SQL_BOT/database/seed_data_large.sql'

# Constants
CATEGORIES = ['Electronics', 'Accessories', 'Office', 'Networking', 'Peripherals']
ADJECTIVES = ['Pro', 'Ultra', 'Super', 'Slim', 'Wireless', 'Gaming', 'Ergonomic', 'Smart', 'HD', '4K', 'Portable', 'Mechanical', 'Noise-Cancelling', 'High-Performance']
NOUNS = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Speaker', 'Webcam', 'Router', 'Switch', 'Hub', 'Cable', 'Charger', 'Stand', 'Desk', 'Chair', 'Hard Drive', 'SSD', 'Tablet', 'Stylus', 'Printer']
COMPANY_SUFFIXES = ['Inc.', 'Corp.', 'Solutions', 'Systems', 'GMBH', 'Ltd.', 'Enterprises', 'Tech', 'Logistics', 'Supplies']
FIRST_NAMES = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Chris', 'Jessica', 'Robert', 'Lisa']
LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
DOMAINS = ['gmail.com', 'outlook.com', 'company.com', 'tech.org', 'biz.net']

def generate_product_name(category):
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    model = random.randint(100, 9990)
    return f"{adj} {noun} {model}"

def generate_supplier_name():
    prefix = random.choice(ADJECTIVES + NOUNS)
    suffix = random.choice(COMPANY_SUFFIXES)
    return f"{prefix} {suffix}"

def generate_contact(name):
    if random.random() < 0.7:
        # Email
        clean_name = name.lower().replace(' ', '').replace('.', '')
        domain = random.choice(DOMAINS)
        return f"{clean_name}@{domain}"
    else:
        # Phone
        return f"{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

def generate_date():
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=365)
    random_days = random.randint(0, 365)
    return start_date + datetime.timedelta(days=random_days)

def escape_sql(val):
    if isinstance(val, str):
        val = val.replace("'", "''")
        return f"'{val}'"
    if isinstance(val, datetime.date):
        return f"'{val}'"
    return str(val)

def generate_sql():
    sql_statements = []
    
    # --- Suppliers ---
    suppliers_data = []
    supplier_names = set()
    while len(suppliers_data) < NUM_SUPPLIERS:
        name = generate_supplier_name()
        if name in supplier_names:
            continue
        supplier_names.add(name)
        contact = generate_contact(name)
        suppliers_data.append(f"({escape_sql(name)}, {escape_sql(contact)})")
    
    sep = ',\n'
    sql_statements.append(f"INSERT INTO Suppliers (Name, Contact) VALUES\n{sep.join(suppliers_data)};")
    
    # --- Products ---
    products_data = []
    existing_product_count = 15 # We know we have 15 seeded already
    
    for i in range(NUM_PRODUCTS):
        cat = random.choice(CATEGORIES)
        name = generate_product_name(cat)
        
        # Stock Logic
        rand_val = random.random()
        if rand_val < 0.25:
            stock = random.randint(0, 9)
        elif rand_val < 0.50:
            stock = random.randint(101, 500)
        else:
            stock = random.randint(10, 100)
            
        # Price Logic
        if cat == 'Electronics':
            price = round(random.uniform(50.0, 2000.0), 2)
        elif cat == 'Accessories':
            price = round(random.uniform(10.0, 150.0), 2)
        elif cat == 'Office':
            price = round(random.uniform(5.0, 500.0), 2)
        else:
            price = round(random.uniform(20.0, 300.0), 2)
            
        products_data.append(f"({escape_sql(name)}, {escape_sql(cat)}, {stock}, {price})")
        
    sql_statements.append(f"INSERT INTO Products (Name, Category, StockQty, Price) VALUES\n{sep.join(products_data)};")

    # --- Orders ---
    orders_data = []
    total_products = existing_product_count + NUM_PRODUCTS
    
    for i in range(NUM_ORDERS):
        # 1-indexed Product IDs
        prod_id = random.randint(1, total_products)
        qty = random.randint(1, 30)
        date = generate_date()
        
        orders_data.append(f"({prod_id}, {qty}, {escape_sql(date)})")
        
    sql_statements.append(f"INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES\n{sep.join(orders_data)};")
    
    return "\n\n".join(sql_statements)

if __name__ == "__main__":
    try:
        content = generate_sql()
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully generated {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error: {e}")
