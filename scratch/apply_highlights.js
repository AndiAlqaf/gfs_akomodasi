const fs = require('fs');

function applyHighlights(filePath, searchStatesConfig) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add import if missing
    if (!content.includes('import { HighlightText }')) {
        content = content.replace(
            "import { exportToExcel } from '@/lib/exportUtils';",
            "import { exportToExcel } from '@/lib/exportUtils';\nimport { HighlightText } from '@/components/ui/HighlightText';"
        );
        if (!content.includes('import { HighlightText }')) {
             content = content.replace(
                 "import { Search, Download }",
                 "import { HighlightText } from '@/components/ui/HighlightText';\nimport { Search, Download }"
             );
        }
        if (!content.includes('import { HighlightText }')) {
             content = content.replace(
                 "import { Search, Plus",
                 "import { HighlightText } from '@/components/ui/HighlightText';\nimport { Search, Plus"
             );
        }
        if (!content.includes('import { HighlightText }')) {
             content = content.replace(
                 "import { Search",
                 "import { HighlightText } from '@/components/ui/HighlightText';\nimport { Search"
             );
        }
    }

    // Apply regex replacements for each section
    searchStatesConfig.forEach(config => {
        const { startPattern, endPattern, searchVar, mapVar } = config;
        
        const startIdx = content.indexOf(startPattern);
        if (startIdx === -1) {
            console.log(`Could not find start pattern for ${searchVar} in ${filePath}`);
            return;
        }
        
        let endIdx = content.indexOf(endPattern, startIdx);
        if (endIdx === -1) endIdx = content.length; // Fallback
        
        let block = content.substring(startIdx, endIdx);
        
        // Match <td>{...}</td> or <td>...{...}...</td>
        // A safer regex for <td>{r.something}</td> or similar, as long as it does NOT already contain HighlightText
        block = block.replace(/(<td[^>]*>)([^<]*\{[^}]+\}[^<]*)(<\/td>)/g, (match, p1, p2, p3) => {
            if (p2.includes('HighlightText') || p2.includes('button') || p2.includes('Button') || p2.includes('Badge')) {
                return match;
            }
            return `${p1}<HighlightText text={${p2.replace(/^{|}$/g, '')}} highlight={${searchVar}} />${p3}`;
        });
        
        content = content.substring(0, startIdx) + block + content.substring(endIdx);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Processed ${filePath}`);
}

// Information.tsx
applyHighlights('frontend/src/pages/Information.tsx', [
    { startPattern: 'paginatedRooms.map', endPattern: '</tbody>', searchVar: 'roomSearch' },
    { startPattern: 'paginatedMeeting.map', endPattern: '</tbody>', searchVar: 'meetingSearch' },
    { startPattern: 'paginatedPobs.map', endPattern: '</tbody>', searchVar: 'pobSearch' },
    { startPattern: 'paginatedMeals.map', endPattern: '</tbody>', searchVar: 'mealsSearch' },
    { startPattern: 'paginatedLaundry.map', endPattern: '</tbody>', searchVar: 'laundrySearch' }
]);

// Laundry.tsx
applyHighlights('frontend/src/pages/Laundry.tsx', [
    { startPattern: 'filteredDropTransactions.map', endPattern: '</tbody>', searchVar: 'dropSearch' },
    { startPattern: 'filteredBoxList.map', endPattern: '</tbody>', searchVar: 'deliverSearch' },
    { startPattern: 'filteredReceiveTransactions.filter', endPattern: '</tbody>', searchVar: 'receiveSearch' }
]);

// Reservations.tsx
applyHighlights('frontend/src/pages/Reservations.tsx', [
    { startPattern: 'bedroomPaginatedData.map', endPattern: '</tbody>', searchVar: 'roomSearch' },
    { startPattern: 'filteredMeetingBookings.map', endPattern: '</tbody>', searchVar: 'meetingSearch' },
    { startPattern: 'checkInOutPaginatedData.map', endPattern: '</tbody>', searchVar: 'checkInOutSearch' }
]);
