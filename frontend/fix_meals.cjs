const fs = require('fs');

function processMeals() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Meals.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // 1. Import HighlightText if not present
    if (!content.includes('HighlightText')) {
        content = content.replace(
            /(import { formatDate } from '@\/lib\/utils';)/,
            '$1\nimport { HighlightText } from \'@/components/ui/HighlightText\';'
        );
    }

    // 2. Add search buttons
    // Request Tab
    content = content.replace(
        /(<Input placeholder="Search\.\.\." value=\{requestSearch\} onChange=\{e => \{ setRequestSearch\(e\.target\.value\); setRequestPage\(1\); \}\} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" \/>\s*<\/div>)/,
        '$1\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setRequestPage(1)}>Search</Button>'
    );
    // Note: the original wrapping was:
    // <div className="relative"> ... </div>
    // I need to wrap it with <div className="flex items-center gap-2"> ... </div>
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." value=\{requestSearch\}.*\/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={requestSearch} onChange={e => { setRequestSearch(e.target.value); setRequestPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setRequestPage(1)}>Search</Button>\n                </div>`
    );

    // Schedule Tab
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." value=\{scheduleSearch\}.*\/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={scheduleSearch} onChange={e => { setScheduleSearch(e.target.value); setSchedulePage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setSchedulePage(1)}>Search</Button>\n                </div>`
    );

    // Delivery Tab
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." value=\{deliverySearch\}.*\/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={deliverySearch} onChange={e => { setDeliverySearch(e.target.value); setDeliveryPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setDeliveryPage(1)}>Search</Button>\n                </div>`
    );

    // 3. HighlightText replacements
    const highlightReplacer = (searchState) => (match, p1, p2, p3) => {
        return `${p1}<HighlightText text={row.${p2}} highlight={${searchState}} />${p3}`;
    };

    // Since we map through paginatedRequests, paginatedSchedule, paginatedDelivery, we can distinguish by a block search or just replace carefully.
    // Actually, all tables use `row`. Let's just figure out which one is which by the map function.
    let parts = content.split('paginated');
    // parts[0] is before any mapping
    // parts[1] is Requests
    if (parts[1]) {
        parts[1] = parts[1].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+)\}(<\/td>)/g, highlightReplacer('requestSearch'));
        parts[1] = parts[1].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2} || '-'} highlight={requestSearch} />${p3}`);
        // Date formatting
        parts[1] = parts[1].replace(/\{row\.date_req \? new Date\(row\.date_req\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={row.date_req ? new Date(row.date_req).toLocaleDateString() : \'-\'} highlight={requestSearch} />');
    }
    // parts[2] is Schedule
    if (parts[2]) {
        parts[2] = parts[2].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+)\}(<\/td>)/g, highlightReplacer('scheduleSearch'));
        parts[2] = parts[2].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2} || '-'} highlight={scheduleSearch} />${p3}`);
        parts[2] = parts[2].replace(/\{formatDate\(row\.date\)\}/g, '<HighlightText text={formatDate(row.date)} highlight={scheduleSearch} />');
    }
    // parts[3] is Delivery
    if (parts[3]) {
        parts[3] = parts[3].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+)\}(<\/td>)/g, highlightReplacer('deliverySearch'));
        parts[3] = parts[3].replace(/(<td className="[^"]*">)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2} || '-'} highlight={deliverySearch} />${p3}`);
        parts[3] = parts[3].replace(/\{formatDate\(row\.date\)\}/g, '<HighlightText text={formatDate(row.date)} highlight={deliverySearch} />');
    }

    content = parts.join('paginated');

    fs.writeFileSync(path, content);
}

processMeals();
console.log('Meals done');
