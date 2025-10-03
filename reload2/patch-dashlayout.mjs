import fs from 'fs';
const p = 'src/components/DashboardLayout.tsx';
let c = fs.readFileSync(p,'utf8');
c = c.replace('<div className="text-sm font-bold text-foreground">', '<div className="text-sm font-bold text-foreground" data-testid="people-served-value">');
fs.writeFileSync(p,c);
