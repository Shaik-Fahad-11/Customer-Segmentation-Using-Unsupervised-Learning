import json
import os
import glob
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

# --- CONFIGURATION ---
INPUT_DIR = 'mall_data'
OUTPUT_FILE = 'dashboard_data.json'
CLUSTERS_N = 5

class ClusteringEngine:
    def __init__(self):
        self.consolidated_data = {}

    def get_smart_label(self, avg_income, avg_score):
        """
        Analyzes the centroid coordinates to assign a human-readable label.
        This ensures 'Cluster 0' isn't random but has semantic meaning.
        """
        if avg_income < 45:
            if avg_score < 45: return "Sensible Savers"      # Low Income, Low Spend
            else: return "Impulsive Spenders"                # Low Income, High Spend
        elif avg_income > 75:
            if avg_score < 45: return "Frugal Elites"        # High Income, Low Spend
            else: return "Luxury Targets"                    # High Income, High Spend
        else:
            return "Balanced Mainstream"                     # Mid Income, Mid Spend

    def process_mall_year(self, mall_name, year, data):
        """
        Runs K-Means on a specific mall/year dataset.
        """
        df = pd.DataFrame(data)
        
        # 1. Prepare Features for ML
        # We only use Income and Score for segmentation
        X = df[['annual_income_k', 'spending_score']].values
        
        # 2. Apply K-Means
        kmeans = KMeans(n_clusters=CLUSTERS_N, init='k-means++', n_init=10, random_state=42)
        clusters = kmeans.fit_predict(X)
        df['cluster_id'] = clusters
        
        # 3. Smart Labeling (Map IDs to Names)
        # Calculate the mean Income/Score for each cluster ID
        cluster_centers = df.groupby('cluster_id')[['annual_income_k', 'spending_score']].mean()
        
        # Create a mapping dictionary: {0: 'Luxury', 1: 'Budget', ...}
        id_to_label = {}
        for cid, row in cluster_centers.iterrows():
            label = self.get_smart_label(row['annual_income_k'], row['spending_score'])
            id_to_label[cid] = label
            
        # Apply labels to main dataframe
        df['cluster_label'] = df['cluster_id'].map(id_to_label)
        
        # 4. Generate Aggregated Analytics (for the Dashboard Charts)
        
        # A. Domain Spending (Sum of expenses per category)
        # Expand the 'expenses' dictionary into columns, then sum
        expenses_df = pd.json_normalize(df['expenses'])
        domain_totals = expenses_df.sum().to_dict()
        
        # B. Gender Ratio
        gender_counts = df['gender'].value_counts().to_dict()
        
        # C. Cluster Distribution
        cluster_counts = df['cluster_label'].value_counts().to_dict()
        
        # D. Averages
        stats = {
            "total_visitors": len(df),
            "avg_income": round(df['annual_income_k'].mean(), 1),
            "avg_score": round(df['spending_score'].mean(), 1),
            "gender_ratio": gender_counts,
            "domain_totals": domain_totals,
            "cluster_distribution": cluster_counts
        }
        
        # 5. Clean Data for JSON Export (Convert DataFrame back to Dict)
        # We perform a clean export including the new Cluster Label
        processed_customers = df.to_dict(orient='records')
        
        return {
            "stats": stats,
            "customers": processed_customers
        }

    def run(self):
        print("🧠 Starting AI Processing Engine...")
        
        # Loop through all JSON files in the directory
        json_files = glob.glob(os.path.join(INPUT_DIR, "*.json"))
        
        if not json_files:
            print(f"❌ No data found in '{INPUT_DIR}'. Did you run Step 1?")
            return

        for filepath in json_files:
            filename = os.path.basename(filepath)
            mall_name = filename.replace('.json', '').replace('_', ' ')
            
            print(f"   Processing {mall_name}...")
            
            with open(filepath, 'r') as f:
                raw_data = json.load(f)
                
            self.consolidated_data[mall_name] = {}
            
            # Loop through each year in the file (2020-2024)
            for year, customers in raw_data.items():
                processed_result = self.process_mall_year(mall_name, year, customers)
                self.consolidated_data[mall_name][year] = processed_result
                
        # Save Final Output
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(self.consolidated_data, f, indent=4)
            
        print(f"✅ Processing Complete! Data saved to '{OUTPUT_FILE}'")
        print("   Ready for Step 3 (Frontend Integration).")

if __name__ == "__main__":
    engine = ClusteringEngine()
    engine.run()