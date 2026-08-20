

async function test() {
  console.log("1. Logging in as Student...");
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'Student', identifier: 'S123', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log(loginData);
  const token = loginData.token;

  if (!token) {
    console.error("Failed to get token");
    return;
  }

  console.log("\n2. Testing Auth Middleware (Student trying to access Teacher route)...");
  const attendanceRes = await fetch('http://localhost:4000/api/attendance/mark', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ studentId: 'xyz', date: '2026-08-20', status: 'present', mode: 'manual' })
  });
  const attendanceData = await attendanceRes.json();
  console.log("Status:", attendanceRes.status);
  console.log("Response:", attendanceData);

  console.log("\n3. Testing AI Tutor Endpoint...");
  const tutorRes = await fetch('http://localhost:4000/api/ai-tutor/ask', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question: 'What is photosynthesis?' })
  });
  const tutorData = await tutorRes.json();
  console.log("Status:", tutorRes.status);
  console.log("Response:", JSON.stringify(tutorData, null, 2));
}

test();
