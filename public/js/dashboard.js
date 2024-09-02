let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;
let clickCurrentPage = 1;
let asinCurrentPage = 1;
let dailyCurrentPage = 1;
let asinData = []; // Variable globale pour stocker les données ASIN
let currentSort = { column: null, direction: 'asc' };
let dailyData = []; // Variable globale pour stocker les données journalières
let currentDailySort = { column: null, direction: 'asc' };

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('start-date').value = formatDate(startDate);
    document.getElementById('end-date').value = formatDate(endDate);

    // Ajout du gestionnaire d'événements pour le bouton "Update Data"
    document.getElementById('update-data-btn').addEventListener('click', fetchDashboardData);

    // Export CSV
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => changeClickPage(-1));
    document.getElementById('next-page').addEventListener('click', () => changeClickPage(1));
    document.getElementById('asin-prev-page').addEventListener('click', () => changeAsinPage(-1));
    document.getElementById('asin-next-page').addEventListener('click', () => changeAsinPage(1));
    document.getElementById('daily-prev-page').addEventListener('click', () => changeDailyPage(-1));
    document.getElementById('daily-next-page').addEventListener('click', () => changeDailyPage(1));

    // Ajout des gestionnaires d'événements pour le tri
    document.querySelectorAll('#asin-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            sortAsinTable(column);
        });
    });

    document.querySelectorAll('#daily-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            sortDailyTable(column);
        });
    });

    fetchDashboardData();
});

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function fetchDashboardData() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    showLoader();

    console.log('Fetching dashboard data...');

    Promise.all([
        fetchClickDetails(startDate, endDate, clickCurrentPage, itemsPerPage),
        fetchSummaryStats(startDate, endDate),
        fetchAsinStats(startDate, endDate, asinCurrentPage, itemsPerPage),
        fetchDailyStats(startDate, endDate, dailyCurrentPage, itemsPerPage),
        fetchFunnelsStats(startDate, endDate, funnelsCurrentPage, itemsPerPage)
    ])
    .then(([clickData, summaryData, asinStatsData, dailyStatsData, funnelsStatsData]) => {
        console.log('Click data:', clickData);
        console.log('Summary data:', summaryData);
        console.log('ASIN data:', asinStatsData);
        console.log('Daily data:', dailyStatsData);
        console.log('Funnels data:', funnelsStatsData);

        updateClickTable(clickData.clicks);
        updatePagination(clickData.totalClicks, 'click');
        updateSummaryStats(summaryData);

        asinData = asinStatsData.stats;
        updateAsinTable();
        if (currentSort.column) {
            sortAsinTable(currentSort.column);
        } else {
            updateSortIndicators();
        }
        updatePagination(asinStatsData.totalItems, 'asin');

        dailyData = dailyStatsData.stats;
        updateDailyTable();
        if (currentDailySort.column) {
            sortDailyTable(currentDailySort.column);
        } else {
            updateDailySortIndicators();
        }
        updatePagination(dailyStatsData.totalItems, 'daily');

        // Ajout des statistiques des funnels
        updateFunnelsStatsTable(funnelsStatsData.stats);
        updatePagination(funnelsStatsData.totalItems, 'funnels');
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
        document.getElementById('error-message').textContent = 'Error loading dashboard data. Please try again.';
    })
    .finally(() => {
        hideLoader();
    });
}

