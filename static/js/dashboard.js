let GLOBAL_DATA = null;
let CHART_INSTANCES = {};
let IS_COMPARE_MODE = false;

// 1. Theme Initialization
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

document.addEventListener('DOMContentLoaded', async () => {
    updateThemeIcon(savedTheme);
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        if (data.error) { alert(data.error); return; }
        GLOBAL_DATA = data;
        populateSelectors();
        updateDashboard();
    } catch (e) { console.error("Failed to load data:", e); }
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});

function toggleTheme() {
    const body = document.body;
    const next = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
    updateAllCharts();
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun text-yellow-400"></i>' : '<i class="fa-solid fa-moon text-indigo-600"></i>';
}

function populateSelectors() {
    const malls = Object.keys(GLOBAL_DATA);
    const mallSelect = document.getElementById('mallSelect');
    const compareMallSelect = document.getElementById('compareMallSelect');
    malls.forEach(mall => {
        let opt = new Option(mall, mall);
        mallSelect.add(opt);
        compareMallSelect.add(opt.cloneNode(true));
    });
    const years = Object.keys(GLOBAL_DATA[malls[0]]);
    const yearSelect = document.getElementById('yearSelect');
    const compareYearSelect = document.getElementById('compareYearSelect');
    years.forEach(year => {
        let opt = new Option(year, year);
        yearSelect.add(opt);
        compareYearSelect.add(opt.cloneNode(true));
    });
    yearSelect.value = years[years.length - 1];
    compareYearSelect.value = years[years.length - 1];
}

function updateDashboard() {
    const mall = document.getElementById('mallSelect').value;
    const year = document.getElementById('yearSelect').value;
    const data = GLOBAL_DATA[mall][year];

    const sidebarText = document.getElementById('sidebar-status-text');
    if (sidebarText) sidebarText.innerText = `Running analysis on ${year} trends...`;

    renderView('main', data);
    generateAIInsights(data, 'ai-content-main', year);

    if (IS_COMPARE_MODE) {
        const cMall = document.getElementById('compareMallSelect').value;
        const cYear = document.getElementById('compareYearSelect').value;
        const cData = GLOBAL_DATA[cMall][cYear];
        renderView('compare', cData);
        generateComparisonInsights(data, mall, year, cData, cMall, cYear);
    }
}

function renderView(prefix, data) {
    const topCat = Object.entries(data.stats.domain_totals).sort((a, b) => b[1] - a[1])[0][0];
    const topSeg = Object.entries(data.stats.cluster_distribution).sort((a, b) => b[1] - a[1])[0][0];

    animateValue(`${prefix}-visitors`, data.stats.total_visitors);
    const incomeEl = document.getElementById(`${prefix}-income`);
    if (incomeEl) incomeEl.innerText = `$${data.stats.avg_income}k`;
    document.getElementById(`${prefix}-score`).innerText = data.stats.avg_score;
    document.getElementById(`${prefix}-top-cat`).innerText = topCat;
    const segEl = document.getElementById(`${prefix}-top-seg`);
    segEl.innerText = topSeg;
    segEl.title = topSeg;

    renderClusterChart(`${prefix}ClusterChart`, data.customers);

    // NEW CHART
    renderClusterDomainChart(`${prefix}ClusterDomainChart`, data.customers);

    renderDomainChart(`${prefix}DomainChart`, data.stats.domain_totals);
    renderHeatmap(`${prefix}Heatmap`, data.stats.domain_totals);
    renderPieChart(`${prefix}GenderChart`, data.stats.gender_ratio);
}

// --- CHARTS ---
function getChartColors() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#f3f4f6' : '#374151',
        grid: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
    };
}
function jitter(value) { return value + (Math.random() - 0.5) * 4; }

