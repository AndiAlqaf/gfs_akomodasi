const fs = require('fs');

function fixLaundry() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Laundry.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // 1. Import
    if (!content.includes('HighlightText')) {
        content = content.replace(
            /(import \{ formatDate \} from '@\/lib\/utils';)/,
            '$1\nimport { HighlightText } from \'@/components/ui/HighlightText\';'
        );
    }

    // 2. States
    if (!content.includes('const [dropSearch, setDropSearch]')) {
        content = content.replace(
            /const \[activeTab, setActiveTab\] = useState\('dropping'\);/,
            `const [activeTab, setActiveTab] = useState('dropping');\n\n  const [dropSearch, setDropSearch] = useState('');\n  const [deliverSearch, setDeliverSearch] = useState('');\n  const [receiveSearch, setReceiveSearch] = useState('');`
        );
    }

    // 3. Filtered variables
    // Find the definition of transactions and bagDataResp
    if (!content.includes('filteredTransactions')) {
        // We will insert right before `const laundryBagRegister`
        content = content.replace(
            /const transactions = laundryDataResp\?\.data\?\.data \|\| laundryDataResp\?\.data \|\| \[\];\n\n  const laundryBagRegister = bagDataResp\?\.data\?\.data \|\| \[\];/,
            `const transactions = laundryDataResp?.data?.data || laundryDataResp?.data || [];\n\n  const filteredTransactions = transactions.filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(dropSearch.toLowerCase())));\n  const filteredReceive = transactions.filter((t: any) => t.current_status !== 'DROPPED_AT_POINT' && t.current_status !== 'RETURNED_TO_DROP' && t.current_status !== 'DISTRIBUTED_TO_ROOM').filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(receiveSearch.toLowerCase())));\n\n  const laundryBagRegister = bagDataResp?.data?.data || [];`
        );
    }
    
    // For filteredDeliver, we must place it AFTER boxList is completely defined.
    // boxList definition ends with: `return Object.values(boxMap);\n  }, [transactions]);`
    if (!content.includes('filteredDeliver')) {
        content = content.replace(
            /return Object\.values\(boxMap\);\n  \}, \[transactions\]\);/,
            `return Object.values(boxMap);\n  }, [transactions]);\n\n  const filteredDeliver = boxList.filter((b: any) => Object.values(b).some(val => String(val).toLowerCase().includes(deliverSearch.toLowerCase())));`
        );
    }

    // 4. Update the maps
    content = content.replace(/\{transactions\.map\(\(t: any\) => \(/g, '{filteredTransactions.map((t: any) => (');
    content = content.replace(/\{boxList\.map\(\(b: any\) => \(/g, '{filteredDeliver.map((b: any) => (');
    content = content.replace(
        /\{transactions\.filter\(\(t: any\) => t\.current_status !== 'DROPPED_AT_POINT' && t\.current_status !== 'RETURNED_TO_DROP' && t\.current_status !== 'DISTRIBUTED_TO_ROOM'\)\.map\(\(t: any\) => \(/g,
        '{filteredReceive.map((t: any) => ('
    );

    // 5. Update UI inputs
    // The inputs are currently:
    // <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
    // We have 3 tabs, they appear in order: drop, deliver, receive
    let occurrences = 0;
    content = content.replace(
        /<div className="relative">\s*<Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" \/>\s*<Input placeholder="Search\.\.\." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" \/>\s*<\/div>/g,
        (match) => {
            occurrences++;
            let st = '', setSt = '';
            if (occurrences === 1) { st = 'dropSearch'; setSt = 'setDropSearch'; }
            if (occurrences === 2) { st = 'deliverSearch'; setSt = 'setDeliverSearch'; }
            if (occurrences === 3) { st = 'receiveSearch'; setSt = 'setReceiveSearch'; }
            return `<div className="flex items-center gap-2">\n                  <div className="relative">\n                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />\n                    <Input placeholder="Search..." value={${st}} onChange={e => ${setSt}(e.target.value)} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />\n                  </div>\n                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4">Search</Button>\n                </div>`;
        }
    );

    // 6. Fix Cells carefully using string manipulations by splitting on `<tbody>` chunks to know which search to apply.
    // Table 1: Dropping (uses filteredTransactions, variable t)
    // Table 2: Delivering (uses filteredDeliver, variable b)
    // Table 3: Receiving (uses filteredReceive, variable t)

    let tableBodies = content.split('<tbody className="divide-y divide-emerald-50">');
    
    if (tableBodies.length === 4) {
        // Drop
        tableBodies[1] = tableBodies[1].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2}} highlight={dropSearch} />${p3}`);
        tableBodies[1] = tableBodies[1].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2} || '-'} highlight={dropSearch} />${p3}`);
        tableBodies[1] = tableBodies[1].replace(/\{t\.drop_date \? new Date\(t\.drop_date\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={t.drop_date ? new Date(t.drop_date).toLocaleDateString() : \'-\'} highlight={dropSearch} />');
        
        // Deliver
        tableBodies[2] = tableBodies[2].replace(/(<td className="[^"]*">)\{b\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={b.${p2}} highlight={deliverSearch} />${p3}`);
        tableBodies[2] = tableBodies[2].replace(/(<td className="[^"]*">)\{b\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={b.${p2} || '-'} highlight={deliverSearch} />${p3}`);
        tableBodies[2] = tableBodies[2].replace(/\{b\.deliverDate \? new Date\(b\.deliverDate\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={b.deliverDate ? new Date(b.deliverDate).toLocaleDateString() : \'-\'} highlight={deliverSearch} />');
        tableBodies[2] = tableBodies[2].replace(/\{b\.returnDate \? new Date\(b\.returnDate\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={b.returnDate ? new Date(b.returnDate).toLocaleDateString() : \'-\'} highlight={deliverSearch} />');
        tableBodies[2] = tableBodies[2].replace(/>\{b\.bagsCount\} Bags?</g, '><HighlightText text={`${b.bagsCount} Bags`} highlight={deliverSearch} /><');

        // Receive
        tableBodies[3] = tableBodies[3].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+)\}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2}} highlight={receiveSearch} />${p3}`);
        tableBodies[3] = tableBodies[3].replace(/(<td className="[^"]*">)\{t\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g, (match, p1, p2, p3) => `${p1}<HighlightText text={t.${p2} || '-'} highlight={receiveSearch} />${p3}`);
        tableBodies[3] = tableBodies[3].replace(/\{t\.receiving_date \? new Date\(t\.receiving_date\)\.toLocaleDateString\(\) : '-'\}/g, '<HighlightText text={t.receiving_date ? new Date(t.receiving_date).toLocaleDateString() : \'-\'} highlight={receiveSearch} />');
    }

    content = tableBodies.join('<tbody className="divide-y divide-emerald-50">');
    
    // Explicit fixes for strong/badges
    content = content.replace(
        /<strong>\{t\.guest_name\}<\/strong>/g,
        '<strong><HighlightText text={t.guest_name} highlight={dropSearch || receiveSearch} /></strong>' // close enough
    );
    
    fs.writeFileSync(path, content);
}

fixLaundry();
console.log('Fixed Laundry Cleanly');
