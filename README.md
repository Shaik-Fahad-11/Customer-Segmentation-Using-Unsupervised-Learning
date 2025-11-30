# SegMentos AI - Customer Segmentation & Analytics Platform

SegMentos AI is a full-stack data analytics platform designed to simulate, cluster, and visualize mall customer behavior. It uses Unsupervised Learning (K-Means Clustering) to segment customers based on their spending habits and income, providing actionable insights for mall managers and data analysts.

The application features a modern, glassmorphism-inspired UI, secure authentication, and a robust interactive dashboard.

## 🚀 Key Features

### 🧠 Data Science Engine

* **Synthetic Data Generation**: Simulates realistic customer profiles (Age, Gender, Income, Spending Score) and purchasing behaviors across 5 domains (Clothing, Tech, Grocery, Beauty, Home) using numpy.
* **K-Means Clustering**: Automatically groups customers into 5 distinct segments (e.g., "Luxury Targets", "Sensible Savers") based on Annual Income vs. Spending Score.
* **Smart Labeling**: dynamically analyzes cluster centroids to assign human-readable labels to segments.

### 📊 Interactive Dashboard

* **Dynamic Filtering**: View analytics by specific Mall and Financial Year.
* **Visualizations**:
  * **Scatter Plot**: Visual representation of customer clusters.
  * **Heatmap**: Domain popularity intensity.
  * **Bar Charts**: Category spending breakdown.
  * **Donut Charts**: Demographic (Gender) distribution.
* **Comparison Mode**: Side-by-side analysis of two different malls or years with delta metrics.
* **AI-Powered Insights**: Auto-generated textual summaries highlighting top segments, revenue drivers, and trends.

### 🎨 UI/UX & Utility

* **Glassmorphism Design**: Modern frosted-glass aesthetic.
* **Dark/Light Mode**: Fully responsive theme toggle with persistent state.
* **PDF Export**: Download full-page, high-quality reports of the current dashboard view.
* **Secure Auth**: Role-based Login/Signup system (Manager vs. Analyst) backed by a PostgreSQL database.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Tailwind CSS (CDN).
* **Visualization**: Chart.js, FontAwesome (Icons).
* **Backend**: Python (Flask).
* **Database**: PostgreSQL (Neon Tech) with SQLAlchemy.
* **Machine Learning**: Scikit-learn (KMeans), Pandas, Numpy.
* **Export Tools**: html2canvas, jsPDF.

## 📂 Project Structure

```
/SegMentos-AI
│
├── app.py                   # Main Flask Application (Routes & Auth)
├── generate_data.py         # Step 1: Generates raw synthetic JSON data
├── process_data.py          # Step 2: Runs K-Means & aggregates data
├── dashboard_data.json      # Output: Processed data used by frontend
├── .env                     # Environment variables (DB URL, Secret Key)
│
├── static/
│   ├── css/
│   │   ├── style.css        # Dashboard styling (Dark mode, Grids)
│   │   └── auth.css         # Login/Signup specific styling
│   └── js/
│       └── dashboard.js     # Frontend logic (Charts, PDF, Interactions)
│
├── templates/
│   ├── login.html           # Login Page
│   ├── signup.html          # Signup Page
│   └── dashboard.html       # Main Analytics Dashboard
│
└── mall_data/               # (Generated) Raw JSON files per mall
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shaik-Fahad-11/Customer-Segmentation-Using-Unsupervised-Learning
cd Customer-Segmentation-Using-Unsupervised-Learning
```

### 2. Install Python Dependencies

Create a virtual environment (optional but recommended) and install required packages:

```bash
pip install flask flask-sqlalchemy psycopg2-binary python-dotenv scikit-learn pandas numpy
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# .env
DATABASE_URL=postgresql://user:password@your-neon-db-url/neondb?sslmode=require
SECRET_KEY=your_random_secret_key_here
```

**Note**: You can get a free PostgreSQL database from Neon.tech.

### 4. Generate & Process Data

Before running the app, you need to generate the synthetic dataset and train the clustering model.

**Step A: Generate Raw Data**

```bash
python generate_data.py
# Output: Creates /mall_data folder with JSON files
```

**Step B: Run K-Means & Process**

```bash
python process_data.py
# Output: Creates dashboard_data.json
```

### 5. Run the Application

```bash
python app.py
```

Access the app at `http://127.0.0.1:5000`.

## 📖 Usage Guide

1. **Sign Up**: Create a new account. Select your role as "Mall Manager" or "Data Analyst".
2. **Login**: Use your credentials to access the secure dashboard.
3. **Dashboard Navigation**:
   * Select a Mall and Year from the top filters.
   * Observe the KPI Cards updating instantly.
   * Hover over the Scatter Plot to see individual customer details.
4. **Compare Malls**:
   * Click the "Compare Malls" button in the header.
   * Select a secondary Mall/Year in the comparison panel.
   * Analyze the differences in traffic, income, and segments side-by-side.
5. **Export Report**:
   * Click "Export PDF".
   * The app will temporarily switch to a clean "Print Mode" layout, generate the PDF, and revert back.

## 🔮 Future Enhancements

* **Real-time AI Integration**: Connect to OpenAI/Gemini API to generate deeper textual insights dynamically.
* **Predictive Analytics**: Use Time-Series forecasting (ARIMA/Prophet) to predict next year's footfall.
* **Drill-down View**: Click on a cluster bubble to see the specific list of customers within that segment.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
