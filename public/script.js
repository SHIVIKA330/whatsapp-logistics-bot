document.getElementById('bookingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    // Gather Data
    const data = {
        phoneNumber: document.getElementById('phoneNumber').value,
        complaintNo: document.getElementById('complaintNo').value,
        productName: document.getElementById('productName').value,
        cdnCode: document.getElementById('cdnCode').value,
        techName: document.getElementById('techName').value,
        techPhone: document.getElementById('techPhone').value
    };

    try {
        const response = await fetch('/api/send-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showToast('✅ Notification Sent Successfully!');
            document.getElementById('bookingForm').reset();
        } else {
            showToast('❌ Error: ' + (result.error || 'Unknown error'));
        }
    } catch (err) {
        showToast('❌ Network Error: Failed to connect to server.');
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="icon">🚀</span> Send Notification';
    }
});

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
