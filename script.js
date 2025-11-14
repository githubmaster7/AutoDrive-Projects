// Set today's date as default for performance date field
document.addEventListener('DOMContentLoaded', function() {
    const performanceDateInput = document.getElementById('performanceDate');
    if (performanceDateInput) {
        const today = new Date().toISOString().split('T')[0];
        performanceDateInput.value = today;
    }

    // Check if athlete name exists when typing
    const athleteNameInput = document.getElementById('athleteName');
    const existingAthleteHint = document.getElementById('existingAthleteHint');
    
    if (athleteNameInput && existingAthleteHint) {
        athleteNameInput.addEventListener('input', function() {
            const name = this.value.trim();
            if (name) {
                const allPerformanceData = JSON.parse(localStorage.getItem('athleticPerformanceByPerson') || '{}');
                if (allPerformanceData[name] && allPerformanceData[name].length > 0) {
                    existingAthleteHint.style.display = 'block';
                } else {
                    existingAthleteHint.style.display = 'none';
                }
            } else {
                existingAthleteHint.style.display = 'none';
            }
        });
    }
});

// Show/hide "Other Sport" input based on selection
document.getElementById('sport').addEventListener('change', function() {
    const otherSportGroup = document.getElementById('otherSportGroup');
    if (this.value === 'Other') {
        otherSportGroup.style.display = 'block';
    } else {
        otherSportGroup.style.display = 'none';
    }
});

// Handle form submission
document.getElementById('sportsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Store in localStorage
    let submissions = JSON.parse(localStorage.getItem('sportsSubmissions') || '[]');
    submissions.push({
        ...data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('sportsSubmissions', JSON.stringify(submissions));
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Reset form
    this.reset();
    document.getElementById('otherSportGroup').style.display = 'none';
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
});

// Handle performance tracking form submission
document.getElementById('performanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const athleteName = formData.get('athleteName').trim();
    
    if (!athleteName) {
        alert('Please enter an athlete name');
        return;
    }
    
    const performanceData = {
        date: formData.get('performanceDate'),
        dash40m: parseFloat(formData.get('dash40m')),
        jumpHeight: parseFloat(formData.get('jumpHeightPerf')),
        benchPress: parseFloat(formData.get('benchPress')),
        timestamp: new Date().toISOString()
    };
    
    // Store in localStorage by person name
    let performanceByPerson = JSON.parse(localStorage.getItem('athleticPerformanceByPerson') || '{}');
    
    // Initialize array for this athlete if it doesn't exist
    if (!performanceByPerson[athleteName]) {
        performanceByPerson[athleteName] = [];
    }
    
    // Add data to this athlete's records
    performanceByPerson[athleteName].push(performanceData);
    
    // Sort by date for this athlete
    performanceByPerson[athleteName].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem('athleticPerformanceByPerson', JSON.stringify(performanceByPerson));
    
    // Show success message
    const successMessage = document.getElementById('performanceSuccessMessage');
    successMessage.style.display = 'block';
    
    // Reset form (keep the athlete name)
    const athleteNameInput = document.getElementById('athleteName');
    const savedName = athleteNameInput.value;
    this.reset();
    athleteNameInput.value = savedName;
    
    // Update existing athlete hint
    const existingAthleteHint = document.getElementById('existingAthleteHint');
    if (existingAthleteHint) {
        existingAthleteHint.style.display = 'block';
    }
    
    // Set today's date again
    const performanceDateInput = document.getElementById('performanceDate');
    if (performanceDateInput) {
        const today = new Date().toISOString().split('T')[0];
        performanceDateInput.value = today;
    }
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
});

