import random
import datetime

# Configuration
NOVOTEL_FILE = "novotel_seed.sql"
PVR_FILE = "pvrinox_seed.sql"

# --- Shared Helpers ---
def escape_str(s):
    return "'" + s.replace("'", "''") + "'"

def random_date(start_days_ago, end_days_ago=0):
    start = datetime.datetime.now() - datetime.timedelta(days=start_days_ago)
    end = datetime.datetime.now() - datetime.timedelta(days=end_days_ago)
    return start + (end - start) * random.random()

# ==========================================
# NOVOTEL GENERATION
# ==========================================
def generate_novotel():
    sql = []
    sql.append("USE novotel_db;")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql.append("-- Novotel Seed Data")
    
    # 1. FoodItems
    food_items = [
        # Starters
        ("Paneer Tikka", "Starter", 350, True),
        ("Chicken Malai Tikka", "Starter", 450, True),
        ("Veg Crispy", "Starter", 280, True),
        ("Prawns Koliwada", "Starter", 550, True),
        ("Mushroom Bruschetta", "Starter", 320, True),
        ("Chicken Wings", "Starter", 380, True),
        ("Fish Fingers", "Starter", 420, False),
        ("Hara Bhara Kabab", "Starter", 300, True),
        ("Corn Cheese Balls", "Starter", 290, True),
        ("Mutton Seekh Kabab", "Starter", 580, True),
        # Main Course
        ("Butter Chicken", "Main Course", 480, True),
        ("Paneer Butter Masala", "Main Course", 390, True),
        ("Dal Makhani", "Main Course", 350, True),
        ("Mutton Rogan Josh", "Main Course", 620, True),
        ("Veg Biryani", "Main Course", 350, True),
        ("Chicken Biryani", "Main Course", 450, True),
        ("Prawns Curry", "Main Course", 590, True),
        ("Aloo Gobi", "Main Course", 250, True),
        ("Palak Paneer", "Main Course", 380, True),
        ("Chicken Chettinad", "Main Course", 490, True),
        ("Veg Pulao", "Main Course", 280, True),
        ("Jeera Rice", "Main Course", 200, True),
        ("Garlic Naan", "Main Course", 80, True),
        ("Butter Naan", "Main Course", 60, True),
        ("Tandoori Roti", "Main Course", 40, True),
        # Dessert
        ("Gulab Jamun", "Dessert", 150, True),
        ("Rasmalai", "Dessert", 180, True),
        ("Chocolate Brownie", "Dessert", 220, True),
        ("Ice Cream", "Dessert", 120, True),
        ("Sizzling Brownie", "Dessert", 280, True),
        ("Gajar Halwa", "Dessert", 200, False),
        # Beverage
        ("Fresh Lime Soda", "Beverage", 110, True),
        ("Iced Tea", "Beverage", 140, True),
        ("Cola", "Beverage", 80, True),
        ("Mineral Water", "Beverage", 40, True),
        ("Cold Coffee", "Beverage", 180, True),
        ("Virgin Mojito", "Beverage", 190, True),
        ("Lassi", "Beverage", 130, True),
        ("Mango Shake", "Beverage", 210, False)
    ]
    
    # Track FoodIDs for orders (assuming auto-increment starts at 1)
    # We will generate INSERT statements and keep track of IDs
    food_ids = list(range(1, len(food_items) + 1))
    
    # FoodItems Inserts
    sql.append("\n-- FoodItems")
    sql.append("TRUNCATE TABLE FoodItems;")
    vals = []
    for f in food_items:
        vals.append(f"({escape_str(f[0])}, {escape_str(f[1])}, {f[2]}, {str(f[3]).upper()})")
    sql.append(f"INSERT INTO FoodItems (Name, Category, Price, Availability) VALUES {', '.join(vals)};")

    # 2. Staff
    staff_members = [
        ("Rahul Sharma", "Chef", "Morning"),
        ("Amit Verma", "Chef", "Evening"),
        ("Suresh Raina", "Chef", "Night"),
        ("Priya Singh", "Waiter", "Morning"),
        ("Neha Gupta", "Waiter", "Morning"),
        ("Rohan Das", "Waiter", "Evening"),
        ("Vikas Khanna", "Waiter", "Evening"),
        ("Sneha Patil", "Waiter", "Night"),
        ("Arjun Kapoor", "Waiter", "Night"),
        ("Manoj Bajpayee", "Manager", "Morning"),
        ("Deepika Padukone", "Manager", "Evening"),
        ("Ranveer Singh", "Manager", "Night"),
        ("Kajol Devgan", "Waiter", "Morning"),
        ("Ajay Devgan", "Chef", "Evening"),
        ("Shahrukh Khan", "Waiter", "Night"),
        ("Salman Khan", "Cleaner", "Morning"), # Adding cleaner as filler/waiter equivalent if needed or just varied role
        ("Aamir Khan", "Waiter", "Evening")
    ]
    # Correcting role for Salman to standard required roles if strict, but prompt said "Chef, Waiter, Manager"
    # User prompt said: Role VARCHAR (Chef, Waiter, Manager)
    # Let's fix Salman to Waiter
    staff_members[15] = ("Salman Khan", "Waiter", "Morning")

    sql.append("\n-- Staff")
    sql.append("TRUNCATE TABLE Staff;")
    staff_vals = []
    for s in staff_members:
        staff_vals.append(f"({escape_str(s[0])}, {escape_str(s[1])}, {escape_str(s[2])})")
    sql.append(f"INSERT INTO Staff (Name, Role, Shift) VALUES {', '.join(staff_vals)};")

    # 3. Orders
    num_orders = random.randint(150, 250)
    sql.append(f"\n-- Orders ({num_orders} records)")
    sql.append("TRUNCATE TABLE Orders;")
    
    orders_data = []
    food_sales = {fid: 0 for fid in food_ids} # for SalesSummary

    for _ in range(num_orders):
        fid = random.choice(food_ids)
        qty = random.randint(1, 8)
        # Last 6 months = approx 180 days
        odate = random_date(180, 0).strftime('%Y-%m-%d')
        
        orders_data.append(f"({fid}, {qty}, {escape_str(odate)})")
        food_sales[fid] += qty

    # Batch inserts for Orders to avoid huge query string
    batch_size = 50
    for i in range(0, len(orders_data), batch_size):
        batch = orders_data[i:i+batch_size]
        sql.append(f"INSERT INTO Orders (FoodId, Quantity, OrderDate) VALUES {', '.join(batch)};")


    # 4. SalesSummary
    sql.append("\n-- SalesSummary")
    sql.append("TRUNCATE TABLE SalesSummary;")
    summary_vals = []
    for fid, total in food_sales.items():
        if total > 0: # Only insert if sold? Or insert 0? User asked one row per FoodId
             summary_vals.append(f"({fid}, {total})")
        else:
             summary_vals.append(f"({fid}, 0)")
    
    if summary_vals:
        sql.append(f"INSERT INTO SalesSummary (FoodId, TotalSold) VALUES {', '.join(summary_vals)};")

    return "\n".join(sql)