// NEW: Stacked Bar for Cluster vs Domains
function renderClusterDomainChart(id, customers) {
    const ctx = document.getElementById(id).getContext('2d');
    const colors = getChartColors();

    // 1. Process Data: Group by Cluster, then Sum by Domain
    // Data Shape: { 'Luxury': {'Tech': 500, 'Food': 200}, 'Savers': {...} }
    const clusterData = {};
    const allDomains = new Set();

    customers.forEach(c => {
        if (!clusterData[c.cluster_label]) clusterData[c.cluster_label] = {};

        Object.entries(c.expenses).forEach(([domain, amount]) => {
            if (!clusterData[c.cluster_label][domain]) clusterData[c.cluster_label][domain] = 0;
            clusterData[c.cluster_label][domain] += amount;
            allDomains.add(domain);
        });
    });

    const labels = Object.keys(clusterData);
    const domains = Array.from(allDomains);
    const domainColors = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899']; // Standard palette

    // Create a dataset for each domain
    const datasets = domains.map((domain, index) => {
        return {
            label: domain,
            data: labels.map(cluster => clusterData[cluster][domain] || 0),
            backgroundColor: domainColors[index % domainColors.length],
            stack: 'Stack 0',
            borderRadius: 2
        };
    });

    if (CHART_INSTANCES[id]) CHART_INSTANCES[id].destroy();

    CHART_INSTANCES[id] = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    ticks: { color: colors.text },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: colors.text },
                    grid: { color: colors.grid },
                    title: { display: true, text: 'Total Spend ($)', color: colors.text }
                }
            },
            plugins: {
                legend: { labels: { color: colors.text } },
                tooltip: {
                    callbacks: {
                        footer: (tooltipItems) => {
                            // Find highest spend in this cluster
                            let max = 0;
                            let maxDomain = '';
                            let min = Infinity;
                            let minDomain = '';

                            tooltipItems.forEach(item => {
                                if (item.raw > max) { max = item.raw; maxDomain = item.dataset.label; }
                                if (item.raw < min && item.raw > 0) { min = item.raw; minDomain = item.dataset.label; }
                            });
                            return `Highest: ${maxDomain}\nLowest: ${minDomain}`;
                        }
                    }
                }
            }
        }
    });
}

function renderClusterChart(id, customers) {
    const ctx = document.getElementById(id).getContext('2d');
    const colors = getChartColors();
    const clusters = {};
    customers.forEach(c => {
        if (!clusters[c.cluster_label]) clusters[c.cluster_label] = [];
        clusters[c.cluster_label].push({ x: jitter(c.annual_income_k), y: jitter(c.spending_score) });
    });
    const datasets = Object.keys(clusters).map((label, idx) => {
        const pal = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899'];
        return { label: label, data: clusters[label], backgroundColor: pal[idx % pal.length], pointRadius: 5 };
    });
    if (CHART_INSTANCES[id]) CHART_INSTANCES[id].destroy();
    CHART_INSTANCES[id] = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Income', color: colors.text }, ticks: { color: colors.text }, grid: { color: colors.grid } },
                y: { title: { display: true, text: 'Score', color: colors.text }, ticks: { color: colors.text }, grid: { color: colors.grid } }
            },
            plugins: { legend: { labels: { color: colors.text } } }
        }
    });
}

function renderDomainChart(id, totals) {
    const ctx = document.getElementById(id).getContext('2d');
    const colors = getChartColors();
    if (CHART_INSTANCES[id]) CHART_INSTANCES[id].destroy();
    CHART_INSTANCES[id] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { ticks: { color: colors.text }, grid: { display: false } }, y: { ticks: { color: colors.text }, grid: { color: colors.grid } } }
        }
    });
}

function renderPieChart(id, ratios) {
    const ctx = document.getElementById(id).getContext('2d');
    const colors = getChartColors();
    if (CHART_INSTANCES[id]) CHART_INSTANCES[id].destroy();
    CHART_INSTANCES[id] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ratios),
            datasets: [{ data: Object.values(ratios), backgroundColor: ['#EC4899', '#3B82F6'], borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
        }
    });
}

function renderHeatmap(containerId, totals) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const maxVal = Math.max(...Object.values(totals));
    Object.entries(totals).forEach(([domain, val]) => {
        const opacity = Math.max((val / maxVal), 0.3);
        const div = document.createElement('div');
        div.className = 'heatmap-cell';
        div.style.backgroundColor = `rgba(99, 102, 241, ${opacity})`;
        div.title = `$${val.toLocaleString()}`;
        div.innerHTML = `<div style="font-size:1.2rem; margin-bottom:5px;">${getIcon(domain)}</div><div class="text-xs">${domain}</div>`;
        container.appendChild(div);
    });
}

function getIcon(d) {
    const map = { 'Clothing': '👕', 'Tech': '💻', 'Grocery': '🍎', 'Beauty': '💄', 'Home': '🏠' };
    return map[d] || '📦';
}

function animateValue(id, end) {
    const obj = document.getElementById(id);
    if (obj) obj.innerHTML = end;
}

