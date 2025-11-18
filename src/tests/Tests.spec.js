import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts_duration', true);
export const rateStatusCodeOK = new Rate('rate_status_code_ok');

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.25'],
        get_contacts: ['p(90)<6800'],
        content_OK: ['rate>0.75']
      },

  stages: [
    { duration: '1s', target: 7 },
    { duration: '3m30s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'http://servicodados.ibge.gov.br/api/v3/noticias/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  rateStatusCodeOK.add(res.status === OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === OK
  });
}
