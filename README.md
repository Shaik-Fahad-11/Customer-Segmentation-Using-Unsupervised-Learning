# SegMentos AI - Intelligent Customer Analytics Platform

SegMentos AI is a production-ready data science and visualization platform designed to simulate, cluster, and analyze mall customer behavior. It combines a powerful Python backend (using K-Means Clustering) with a modern, interactive web dashboard to provide actionable insights into spending habits, demographics, and revenue drivers.

The platform features secure role-based authentication, synthetic data generation, and deep-dive comparison tools, wrapped in a responsive Glassmorphism UI with full Dark Mode support.

## 🚀 Key Features

### 🔐 Secure Authentication & Roles

* **User Management**: Secure Login and Signup system using PostgreSQL (Neon Tech).
* **Role-Based Access**: Differentiates between 'Mall Managers' and 'Data Analysts'.
* **Session Security**: Password hashing and protected routes.

### 🧠 Data Science Engine

* **Synthetic Data Pipeline**: Generates realistic customer profiles (Age, Gender, Income, Spending Score) across 5 domains (Clothing, Tech, Grocery, Beauty, Home).
* **Unsupervised Learning**: Implements K-Means Clustering to automatically segment customers into groups like "Luxury Targets" or "Sensible Savers".
* **Smart Labeling**: Dynamically names clusters based on centroid analysis.

### 📊 Advanced Visualization Dashboard

* **Real-Time Filtering**: Switch instantly between different Malls and Financial Years.
* **Cluster Domain Analysis**: Stacked bar charts showing exactly what each customer segment buys.
* **Interactive Charts**:
  * **Scatter Plot**: Visualizing customer segments (Income vs. Score).
  * **Heatmap**: Intensity of spending across categories.
  * **Bar Charts**: Category spending breakdown.
  * **Donut Charts**: Demographic (Gender) distribution.
* **Comparison Mode**: Side-by-side analysis of two different scenarios with delta metrics and comparative AI insights.
* **AI Assistant**: Auto-generated textual insights highlighting trends, top segments, and revenue opportunities.

### 🎨 UI/UX Utilities

* **Glassmorphism Design**: Modern aesthetic with frosted glass panels and vibrant gradients.
* **Secure Auth**: Role-based Login/Signup system (Manager vs. Analyst) backed by a PostgreSQL database.
* **Dark/Light Mode**: Seamless toggle with persistent user preference.
* **PDF Reporting**: Full-page, high-quality export of the dashboard for offline meetings.

## 🛠️ Tech Stack

### Frontend

* **HTML5 / CSS3**: Custom Glassmorphism styling.
* **JavaScript (ES6+)**: Dashboard logic and DOM manipulation.
* **Tailwind CSS**: Responsive grid layouts and utility classes.
* **Chart.js**: Interactive canvas-based charting.
* **html2canvas / jsPDF**: Client-side PDF generation.

### Backend & Database

* **Python (Flask)**: Web server and API endpoints.
* **PostgreSQL (Neon)**: Cloud database for user credentials.
* **SQLAlchemy**: ORM for database interactions.

### Data Science

* **Scikit-learn**: K-Means clustering algorithm.
* **Pandas & Numpy**: Data manipulation and synthetic generation.

## 📂 Project Structure

```
/SegMentos-AI
│
├── app.py                   # Main Flask Application (Routes, Auth, DB Models)
├── generate_data.py         # Step 1: Generates raw synthetic JSON data
├── process_data.py          # Step 2: Runs K-Means & aggregates data for dashboard
├── dashboard_data.json      # Output: Processed JSON used by the frontend
├── .env                     # Environment variables (DB URL, Secret Key)
│
├── static/
│   ├── css/
│   │   ├── style.css        # Main dashboard styling (Dark mode, Charts)
│   │   └── auth.css         # Login/Signup specific styling
│   └── js/
│       └── dashboard.js     # Frontend logic (Charts, PDF, Interactions)
│
├── templates/
│   ├── login.html           # Login Page
│   ├── signup.html          # Signup Page
│   └── dashboard.html       # Main Analytics Dashboard
│
└── mall_data/               # (Generated) Raw JSON files containing customer data
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

Create a `.env` file in the root directory. You will need a PostgreSQL connection string (recommend using Neon.tech for a free tier).

```env
# .env
DATABASE_URL=postgresql://user:password@ep-cool-project.region.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=your_secure_random_key_here
```

### 4. Generate & Process Data

Before running the app, you need to generate the synthetic dataset and train the clustering model.

**Step A: Generate Raw Data**

```bash
python generate_data.py
# Output: Creates /mall_data folder with JSON files for 5 malls (2020-2024)
```

**Step B: Train Models & Process**

```bash
python process_data.py
# Output: runs K-Means and creates dashboard_data.json
```

### 5. Run the Application

```bash
python app.py
```

* The app will start on `http://127.0.0.1:5000`.
* The database tables (`users`) will be created automatically on the first run.

## 📖 Usage Guide

1. **Sign Up**: Create a new account. Select your role as "Mall Manager" or "Data Analyst".
2. **Login**: Use your credentials to access the secure dashboard.
3. **Dashboard Navigation**:
   * **KPI Cards**: View Total Visitors, Avg Income, Avg Score, Top Category, and Primary Segment.
   * **Filters**: Use the dropdowns in the glass header to switch Mall or Year.
   * **Graphs**: Hover over any chart point for detailed tooltips.
4. **Comparisons**:
   * Click the "Compare Malls" button.
   * Select a second mall/year combination.
   * Review the comparison AI insights and side-by-side charts.
5. **Export**:
   * Click "Export PDF".
   * The app will temporarily switch to a clean "Print Mode" layout, generate the PDF, and revert back.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

Distributed under the MIT License. See `MIT LICENSE` for more information.
