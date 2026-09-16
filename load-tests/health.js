import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || '';

export const options = {
  vus: 1000,
  duration: '10s',
};

export default function () {
  if (!BASE_URL) {
    console.log('[HEALTH] WARNING: BASE_URL env var is not set — requests will fail');
    return;
  }

  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}