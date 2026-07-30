const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx')).forEach(file => {
  let p = path.join(pagesDir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. Add flex-1 to table wrappers
  content = content.replace(/w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col max-h-full min-h-0/g, 'w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0');
  
  // 2. Add overflow-hidden to TabsContent
  content = content.replace(/data-\\[state=active\\]:flex flex-col flex-1 min-h-0 w-full(?! overflow-hidden)/g, 'data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden');
  
  // 3. Remove items-start from p-6 wrappers
  content = content.replace(/className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden items-start"/g, 'className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden "');
  content = content.replace(/className="p-6 bg-stone-50\\/50 flex-1 flex flex-col min-h-0 overflow-hidden items-start"/g, 'className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden "');

  fs.writeFileSync(p, content);
});
console.log('Flex layout fixes applied');
