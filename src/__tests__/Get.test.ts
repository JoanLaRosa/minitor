import fetch from 'node-fetch';

test('can get url', async () => {
  const url = 'https://check.torproject.org/api/ip';
  const response = await fetch(url);
  expect(response.status).toBe(200);
});
