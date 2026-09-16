import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL = __ENV.BASE_URL || '';
const PASSWORD = 'Password123!';

export const options = {
  vus: 10,
  duration: '30s',
};

function logStep(step, res) {
  const body = typeof res.body === 'string' ? res.body.slice(0, 300) : String(res.body);
  console.log(`[STEP] ${step} -> status=${res.status} body=${body}`);
}

export function setup() {
  if (!BASE_URL) {
    console.log('[SETUP] WARNING: BASE_URL env var is not set — requests will fail');
  }

  const users = [];

  for (let i = 1; i <= 10; i++) {
    const email = `msgloadtest${i}@example.com`;
    const payload = JSON.stringify({ email, password: PASSWORD, passwordConfirm: PASSWORD });

    const signupRes = http.post(`${BASE_URL}/auth/sign-up`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    logStep(`sign-up (${email})`, signupRes);

    const created = signupRes.status === 200 || signupRes.status === 201;
    const conflict = signupRes.status === 409
      || (signupRes.status === 500 && /already exists|unique|duplicate|duplicate key/i.test(signupRes.body || ''));

    if (!created && !conflict) {
      const loginCheck = http.post(`${BASE_URL}/auth/sign-in`, JSON.stringify({ email, password: PASSWORD }), {
        headers: { 'Content-Type': 'application/json' },
      });
      if (loginCheck.status === 200) {
        console.log(`[SETUP] ${email}: signup=${signupRes.status} but login succeeded — user exists`);
      } else {
        console.log(`[SETUP] WARNING ${email}: signup=${signupRes.status}, login=${loginCheck.status}`);
      }
    }

    users.push({ email, password: PASSWORD });
  }

  return { users };
}

export default function (data) {
  const { email, password } = data.users[__VU - 1];

  const loginRes = http.post(
    `${BASE_URL}/auth/sign-in`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  logStep('sign-in', loginRes);

  const token = loginRes.json('accessToken');
  check(loginRes, {
    'login successful (200)': (r) => r.status === 200,
    'received access token': (r) => r.json('accessToken') !== undefined,
  });

  if (!token) {
    console.log(`[FAILURE-POINT] sign-in failed for ${email}; skipping message flow`);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let senderId;
  group('fetch current user', () => {
    const meRes = http.get(`${BASE_URL}/users/user`, { headers });
    logStep('users/user', meRes);
    senderId = meRes.json('id');
    check(meRes, {
      'current user fetched (200)': (r) => r.status === 200,
      'sender id present': (_) => senderId !== undefined,
    });
  });

  if (!senderId) {
    console.log(`[FAILURE-POINT] could not resolve sender id for ${email}; skipping message flow`);
    return;
  }

  group('create message', () => {
    const createRes = http.post(
      `${BASE_URL}/messages`,
      JSON.stringify({
        senderId,
        content: `Load test message from VU ${__VU} at ${Date.now()}`,
        conversationId: null,
      }),
      { headers },
    );
    logStep('POST /messages', createRes);
    check(createRes, {
      'message created (201)': (r) => r.status === 201,
      'message has id': (r) => r.json('id') !== undefined,
    });
  });

  group('list messages', () => {
    const listRes = http.get(`${BASE_URL}/messages`, { headers });
    logStep('GET /messages', listRes);
    check(listRes, {
      'messages listed (200)': (r) => r.status === 200,
    });
  });
}