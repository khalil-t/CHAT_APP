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
    const email = `loadtest${i}@example.com`;
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

  group('sign in', () => {
    const res = http.post(
      `${BASE_URL}/auth/sign-in`,
      JSON.stringify({ email, password }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    logStep('sign-in', res);

    check(res, {
      'login successful (200)': (r) => r.status === 200,
      'received token': (r) => r.json('accessToken') !== undefined,
    });
  });
}