// Load and display all sports data
function loadDashboardData() {
    const submissions = JSON.parse(localStorage.getItem('sportsSubmissions') || '[]');
    const dataContainer = document.getElementById('dataContainer');
    const emptyState = document.getElementById('emptyState');
    const statsContainer = document.getElementById('statsContainer');
    const statsGrid = document.getElementById('statsGrid');

    if (submissions.length === 0) {
        emptyState.style.display = 'block';
        statsContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    statsContainer.style.display = 'block';
    dataContainer.innerHTML = '';

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const sports = {};
    const experienceLevels = {};
    
    submissions.forEach(submission => {
        const sport = submission.sport === 'Other' ? submission.otherSport : submission.sport;
        sports[sport] = (sports[sport] || 0) + 1;
        experienceLevels[submission.experience] = (experienceLevels[submission.experience] || 0) + 1;
    });

    // Display statistics
    statsGrid.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${totalSubmissions}</div>
            <div class="stat-label">Total Submissions</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${Object.keys(sports).length}</div>
            <div class="stat-label">Different Sports</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${Math.round(submissions.reduce((sum, s) => sum + (parseFloat(s.trainingHours) || 0), 0) / totalSubmissions)}</div>
            <div class="stat-label">Avg Training Hours/Week</div>
        </div>
    `;

    // Display each submission
    submissions.reverse().forEach((submission, index) => {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        const submissionDate = new Date(submission.timestamp);
        const formattedDate = submissionDate.toLocaleString();
        
        const sportDisplay = submission.sport === 'Other' 
            ? (submission.otherSport || 'Other') 
            : submission.sport;

        card.innerHTML = `
            <h3>Submission #${submissions.length - index}</h3>
            <div class="data-row">
                <div class="data-label">Student Name:</div>
                <div class="data-value">${submission.studentName || 'N/A'}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Student ID:</div>
                <div class="data-value">${submission.studentId || 'N/A'}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Email:</div>
                <div class="data-value">${submission.email || 'N/A'}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Sport:</div>
                <div class="data-value">${sportDisplay}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Experience Level:</div>
                <div class="data-value">${submission.experience || 'N/A'}</div>
            </div>
            ${submission.position ? `
            <div class="data-row">
                <div class="data-label">Position/Role:</div>
                <div class="data-value">${submission.position}</div>
            </div>
            ` : ''}
            ${submission.team ? `
            <div class="data-row">
                <div class="data-label">Team Name:</div>
                <div class="data-value">${submission.team}</div>
            </div>
            ` : ''}
            ${submission.achievements ? `
            <div class="data-row">
                <div class="data-label">Achievements:</div>
                <div class="data-value">${submission.achievements}</div>
            </div>
            ` : ''}
            <div class="data-row">
                <div class="data-label">Training Hours/Week:</div>
                <div class="data-value">${submission.trainingHours || 'N/A'}</div>
            </div>
            ${submission.jumpHeight ? `
            <div class="data-row">
                <div class="data-label">Jump Height:</div>
                <div class="data-value">${submission.jumpHeight} cm</div>
            </div>
            ` : ''}
            ${submission.goals ? `
            <div class="data-row">
                <div class="data-label">Future Goals:</div>
                <div class="data-value">${submission.goals}</div>
            </div>
            ` : ''}
            <div class="timestamp">Submitted: ${formattedDate}</div>
            <button class="delete-btn" onclick="deleteSubmission(${submissions.length - index - 1})">Delete This Entry</button>
        `;
        
        dataContainer.appendChild(card);
    });
}

// Delete a submission
function deleteSubmission(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        const submissions = JSON.parse(localStorage.getItem('sportsSubmissions') || '[]');
        submissions.reverse(); // Reverse to match display order
        submissions.splice(index, 1);
        submissions.reverse(); // Reverse back
        localStorage.setItem('sportsSubmissions', JSON.stringify(submissions));
        loadDashboardData(); // Reload the dashboard
    }
}

// Chart instances
let dashChartInstance = null;
let jumpChartInstance = null;
let benchChartInstance = null;
let allAthleteChartInstances = {}; // Store charts for all athletes view

// Populate athlete selector
function populateAthleteSelector() {
    const performanceByPerson = JSON.parse(localStorage.getItem('athleticPerformanceByPerson') || '{}');
    const athleteSelect = document.getElementById('athleteSelect');
    const athleteSelectorContainer = document.getElementById('athleteSelectorContainer');
    
    const athleteNames = Object.keys(performanceByPerson).filter(name => 
        performanceByPerson[name] && performanceByPerson[name].length > 0
    );
    
    if (athleteNames.length === 0) {
        athleteSelectorContainer.style.display = 'none';
        return;
    }
    
    athleteSelectorContainer.style.display = 'block';
    
    // Clear existing options except "View All"
    athleteSelect.innerHTML = '<option value="all">View All Athletes</option>';
    
    // Add athlete options
    athleteNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        athleteSelect.appendChild(option);
    });
    
    // Add change listener
    athleteSelect.onchange = function() {
        renderChartsForAthlete(this.value);
    };
}

// Render charts for a specific athlete or all athletes
function renderChartsForAthlete(selectedAthlete) {
    const performanceByPerson = JSON.parse(localStorage.getItem('athleticPerformanceByPerson') || '{}');
    const chartsSection = document.getElementById('chartsSection');
    const performanceEmptyState = document.getElementById('performanceEmptyState');
    const selectedAthleteTitle = document.getElementById('selectedAthleteTitle');

    // Check if there's any data
    const allAthletes = Object.keys(performanceByPerson).filter(name => 
        performanceByPerson[name] && performanceByPerson[name].length > 0
    );

    if (allAthletes.length === 0) {
        chartsSection.style.display = 'none';
        performanceEmptyState.style.display = 'block';
        return;
    }

    chartsSection.style.display = 'block';
    performanceEmptyState.style.display = 'none';

    const singleAthleteCharts = document.getElementById('singleAthleteCharts');
    const allAthletesCharts = document.getElementById('allAthletesCharts');

    // Destroy existing charts
    if (dashChartInstance) dashChartInstance.destroy();
    if (jumpChartInstance) jumpChartInstance.destroy();
    if (benchChartInstance) benchChartInstance.destroy();
    
    // Destroy all athlete charts
    Object.values(allAthleteChartInstances).forEach(charts => {
        if (charts.dash) charts.dash.destroy();
        if (charts.jump) charts.jump.destroy();
        if (charts.bench) charts.bench.destroy();
    });
    allAthleteChartInstances = {};
    
    if (selectedAthlete === 'all') {
        // Show separate graphs for each athlete
        selectedAthleteTitle.textContent = '📊 All Athletes Performance';
        singleAthleteCharts.style.display = 'none';
        allAthletesCharts.innerHTML = '';
        
        allAthletes.forEach((athleteName) => {
            const athleteData = performanceByPerson[athleteName];
            
            // Create athlete section
            const athleteSection = document.createElement('div');
            athleteSection.className = 'athlete-section';
            
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'athlete-section-title';
            sectionTitle.textContent = `👤 ${athleteName}`;
            athleteSection.appendChild(sectionTitle);
            
            // Create chart cards for this athlete
            const dates = athleteData.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            });
            
            // Dash chart
            const dashCard = document.createElement('div');
            dashCard.className = 'chart-card';
            dashCard.innerHTML = `
                <h3>🏃 40m Dash Time Trend</h3>
                <div class="chart-container">
                    <canvas id="dashChart_${athleteName}"></canvas>
                </div>
            `;
            athleteSection.appendChild(dashCard);
            
            // Jump chart
            const jumpCard = document.createElement('div');
            jumpCard.className = 'chart-card';
            jumpCard.innerHTML = `
                <h3>⬆️ Jump Height Trend</h3>
                <div class="chart-container">
                    <canvas id="jumpChart_${athleteName}"></canvas>
                </div>
            `;
            athleteSection.appendChild(jumpCard);
            
            // Bench chart
            const benchCard = document.createElement('div');
            benchCard.className = 'chart-card';
            benchCard.innerHTML = `
                <h3>💪 Bench Press Trend</h3>
                <div class="chart-container">
                    <canvas id="benchChart_${athleteName}"></canvas>
                </div>
            `;
            athleteSection.appendChild(benchCard);
            
            allAthletesCharts.appendChild(athleteSection);
            
            // Create charts for this athlete
            const chartConfig = getChartConfig(false);
            
            const dashCtx = document.getElementById(`dashChart_${athleteName}`).getContext('2d');
            const dashChart = new Chart(dashCtx, {
                ...chartConfig,
                data: {
                    labels: dates,
                    datasets: [{
                        label: '40m Dash Time (seconds)',
                        data: athleteData.map(d => d.dash40m),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                }
            });
            
            const jumpCtx = document.getElementById(`jumpChart_${athleteName}`).getContext('2d');
            const jumpChart = new Chart(jumpCtx, {
                ...chartConfig,
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Jump Height (cm)',
                        data: athleteData.map(d => d.jumpHeight),
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#48bb78',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                }
            });
            
            const benchCtx = document.getElementById(`benchChart_${athleteName}`).getContext('2d');
            const benchChart = new Chart(benchCtx, {
                ...chartConfig,
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Bench Press (kg)',
                        data: athleteData.map(d => d.benchPress),
                        borderColor: '#f56565',
                        backgroundColor: 'rgba(245, 101, 101, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#f56565',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                }
            });
            
            // Store chart instances
            allAthleteChartInstances[athleteName] = {
                dash: dashChart,
                jump: jumpChart,
                bench: benchChart
            };
        });
    } else {
        // Show single athlete
        const athleteData = performanceByPerson[selectedAthlete];
        if (!athleteData || athleteData.length === 0) {
            chartsSection.style.display = 'none';
            performanceEmptyState.style.display = 'block';
            return;
        }
        
        // Show single athlete
        selectedAthleteTitle.textContent = `📊 ${selectedAthlete}'s Performance`;
        singleAthleteCharts.style.display = 'block';
        allAthletesCharts.innerHTML = '';
        
        const dates = athleteData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        });
        
        const chartConfig = getChartConfig(false);
        
        // 40m Dash Chart
        const dashCtx = document.getElementById('dashChart').getContext('2d');
        dashChartInstance = new Chart(dashCtx, {
            ...chartConfig,
            data: {
                labels: dates,
                datasets: [{
                    label: '40m Dash Time (seconds)',
                    data: athleteData.map(d => d.dash40m),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            }
        });

        // Jump Height Chart
        const jumpCtx = document.getElementById('jumpChart').getContext('2d');
        jumpChartInstance = new Chart(jumpCtx, {
            ...chartConfig,
            data: {
                labels: dates,
                datasets: [{
                    label: 'Jump Height (cm)',
                    data: athleteData.map(d => d.jumpHeight),
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#48bb78',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            }
        });

        // Bench Press Chart
        const benchCtx = document.getElementById('benchChart').getContext('2d');
        benchChartInstance = new Chart(benchCtx, {
            ...chartConfig,
            data: {
                labels: dates,
                datasets: [{
                    label: 'Bench Press (kg)',
                    data: athleteData.map(d => d.benchPress),
                    borderColor: '#f56565',
                    backgroundColor: 'rgba(245, 101, 101, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#f56565',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            }
        });
    }
}

// Helper function to get chart configuration
function getChartConfig(showLegend) {
    return {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: showLegend,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    };
}

// Load and display performance charts
function loadPerformanceCharts() {
    populateAthleteSelector();
    const athleteSelect = document.getElementById('athleteSelect');
    if (athleteSelect && athleteSelect.value) {
        renderChartsForAthlete(athleteSelect.value);
    } else {
        renderChartsForAthlete('all');
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    loadPerformanceCharts();
});

