const fs = require('fs');

function processLaundry() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Laundry.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // 1. Import HighlightText if not present
    if (!content.includes('HighlightText')) {
        content = content.replace(
            /(import { formatDate } from '@\/lib\/utils';)/,
            '$1\nimport { HighlightText } from \'@/components/ui/HighlightText\';'
        );
    }

    // 2. Add search states
    if (!content.includes('const [dropSearch, setDropSearch]')) {
        content = content.replace(
            /const \[activeTab, setActiveTab\] = useState\('dropping'\);/,
            `const [activeTab, setActiveTab] = useState('dropping');\n\n  const [dropSearch, setDropSearch] = useState('');\n  const [deliverSearch, setDeliverSearch] = useState('');\n  const [receiveSearch, setReceiveSearch] = useState('');`
        );
    }

    // 3. Define filtered arrays
    if (!content.includes('filteredTransactions')) {
        content = content.replace(
            /const transactions = laundryDataResp\?\.data\?\.data \|\| laundryDataResp\?\.data \|\| \[\];/,
            `const transactions = laundryDataResp?.data?.data || laundryDataResp?.data || [];\n\n  const filteredTransactions = transactions.filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(dropSearch.toLowerCase())));\n  const filteredDeliver = boxList.filter((b: any) => Object.values(b).some(val => String(val).toLowerCase().includes(deliverSearch.toLowerCase())));\n  const filteredReceive = transactions.filter((t: any) => t.current_status !== 'DROPPED_AT_POINT' && t.current_status !== 'RETURNED_TO_DROP' && t.current_status !== 'DISTRIBUTED_TO_ROOM').filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(receiveSearch.toLowerCase())));`
        );
    }

    // 4. Update the mapping targets
    content = content.replace(/\{transactions\.map\(\(t: any\) => \(/g, '{filteredTransactions.map((t: any) => (');
    content = content.replace(/\{boxList\.map\(\(b: any\) => \(/g, '{filteredDeliver.map((b: any) => (');
    content = content.replace(
        /\{transactions\.filter\(\(t: any\) => t\.current_status !== 'DROPPED_AT_POINT' && t\.current_status !== 'RETURNED_TO_DROP' && t\.current_status !== 'DISTRIBUTED_TO_ROOM'\)\.map\(\(t: any\) => \(/g,
        '{filteredReceive.map((t: any) => ('
    );

    // 5. Update UI for the 3 tables (Search Button and Input onChange)
    // Table 1 (Dropping)
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" \/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={dropSearch} onChange={e => setDropSearch(e.target.value)} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4">Search</Button>\n                </div>`
    );
    // Table 2 (Delivering)
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" \/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={deliverSearch} onChange={e => setDeliverSearch(e.target.value)} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4">Search</Button>\n                </div>`
    );
    // Table 3 (Receiving)
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" \/>\s*<\/div>/,
        `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={receiveSearch} onChange={e => setReceiveSearch(e.target.value)} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4">Search</Button>\n                </div>`
    );

    // 6. Replace text inside cells with HighlightText
    // We can do a smart replace where t.prop or b.prop are replaced.
    // However, it's safer to just replace all {t.prop} and {b.prop} if they are inside <td>.

    let parts = content.split('filtered');
    if (parts.length > 1) {
        // Table 1 - filteredTransactions
        if (parts[1]) {
            parts[1] = parts[1].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2}} highlight={dropSearch} />${p3}`);
            parts[1] = parts[1].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2} || '-'} highlight={dropSearch} />${p3}`);
            parts[1] = parts[1].replace(/\{t\.drop_date \? new Date\(t\.drop_date\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={t.drop_date ? new Date(t.drop_date).toLocaleDateString() : \'-\'} highlight={dropSearch} />');
            parts[1] = parts[1].replace(/\{formatDate\(t\.receiving_date\)\}/g, '<HighlightText text={formatDate(t.receiving_date)} highlight={dropSearch} />');
            parts[1] = parts[1].replace(/\{formatDate\(t\.drop_date\)\}/g, '<HighlightText text={formatDate(t.drop_date)} highlight={dropSearch} />');
            // Check for {t.guest_name} inside badge or strong
            parts[1] = parts[1].replace(/\{t\.guest_name\}/g, '<HighlightText text={t.guest_name} highlight={dropSearch} />');
            parts[1] = parts[1].replace(/>\{t\.room\}</g, '><HighlightText text={t.room} highlight={dropSearch} /><');
            parts[1] = parts[1].replace(/>\{t\.laundry_bag_id\}</g, '><HighlightText text={t.laundry_bag_id} highlight={dropSearch} /><');
            parts[1] = parts[1].replace(/>\{t\.laundry_box_id\}</g, '><HighlightText text={t.laundry_box_id} highlight={dropSearch} /><');
        }

        // Table 2 - filteredDeliver
        if (parts[2]) {
            parts[2] = parts[2].replace(/(<td className="[^"]*">)\{b\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={b.${p2}} highlight={deliverSearch} />${p3}`);
            parts[2] = parts[2].replace(/(<td className="[^"]*">)\{b\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={b.${p2} || '-'} highlight={deliverSearch} />${p3}`);
            parts[2] = parts[2].replace(/\{b\.deliverDate \? new Date\(b\.deliverDate\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={b.deliverDate ? new Date(b.deliverDate).toLocaleDateString() : \'-\'} highlight={deliverSearch} />');
            parts[2] = parts[2].replace(/\{b\.returnDate \? new Date\(b\.returnDate\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={b.returnDate ? new Date(b.returnDate).toLocaleDateString() : \'-\'} highlight={deliverSearch} />');
            parts[2] = parts[2].replace(/\{formatDate\(b\.deliverDate\)\}/g, '<HighlightText text={formatDate(b.deliverDate)} highlight={deliverSearch} />');
            parts[2] = parts[2].replace(/\{formatDate\(b\.returnDate\)\}/g, '<HighlightText text={formatDate(b.returnDate)} highlight={deliverSearch} />');
            parts[2] = parts[2].replace(/>\{b\.boxId\}</g, '><HighlightText text={b.boxId} highlight={deliverSearch} /><');
            parts[2] = parts[2].replace(/>\{b\.dropPoint\}</g, '><HighlightText text={b.dropPoint} highlight={deliverSearch} /><');
            parts[2] = parts[2].replace(/>\{b\.bagsCount\} Bags?</g, '><HighlightText text={`${b.bagsCount} Bags`} highlight={deliverSearch} /><');
        }

        // Table 3 - filteredReceive
        if (parts[3]) {
            parts[3] = parts[3].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2}} highlight={receiveSearch} />${p3}`);
            parts[3] = parts[3].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2} || '-'} highlight={receiveSearch} />${p3}`);
            parts[3] = parts[3].replace(/\{t\.receiving_date \? new Date\(t\.receiving_date\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={t.receiving_date ? new Date(t.receiving_date).toLocaleDateString() : \'-\'} highlight={receiveSearch} />');
            parts[3] = parts[3].replace(/\{formatDate\(t\.receiving_date\)\}/g, '<HighlightText text={formatDate(t.receiving_date)} highlight={receiveSearch} />');
            parts[3] = parts[3].replace(/>\{t\.guest_name\}</g, '><HighlightText text={t.guest_name} highlight={receiveSearch} /><');
            parts[3] = parts[3].replace(/>\{t\.room\}</g, '><HighlightText text={t.room} highlight={receiveSearch} /><');
            parts[3] = parts[3].replace(/>\{t\.laundry_bag_id\}</g, '><HighlightText text={t.laundry_bag_id} highlight={receiveSearch} /><');
            parts[3] = parts[3].replace(/>\{t\.laundry_box_id\}</g, '><HighlightText text={t.laundry_box_id} highlight={receiveSearch} /><');
            parts[3] = parts[3].replace(/>\{t\.weight \|\| '-'\}/g, '><HighlightText text={t.weight || \'-\'} highlight={receiveSearch} />');
            parts[3] = parts[3].replace(/>\{t\.no_of_pcs_total \|\| '-'\}/g, '><HighlightText text={t.no_of_pcs_total || \'-\'} highlight={receiveSearch} />');
        }
    }

    content = parts.join('filtered');

    fs.writeFileSync(path, content);
}

processLaundry();
console.log('Laundry done');
