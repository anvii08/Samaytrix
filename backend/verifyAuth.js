const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_for_development';

// Create a Student token
const studentToken = jwt.sign({ id: 'student_123', role: 'Student' }, JWT_SECRET);

console.log('--- JWT AUTH MIDDLEWARE TEST ---');
console.log('Generated Student Token:', studentToken);

fetch('http://localhost:4000/api/attendance/mark', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studentId: 'student_123', date: '2026-08-20', status: 'Present', mode: 'In-person' })
}).then(async (res) => {
    console.log(`\nTesting Student accessing a Teacher/Admin protected route (/api/attendance):`);
    console.log(`Status Code: ${res.status}`);
    const data = await res.json().catch(() => ({}));
    console.log(`Response Body:`, data);
}).catch(err => console.error(err));
