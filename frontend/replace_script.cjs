const fs = require('fs');
const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/DataRegister.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Replace standard {row.prop}
content = content.replace(
    /(<td className="[^"]*">)\{row\.([a-zA-Z_]+)\}(<\/td>)/g,
    '$1<HighlightText text={row.$2} highlight={searchTerm} />$3'
);

// Replace {row.prop || '-'}
content = content.replace(
    /(<td className="[^"]*">)\{row\.([a-zA-Z_]+) \|\| '-'}(<\/td>)/g,
    '$1<HighlightText text={row.$2 || "-"} highlight={searchTerm} />$3'
);

// Replace specific expressions manually to be safe
content = content.replace(
    /\{'MR-' \+ row\.id\?\.toString\(\)\.padStart\(3, '0'\)\}/g,
    '<HighlightText text={"MR-" + row.id?.toString().padStart(3, "0")} highlight={searchTerm} />'
);

content = content.replace(
    /\{row\.created_at \? row\.created_at\.split\(' '\)\[0\] : '-'\}/g,
    '<HighlightText text={row.created_at ? row.created_at.split(" ")[0] : "-"} highlight={searchTerm} />'
);

content = content.replace(
    /\{row\.last_registration \? new Date\(row\.last_registration\)\.toLocaleDateString\(\) : '-'\}/g,
    '<HighlightText text={row.last_registration ? new Date(row.last_registration).toLocaleDateString() : "-"} highlight={searchTerm} />'
);

fs.writeFileSync(path, content);
console.log("Done");
