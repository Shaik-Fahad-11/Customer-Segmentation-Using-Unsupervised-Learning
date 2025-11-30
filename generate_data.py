import numpy as np
import json
import os
import random

# --- CONFIGURATION ---
MALLS = [
    "Metro Plaza", 
    "Grand Central", 
    "Lakeside View", 
    "Ocean Breeze", 
    "Highland Park"
]
YEARS = [2020, 2021, 2022, 2023, 2024]
DOMAINS = ['Clothing', 'Tech', 'Grocery', 'Beauty', 'Home']

class SyntheticMallGenerator:
    def __init__(self):
        # Create output directory if it doesn't exist
        if not os.path.exists('mall_data'):
            os.makedirs('mall_data')

    def generate_customer_profile(self, mall_name, year, customer_index):
        """
        Generates a single customer with a specific persona to ensure
        clusters are formable later.
        """
        # Ensure reproducibility per customer
        np.random.seed(hash(f"{mall_name}_{year}_{customer_index}") % 2**32)
        
        gender = np.random.choice(['Male', 'Female'], p=[0.48, 0.52])
        age = int(np.random.randint(18, 75))
        
        # --- PERSONA GENERATION (Crucial for Clustering) ---
        # We assign a hidden 'type' to ensure correlations exist
        # 0: Low Income, Low Score (Sensible)
        # 1: Low Income, High Score (Careless)
        # 2: Mid Income, Mid Score (Mainstream)
        # 3: High Income, Low Score (Frugal/Savers)
        # 4: High Income, High Score (Luxury)
        
        persona_probs = [0.15, 0.15, 0.40, 0.15, 0.15] # Most people are mainstream
        persona = np.random.choice([0, 1, 2, 3, 4], p=persona_probs)
        
        if persona == 0: # Low/Low
            income = np.random.randint(15, 40)
            score = np.random.randint(1, 35)
        elif persona == 1: # Low/High
            income = np.random.randint(15, 40)
            score = np.random.randint(60, 99)
        elif persona == 2: # Mid/Mid
            income = np.random.randint(45, 75)
            score = np.random.randint(35, 65)
        elif persona == 3: # High/Low
            income = np.random.randint(80, 140)
            score = np.random.randint(1, 35)
        else: # High/High
            income = np.random.randint(80, 140)
            score = np.random.randint(65, 99)

        # --- SPENDING DISTRIBUTION ---
        # Distribute their "Spending Score" potential into actual dollars across domains
        # Spending Score is abstract (1-100), we convert it to an estimated annual spend
        base_budget = (income * 1000) * (score / 100) * 0.15 # Approx 15% of proportional income
        
        # Domain weights vary by Gender and Age (Noise added)
        weights = np.random.dirichlet(np.ones(5), size=1)[0]
        
        # Adjust weights based on demographics for realism
        if gender == 'Female':
            weights[3] *= 1.5 # Boost Beauty
            weights[0] *= 1.2 # Boost Clothing
        elif gender == 'Male':
            weights[1] *= 1.6 # Boost Tech
        
        if age < 30:
            weights[1] *= 1.3 # Young people buy more tech
        elif age > 50:
            weights[2] *= 1.4 # Older people buy more Grocery/Home
            
        # Re-normalize weights to sum to 1
        weights /= weights.sum()
        
        expenses = {}
        total_expense = 0
        for i, domain in enumerate(DOMAINS):
            amount = round(base_budget * weights[i], 2)
            expenses[domain] = amount
            total_expense += amount

        return {
            "customer_id": f"{mall_name[:3].upper()}-{year}-{customer_index:04d}",
            "gender": gender,
            "age": age,
            "annual_income_k": int(income),
            "spending_score": int(score),
            "expenses": expenses,
            "total_spent_annual": round(total_expense, 2)
        }

    def run(self):
        print("🚀 Starting Synthetic Data Generation...")
        
        for mall in MALLS:
            mall_data = {}
            print(f"   Processing {mall}...")
            
            for year in YEARS:
                # Randomize visitor count slightly per year (e.g., 2020 was low due to pandemic)
                if year == 2020:
                    n_customers = np.random.randint(120, 150)
                else:
                    n_customers = np.random.randint(180, 250)
                
                year_data = []
                for i in range(n_customers):
                    customer = self.generate_customer_profile(mall, year, i)
                    year_data.append(customer)
                
                mall_data[str(year)] = year_data
            
            # Save to JSON
            filename = f"mall_data/{mall.replace(' ', '_')}.json"
            with open(filename, 'w') as f:
                json.dump(mall_data, f, indent=4)
                
        print(f"✅ Generation Complete! Files saved in 'mall_data/' directory.")

if __name__ == "__main__":
    generator = SyntheticMallGenerator()
    generator.run()