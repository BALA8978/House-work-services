document.addEventListener('DOMContentLoaded', () => {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    // 1. Revenue Chart (Bar)
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue ($K)',
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // 2. Technician Performance Chart (Radar)
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Punctuality', 'First-Time Fix', 'Efficiency', 'Customer Rating', 'Upsells'],
            datasets: [{
                label: 'Team Alpha',
                data: [9, 7, 8, 9, 6],
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderColor: 'rgb(155, 89, 182)',
            }, {
                label: 'Team Bravo',
                data: [7, 9, 9, 8, 8],
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: 'rgb(231, 76, 60)',
            }]
        },
        options: { responsive: true }
    });

    // 3. Customer Satisfaction Chart (Doughnut)
    const satisfactionCtx = document.getElementById('satisfactionChart').getContext('2d');
    new Chart(satisfactionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'],
            datasets: [{
                data: [120, 190, 30, 15],
                backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c'],
            }]
        },
        options: { responsive: true }
    });
});