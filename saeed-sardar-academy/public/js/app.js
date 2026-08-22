let currentEmail = "";

// Form Toggle
document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('registerCard').classList.remove('hidden');
});

document.getElementById('showLogin').addEventListener('click', () => {
    document.getElementById('registerCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
});

// Step 1: Register Personal Info
document.getElementById('step1Form').addEventListener('submit', async (e) => {
    e.preventDefault();
    currentEmail = document.getElementById('regEmail').value;
    
    const payload = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: currentEmail,
        password: document.getElementById('regPassword').value
    };

    const res = await fetch('/api/auth/step1-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
        alert(data.message);
        document.getElementById('emailOtpNotice').innerText = `OTP sent! (For Test Use: ${data.mockOtp})`;
        document.getElementById('step1Form').classList.add('hidden');
        document.getElementById('step2Form').classList.remove('hidden');
    } else {
        alert(data.message);
    }
});

// Step 2: Email OTP & Phone Input
document.getElementById('step2Form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        email: currentEmail,
        otp: document.getElementById('emailOtp').value,
        phoneNumber: document.getElementById('regPhone').value
    };

    const res = await fetch('/api/auth/step2-verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
        alert(data.message);
        document.getElementById('phoneOtpNotice').innerText = `SMS OTP sent! (For Test Use: ${data.mockOtp})`;
        document.getElementById('step2Form').classList.add('hidden');
        document.getElementById('step3Form').classList.remove('hidden');
    } else {
        alert(data.message);
    }
});

// Step 3: Phone OTP Verification
document.getElementById('step3Form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        email: currentEmail,
        otp: document.getElementById('phoneOtp').value
    };

    const res = await fetch('/api/auth/step3-verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
        alert(data.message);
        document.getElementById('registerCard').classList.add('hidden');
        document.getElementById('loginCard').classList.remove('hidden');
    } else {
        alert(data.message);
    }
});

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
});
      