async function fetchSummaryStats(startDate, endDate) {
    const response = await fetch(`/api/click-summary?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
}

async function fetchAsinStats(startDate, endDate, page, limit) {
    const response = await fetch(`/api/asin-stats?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
    return response.json();
}

async function fetchDailyStats(startDate, endDate, page, limit) {
    const response = await fetch(`/api/daily-stats?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
    return response.json();
}

async function fetchClickDetails(startDate, endDate, page, limit) {
    console.log('Fetching click details for:', { startDate, endDate, page, limit });
    const response = await fetch(`/api/clicks?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch click details');
    }
    const data = await response.json();
    console.log('Received click details:', data);
    return data;
}

function updateSummaryStats(data) {
    const container = document.getElementById('summary-stats-container');
    if (data && Object.keys(data).length > 0) {
        container.innerHTML = `
            <div class="stat">
                <h3>Total Clicks</h3>
                <p>${data.totalClicks}</p>
            </div>
            <div class="stat">
                <h3>Total Conversions</h3>
                <p>${data.totalConversions}</p>
            </div>
            <div class="stat">
                <h3>Total Revenue</h3>
                <p>$${data.totalRevenue.toFixed(2)}</p>
            </div>
        `;
    } else {
        container.innerHTML = '<p>No data available for the selected date range.</p>';
    }
}

function updateAsinTable() {
    const tableBody = document.querySelector('#asin-table tbody');
    tableBody.innerHTML = asinData.map(item => `
        <tr>
            <td>${item.asin || 'N/A'}</td>
            <td>${item.clicks}</td>
            <td>${item.conversions}</td>
            <td>$${item.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

function updateDailyTable() {
    const tableBody = document.querySelector('#daily-table tbody');
    tableBody.innerHTML = dailyData.map(item => `
        <tr>
            <td>${item.date || 'N/A'}</td>
            <td>${item.clicks}</td>
            <td>${item.conversions}</td>
            <td>$${item.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

function updateClickTable(clicks) {
    const tableBody = document.querySelector('#click-table tbody');
    tableBody.innerHTML = clicks.map(click => `
        <tr>
            <td>${new Date(click.timestamp).toLocaleString()}</td>
            <td>${click.asin}</td>
            <td>${click.timestamp}</td>
            <td>${click.gclid || 'N/A'}</td>
            <td>${click.converted ? 'Yes' : 'No'}</td>
        </tr>
    `).join('');
}

function sortAsinTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    asinData.sort((a, b) => {
        if (a[column] < b[column]) return currentSort.direction === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateAsinTable();
    updateSortIndicators();
}

function sortDailyTable(column) {
    if (currentDailySort.column === column) {
        currentDailySort.direction = currentDailySort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentDailySort.column = column;
        currentDailySort.direction = 'asc';
    }

    dailyData.sort((a, b) => {
        if (a[column] < b[column]) return currentDailySort.direction === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return currentDailySort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateDailyTable();
    updateDailySortIndicators();
}

function updateSortIndicators() {
    document.querySelectorAll('#asin-table th.sortable').forEach(th => {
        const column = th.dataset.sort;
        th.classList.remove('sort-asc', 'sort-desc');
        if (column === currentSort.column) {
            th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

function updateDailySortIndicators() {
    document.querySelectorAll('#daily-table th.sortable').forEach(th => {
        const column = th.dataset.sort;
        th.classList.remove('sort-asc', 'sort-desc');
        if (column === currentDailySort.column) {
            th.classList.add(currentDailySort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

function exportToCSV() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    showLoader();

    fetch(`/api/export-csv?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'dashboard_data.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV. Please try again.');
        })
        .finally(() => {
            hideLoader();
        });
}

function updatePagination(totalItems, tableType) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let currentPage;
    let pageInfoElement;
    let prevButton;
    let nextButton;

    switch (tableType) {
        case 'click':
            currentPage = clickCurrentPage;
            pageInfoElement = document.getElementById('page-info');
            prevButton = document.getElementById('prev-page');
            nextButton = document.getElementById('next-page');
            break;
        case 'asin':
            currentPage = asinCurrentPage;
            pageInfoElement = document.getElementById('asin-page-info');
            prevButton = document.getElementById('asin-prev-page');
            nextButton = document.getElementById('asin-next-page');
            break;
        case 'daily':
            currentPage = dailyCurrentPage;
            pageInfoElement = document.getElementById('daily-page-info');
            prevButton = document.getElementById('daily-prev-page');
            nextButton = document.getElementById('daily-next-page');
            break;
    }

    pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

function changeClickPage(direction) {
    clickCurrentPage += direction;
    fetchDashboardData();
}

function changeAsinPage(direction) {
    asinCurrentPage += direction;
    fetchDashboardData();
}

function changeDailyPage(direction) {
    dailyCurrentPage += direction;
    fetchDashboardData();
}

let funnelsCurrentPage = 1;

function loadFunnelsStats() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    showLoader();
    fetch(`/api/funnels-stats?startDate=${startDate}&endDate=${endDate}&page=${funnelsCurrentPage}&limit=${itemsPerPage}`)
        .then(response => response.json())
        .then(data => {
            updateFunnelsStatsTable(data.stats);
            updatePagination(data.totalItems, 'funnels');
            hideLoader();
        })
        .catch(error => {
            console.error('Error loading funnels stats:', error);
            hideLoader();
        });
}

function updateFunnelsStatsTable(stats) {
    const tableBody = document.querySelector('#funnels-stats-table tbody');
    tableBody.innerHTML = stats.map(funnel => `
        <tr>
            <td>${funnel.name}</td>
            <td>${funnel.clicks}</td>
            <td>${funnel.conversions}</td>
            <td>$${funnel.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}


// Ajoutez cette fonction
function fetchFunnelsStats(startDate, endDate, page, limit) {
    return fetch(`/api/funnels-stats?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch funnels stats');
            }
            return response.json();
        });
}

// Modifiez la fonction updatePagination pour inclure les funnels
function updatePagination(totalItems, tableType) {
    // ... (code existant)
    
    if (tableType === 'funnels') {
        currentPage = funnelsCurrentPage;
        pageInfoElement = document.getElementById('funnels-page-info');
        prevButton = document.getElementById('funnels-prev-page');
        nextButton = document.getElementById('funnels-next-page');
    }
    
    // ... (reste du code)
}

// Ajoutez cette fonction
function changeFunnelsPage(direction) {
    funnelsCurrentPage += direction;
    fetchDashboardData();
}

// Ajoutez ces gestionnaires d'événements dans la fonction DOMContentLoaded
document.getElementById('funnels-prev-page').addEventListener('click', () => changeFunnelsPage(-1));
document.getElementById('funnels-next-page').addEventListener('click', () => changeFunnelsPage(1));