# ==========================================
# PVRINOX GENERATION
# ==========================================
def generate_pvrinox():
    sql = []
    sql.append("USE pvrinox_db;")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql.append("-- PVRINOX Seed Data")

    # 1. Movies
    movies = [
        # Action
        ("Pathaan", "Action", 7.8, 146),
        ("Jawan", "Action", 8.2, 169),
        ("Mission Impossible 7", "Action", 8.0, 163),
        ("Tiger 3", "Action", 7.0, 156),
        # Drama
        ("Oppenheimer", "Drama", 8.5, 180),
        ("12th Fail", "Drama", 9.2, 147),
        ("Rocky Aur Rani", "Drama", 7.5, 168),
        # Comedy
        ("Dunki", "Comedy", 7.2, 161),
        ("Dream Girl 2", "Comedy", 6.9, 133),
        ("Fukrey 3", "Comedy", 6.5, 150),
        # Thriller
        ("Drishyam 2", "Thriller", 8.6, 140),
        ("Merry Christmas", "Thriller", 8.0, 144),
        ("Animal", "Thriller", 7.8, 201), # Capped at 180 in prompt? "Duration 90–180". Animal is long. Let's clamp.
        # Animation
        ("Spider-Man: Across the Spider-Verse", "Animation", 9.0, 140),
        ("Elemental", "Animation", 7.4, 101),
        ("Kung Fu Panda 4", "Animation", 7.6, 94),
        # Extras
        ("Sam Bahadur", "Drama", 8.1, 150),
        ("Salaar", "Action", 7.1, 175)
    ]
    # Fix Animal Duration
    movies_fixed = []
    for m in movies:
        dur = m[3]
        if dur > 180: dur = 180
        movies_fixed.append((m[0], m[1], m[2], dur))
    movies = movies_fixed

    movie_ids = list(range(1, len(movies) + 1))

    sql.append("\n-- Movies")
    sql.append("TRUNCATE TABLE Movies;")
    vals = []
    for m in movies:
        vals.append(f"({escape_str(m[0])}, {escape_str(m[1])}, {m[2]}, {m[3]})")
    sql.append(f"INSERT INTO Movies (Name, Genre, Rating, Duration) VALUES {', '.join(vals)};")

    # 2. Snacks
    snacks = [
        ("Salted Popcorn (R)", 250, 100),
        ("Salted Popcorn (L)", 350, 80),
        ("Cheese Popcorn (R)", 280, 90),
        ("Caramel Popcorn (L)", 400, 60),
        ("Nachos with Salsa", 220, 50),
        ("Nachos with Cheese", 250, 40),
        ("Coke (R)", 150, 200),
        ("Coke (L)", 200, 150),
        ("Sprite (L)", 200, 100),
        ("Chicken Nuggets", 220, 15), # Low stock
        ("Veg Burger", 180, 10), # Low stock
        ("Hot Dog", 200, 5), # Low stock
        ("Combo: Popcorn + Coke", 450, 120),
        ("Combo: Nachos + Coke", 380, 110),
        ("Mineral Water", 50, 300),
        ("Chocolate Bar", 80, 50)
    ]
    
    sql.append("\n-- Snacks")
    sql.append("TRUNCATE TABLE Snacks;")
    snack_vals = []
    for s in snacks:
        snack_vals.append(f"({escape_str(s[0])}, {s[1]}, {s[2]})")
    sql.append(f"INSERT INTO Snacks (Name, Price, StockQty) VALUES {', '.join(snack_vals)};")

    # 3. Staff
    staff = [
        ("Ramesh Pawar", "Projectionist"),
        ("Suresh Patil", "Projectionist"),
        ("Ganesh Gaikwad", "Counter"),
        ("Pooja Hegde", "Counter"),
        ("Alia Bhatt", "Counter"),
        ("Ranbir Kapoor", "Cleaning"),
        ("Varun Dhawan", "Cleaning"),
        ("Sid Malhotra", "Cleaning"),
        ("Katrina Kaif", "Counter"),
        ("Vicky Kaushal", "Projectionist"),
        ("Kiara Advani", "Counter"),
        ("Kartik Aaryan", "Cleaning"),
        ("Kriti Sanon", "Counter")
    ]
    
    sql.append("\n-- Staff")
    sql.append("TRUNCATE TABLE Staff;")
    staff_vals = []
    for s in staff:
        staff_vals.append(f"({escape_str(s[0])}, {escape_str(s[1])})")
    sql.append(f"INSERT INTO Staff (Name, Role) VALUES {', '.join(staff_vals)};")

    # 4. Shows & SalesSummary
    num_shows = random.randint(120, 200)
    sql.append(f"\n-- Shows ({num_shows} records)")
    sql.append("TRUNCATE TABLE Shows;")

    shows_data = []
    movie_sales = {mid: 0 for mid in movie_ids}

    for _ in range(num_shows):
        mid = random.choice(movie_ids)
        screen = random.randint(1, 6)
        sold = random.randint(20, 250)
        # Last 30 days
        showtime = random_date(30, 0).strftime('%Y-%m-%d %H:%M:%S')
        
        shows_data.append(f"({mid}, {escape_str(showtime)}, {screen}, {sold})")
        movie_sales[mid] += sold

    batch_size = 50
    for i in range(0, len(shows_data), batch_size):
        batch = shows_data[i:i+batch_size]
        sql.append(f"INSERT INTO Shows (MovieId, ShowTime, ScreenNo, TicketsSold) VALUES {', '.join(batch)};")

    # SalesSummary
    sql.append("\n-- SalesSummary")
    sql.append("TRUNCATE TABLE SalesSummary;")
    summary_vals = []
    for mid, total in movie_sales.items():
        if total >= 0:
            summary_vals.append(f"({mid}, {total})")
    
    if summary_vals:
        sql.append(f"INSERT INTO SalesSummary (MovieId, TotalTicketsSold) VALUES {', '.join(summary_vals)};")

    return "\n".join(sql)

if __name__ == "__main__":
    print("Generating Novotel data...")
    novotel_sql = generate_novotel()
    with open(NOVOTEL_FILE, "w", encoding="utf-8") as f:
        f.write(novotel_sql)
    print(f"Written {NOVOTEL_FILE}")

    print("Generating PVRINOX data...")
    pvr_sql = generate_pvrinox()
    with open(PVR_FILE, "w", encoding="utf-8") as f:
        f.write(pvr_sql)
    print(f"Written {PVR_FILE}")
