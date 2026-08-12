const fs = require('fs');
let p = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Meals.tsx';
let c = fs.readFileSync(p, 'utf-8');

// For req (Table 1: paginatedRequests)
c = c.replace(/\{req\.([a-zA-Z_]+)\}/g, '<HighlightText text={req.$1} highlight={requestSearch} />');
c = c.replace(/\{req\.([a-zA-Z_]+) \|\| '-'\}/g, '<HighlightText text={req.$1 || "-"} highlight={requestSearch} />');
c = c.replace(/\{req\.date_req \? new Date\(req\.date_req\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={req.date_req ? new Date(req.date_req).toLocaleDateString() : "-"} highlight={requestSearch} />');

// For row (Table 2: paginatedSchedule & Table 3: paginatedDelivery)
let parts = c.split('paginatedSchedule');
if (parts.length > 1) {
    let subParts = parts[1].split('paginatedDelivery');
    subParts[0] = subParts[0].replace(/(<td className=[^>]*>)\{row\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2}} highlight={scheduleSearch} />${p3}`);
    subParts[0] = subParts[0].replace(/(<td className=[^>]*>)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2} || "-"} highlight={scheduleSearch} />${p3}`);
    subParts[0] = subParts[0].replace(/>\{formatDate\(row\.date\)\}</g, '><HighlightText text={formatDate(row.date)} highlight={scheduleSearch} /><');

    if (subParts.length > 1) {
        subParts[1] = subParts[1].replace(/(<td className=[^>]*>)\{row\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2}} highlight={deliverySearch} />${p3}`);
        subParts[1] = subParts[1].replace(/(<td className=[^>]*>)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={row.${p2} || "-"} highlight={deliverySearch} />${p3}`);
        subParts[1] = subParts[1].replace(/>\{formatDate\(row\.date\)\}</g, '><HighlightText text={formatDate(row.date)} highlight={deliverySearch} /><');
    }
    parts[1] = subParts.join('paginatedDelivery');
}
c = parts.join('paginatedSchedule');

fs.writeFileSync(p, c);
console.log('Fixed Meals text highlights');
