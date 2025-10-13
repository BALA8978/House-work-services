document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    async function fetchProfitData() {
        try {
            const response = await fetch('get_profit_data.php');
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                document.getElementById('total-revenue').textContent = `₹${parseFloat(data.summary.total_revenue || 0).toFixed(2)}`;
                document.getElementById('total-payouts').textContent = `₹${parseFloat(data.summary.total_payouts || 0).toFixed(2)}`;
                document.getElementById('gross-profit').textContent = `₹${parseFloat(data.summary.gross_profit || 0).toFixed(2)}`;
                
                const monthlyTbody = document.getElementById('monthly-breakdown-tbody');
                monthlyTbody.innerHTML = '';
                if (data.monthly_breakdown.length > 0) {
                    data.monthly_breakdown.forEach(month => {
                        const profit = parseFloat(month.revenue || 0) - parseFloat(month.payouts || 0);
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${month.month}</td>
                            <td>₹${parseFloat(month.revenue || 0).toFixed(2)}</td>
                            <td>₹${parseFloat(month.payouts || 0).toFixed(2)}</td>
                            <td>₹${profit.toFixed(2)}</td>
                        `;
                        monthlyTbody.appendChild(tr);
                    });
                } else {
                    monthlyTbody.innerHTML = '<tr><td colspan="4">No monthly data available.</td></tr>';
                }
            }
        } catch (error) {
            console.error('Error fetching profit data:', error);
        }
    }

    fetchProfitData();
});