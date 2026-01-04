document.getElementById('bookingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    // Gather Data
    const data = {
        phoneNumber: document.getElementById('phoneNumber').value,
        grNumber: document.getElementById('grNumber').value,
        consignor: document.getElementById('consignor').value,
        consignee: document.getElementById('consignee').value,
        fromLocation: document.getElementById('fromLocation').value,
        toLocation: document.getElementById('toLocation').value,
        quantity: document.getElementById('quantity').value,
        egrLink: document.getElementById('egrLink').value,
        customerCare: '9358505935, 9634222550',
        companyName: 'JAIN KANTE WALE AGRA'
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
