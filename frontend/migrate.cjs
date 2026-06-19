const fs = require('fs');

// 1. Read files
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const info = fs.readFileSync('src/pages/Information.tsx', 'utf8');
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// 2. Extract Tabs block from Information.tsx
const tabsMatch = info.match(/<Tabs defaultValue="rooms" className="w-full">[\s\S]*?<\/Tabs>/);
if (!tabsMatch) {
  console.error('Could not find Tabs block in Information.tsx');
  process.exit(1);
}
const tabsBlock = tabsMatch[0];

// 3. Prepare Dashboard.tsx
// Add imports
dashboard = dashboard.replace(
  'import { dashboardAPI } from \'@/services/api\';',
  'import { dashboardAPI, informationAPI } from \'@/services/api\';'
);
dashboard = dashboard.replace(
  'import { Card, CardContent, CardHeader, CardTitle } from \'@/components/ui/card\';',
  'import { Card, CardContent, CardHeader, CardTitle } from \'@/components/ui/card\';\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \'@/components/ui/table\';\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \'@/components/ui/tabs\';'
);
dashboard = dashboard.replace(
  'import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from \'recharts\';',
  'import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from \'recharts\';\nimport { formatDate } from \'@/lib/utils\';'
);

// Add state queries
const queriesBlock = `
  const { data: roomInfoResp, isLoading: roomLoading } = useQuery({
    queryKey: ['info-rooms'],
    queryFn: informationAPI.getRooms,
  });

  const { data: pobInfoResp, isLoading: pobLoading } = useQuery({
    queryKey: ['info-pob'],
    queryFn: informationAPI.getPob,
  });

  const rooms = roomInfoResp?.data?.data || [];
  const pobs = pobInfoResp?.data?.data || [];
`;

dashboard = dashboard.replace(
  /const COLORS = \['#A3E635', '#022C22', '#F59E0B'\]; \/\/ Lime-400, Emerald-950, Orange/,
  `const COLORS = ['#A3E635', '#022C22', '#F59E0B']; // Lime-400, Emerald-950, Orange\n${queriesBlock}`
);

// Add Tabs block at the end
dashboard = dashboard.replace(
  '      </div>\n    </div>\n  );',
  '      </div>\n\n      {/* Information Tables */}\n      <div className="mt-8">\n        ' + tabsBlock.split('\n').join('\n        ') + '\n      </div>\n    </div>\n  );'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// 4. Remove from Sidebar
sidebar = sidebar.replace(/\s*\{ icon: Info, label: 'Information', path: '\/information' \},/, '');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

// 5. Remove from Header
header = header.replace(/\s*'\/information': 'Information',/, '');
fs.writeFileSync('src/components/layout/Header.tsx', header);

console.log('Successfully updated Dashboard, Sidebar, and Header.');
