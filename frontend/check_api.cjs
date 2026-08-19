const http = require('http');

http.get('http://localhost:31145/api/information?type=room', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const lh0702 = json.data.filter(r => r.room === 'LH.07.02');
    console.log(JSON.stringify(lh0702, null, 2));
  });
});
