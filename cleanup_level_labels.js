import { execSync } from 'child_process';

const REPO = 'JhaSourav07/commitpulse';

function runCmd(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 10 });
    } catch (e) {
        return null;
    }
}

console.log(`Fetching all PRs to clean up labels...`);
const prsJson = runCmd(`gh pr list --repo ${REPO} --limit 300 --state all --json number,title,labels`);
if (!prsJson) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}
const prs = JSON.parse(prsJson);
let cleanedCount = 0;

for (const pr of prs) {
    const { number, title, labels } = pr;
    
    const existingLabels = labels.map(l => l.name);
    const levelLabels = existingLabels.filter(l => l.startsWith('level:'));
    
    if (levelLabels.length > 1) {
        console.log(`\nPR #${number} has multiple level labels: ${levelLabels.join(', ')}`);
        
        // Decide which one to keep
        const order = ['level:critical', 'level:advanced', 'level:intermediate', 'level:beginner'];
        let kept = null;
        for (const l of order) {
            if (levelLabels.includes(l)) {
                kept = l;
                break;
            }
        }
        
        const toRemove = levelLabels.filter(l => l !== kept);
        if (toRemove.length > 0) {
            console.log(`  -> Keeping ${kept}, removing: ${toRemove.join(', ')}`);
            runCmd(`gh pr edit ${number} --repo ${REPO} --remove-label "${toRemove.join(',')}"`);
            cleanedCount++;
        }
    }
}

console.log(`\nCleanup complete. Cleaned ${cleanedCount} PRs.`);
