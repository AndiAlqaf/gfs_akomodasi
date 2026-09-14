const http = require('http');

http.get('http://localhost:31145/api/information?type=pob', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const pobs = JSON.parse(data).data || [];
      console.log('Total Raw PoBs from Backend:', pobs.length);
      
      const expandedPobsMap = new Map();
      const today = new Date('2026-09-14');
      today.setHours(0, 0, 0, 0);

      pobs.forEach(p => {
        if (p.date) {
          const startDate = new Date(p.date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = today;

          if (startDate <= endDate && endDate.getTime() - startDate.getTime() < 10 * 365 * 24 * 60 * 60 * 1000) {
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const day = String(currentDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              const key = p.name + '_' + p.room_no + '_' + dateStr;

              if (!expandedPobsMap.has(key)) {
                let dailyStatus = p.boarding_status;
                if (p.check_out_date) {
                  const checkOut = new Date(p.check_out_date);
                  checkOut.setHours(0, 0, 0, 0);
                  if (currentDate >= checkOut) {
                    dailyStatus = 'OFF BOARD';
                  } else {
                    dailyStatus = 'ON BOARD';
                  }
                } else {
                  dailyStatus = p.boarding_status;
                }
                expandedPobsMap.set(key, { ...p, date: dateStr, boarding_status: dailyStatus });
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        }
      });

      console.log('Total Expanded PoBs:', expandedPobsMap.size);

      const filteredPobs = Array.from(expandedPobsMap.values()).filter(p => {
        const category = String(p.occupants_category || '').toUpperCase();
        if (p.boarding_status === 'ON BOARD') return true;
        if (p.boarding_status === 'OFF BOARD' && category === 'REGULAR GUEST') return true;
        return false;
      });

      console.log('Total Filtered PoBs:', filteredPobs.length);

      const byDate = {};
      filteredPobs.forEach(p => {
        if (!byDate[p.date]) byDate[p.date] = 0;
        byDate[p.date]++;
      });
      
      const dates = Object.keys(byDate).sort((a,b) => b.localeCompare(a)).slice(0, 5);
      console.log('PoB Counts for the last 5 days:');
      dates.forEach(d => console.log(`${d}: ${byDate[d]} guests`));
      
      if (dates.length > 0) {
        const yesterdayPobs = filteredPobs.filter(p => p.date === dates[1] || p.date === dates[0]);
        console.log('\nSample for dates:');
        yesterdayPobs.slice(0, 10).forEach(p => console.log(`- ${p.date} | ${p.name} | ${p.occupants_category} | ${p.boarding_status}`));
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', err => console.error(err));
