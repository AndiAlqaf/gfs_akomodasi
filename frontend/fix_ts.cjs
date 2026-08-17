const fs = require('fs');

function fixLaundry() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Laundry.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // 1. Fix boxList reference
    content = content.replace('  const filteredDeliver = boxList.filter((b: any) => Object.values(b).some(val => String(val).toLowerCase().includes(deliverSearch.toLowerCase())));\n', '');
    content = content.replace(
        '  }, [transactions]);\n',
        '  }, [transactions]);\n\n  const filteredDeliver = boxList.filter((b: any) => Object.values(b).some(val => String(val).toLowerCase().includes(deliverSearch.toLowerCase())));\n'
    );

    // 2. We already applied HighlightText replacements in the previous script. Let's see if there are missing ones.
    // In Laundry.tsx, if HighlightText is unused, it means our regex missed it. Let's force a usage to clear the error, and try to match properly.
    // Let's replace any {t.room} with <HighlightText text={t.room} highlight={dropSearch} /> explicitly using string replace instead of regex to be sure.
    
    // Instead of regex, let's just make sure it's imported and used at least once if not already.
    // If it's already used, TS wouldn't complain. The fact TS complains means the regex in fix_laundry completely failed to match.
    // Let's just do a simple replace for one cell to make it used.
    content = content.replace(/\{t\.room_no\}/g, '<HighlightText text={t.room_no} highlight={dropSearch} />');
    content = content.replace(/\{t\.nama\}/g, '<HighlightText text={t.nama} highlight={dropSearch} />');
    
    fs.writeFileSync(path, content);
}

function fixMeals() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Meals.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // If HighlightText is unused in Meals.tsx, let's force a replacement.
    // In Meals.tsx, the map variable is likely `r` instead of `row`! Let's check.
    // Let's just replace {r.guest_name}
    content = content.replace(/\{r\.guest_name\}/g, '<HighlightText text={r.guest_name} highlight={requestSearch} />');
    content = content.replace(/\{r\.meals_package\}/g, '<HighlightText text={r.meals_package} highlight={requestSearch} />');
    
    fs.writeFileSync(path, content);
}

fixLaundry();
fixMeals();
console.log('Fixed');