function generateAIInsights(data, containerId, year) {
    const container = document.getElementById(containerId);
    const topSeg = Object.entries(data.stats.cluster_distribution).sort((a, b) => b[1] - a[1])[0][0];
    const avgInc = data.stats.avg_income;
    const genderGap = Math.abs(data.stats.gender_ratio.Male - data.stats.gender_ratio.Female);
    let genderText = genderGap < 20 ? "Gender distribution is balanced." : (data.stats.gender_ratio.Female > data.stats.gender_ratio.Male ? "Female shoppers dominate the traffic." : "Male shoppers are the majority.");
    let incomeText = avgInc > 70 ? `High average income ($${avgInc}k). Focus on premium branding.` : `Average income is moderate ($${avgInc}k). Focus on volume sales.`;
    const html = `
        <div class="ai-card"><i class="fa-solid fa-lightbulb text-yellow-500 mt-1"></i><div><strong>${topSeg}</strong> is the dominant cluster in ${year}.</div></div>
        <div class="ai-card"><i class="fa-solid fa-lightbulb text-yellow-500 mt-1"></i><div>${genderText}</div></div>
        <div class="ai-card"><i class="fa-solid fa-lightbulb text-yellow-500 mt-1"></i><div>${incomeText}</div></div>
    `;
    container.innerHTML = html;
}

function generateComparisonInsights(d1, m1, y1, d2, m2, y2) {
    const container = document.getElementById('ai-content-compare');
    const visitDiff = ((d1.stats.total_visitors - d2.stats.total_visitors) / d2.stats.total_visitors * 100).toFixed(1);
    const scoreDiff = (d1.stats.avg_score - d2.stats.avg_score).toFixed(1);
    let visitText = visitDiff > 0 ? `<strong>${m1}</strong> had <strong>${visitDiff}% more visitors</strong> than ${m2}.` : `<strong>${m2}</strong> outperformed ${m1} in traffic by <strong>${Math.abs(visitDiff)}%</strong>.`;
    let scoreText = scoreDiff > 0 ? `${m1} customers spend more aggressively (Score +${scoreDiff}).` : `${m2} shows higher spending engagement (Score +${Math.abs(scoreDiff)}).`;
    const html = `
        <div class="ai-card"><i class="fa-solid fa-code-compare text-indigo-500 mt-1"></i><div>${visitText}</div></div>
        <div class="ai-card"><i class="fa-solid fa-code-compare text-indigo-500 mt-1"></i><div>${scoreText}</div></div>
    `;
    container.innerHTML = html;
}

function updateAllCharts() {
    Object.keys(CHART_INSTANCES).forEach(id => {
        const chart = CHART_INSTANCES[id];
        const colors = getChartColors();
        if (chart.options.scales && chart.options.scales.x) { chart.options.scales.x.ticks.color = colors.text; chart.options.scales.x.grid.color = colors.grid; if (chart.options.scales.x.title) chart.options.scales.x.title.color = colors.text; }
        if (chart.options.scales && chart.options.scales.y) { chart.options.scales.y.ticks.color = colors.text; chart.options.scales.y.grid.color = colors.grid; if (chart.options.scales.y.title) chart.options.scales.y.title.color = colors.text; }
        if (chart.options.plugins && chart.options.plugins.legend) { chart.options.plugins.legend.labels.color = colors.text; }
        chart.update();
    });
}

function toggleCompareMode() {
    IS_COMPARE_MODE = !IS_COMPARE_MODE;
    const comparePanel = document.getElementById('compare-panel');
    const btn = document.getElementById('compare-btn');
    if (IS_COMPARE_MODE) {
        comparePanel.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-times"></i> <span>Exit Compare</span>';
        setTimeout(() => { comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        updateDashboard();
    } else {
        comparePanel.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> <span>Compare Malls</span>';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function downloadReport() {
    const btn = document.querySelector('button[onclick="downloadReport()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    const wasDark = document.body.getAttribute('data-theme') === 'dark';
    if (wasDark) { document.body.setAttribute('data-theme', 'light'); updateAllCharts(); await new Promise(r => setTimeout(r, 600)); }
    const element = document.getElementById('dashboard-export-area');
    document.body.classList.add('printing-mode');
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        pdf.save(`Mall_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (err) {
        console.error("PDF Export Failed:", err);
        alert("Failed to generate PDF. Check console.");
    } finally {
        document.body.classList.remove('printing-mode');
        if (wasDark) {
            document.body.setAttribute('data-theme', 'dark');
            updateAllCharts();
        }
        btn.innerHTML = originalText;
    }
}
