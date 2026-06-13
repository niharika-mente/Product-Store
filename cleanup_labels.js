import { execSync } from 'child_process';

function runCmd(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 10 });
    } catch (e) {
        return null;
    }
}

const REPO = runCmd('gh repo view --json nameWithOwner -q .nameWithOwner').trim();
console.log(`Working on repo: ${REPO}`);

const prsJson = runCmd(`gh pr list --repo ${REPO} --limit 100 --state open --json number,labels`);
if (!prsJson) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}

const prs = JSON.parse(prsJson);

const allowedLabels = ['ssoc26', 'ssoc', 'easy', 'medium', 'hard'];

for (const pr of prs) {
    const { number, labels } = pr;
    if (!labels) continue;
    
    let labelsToRemove = [];
    
    for (const labelObj of labels) {
        const name = labelObj.name;
        if (!allowedLabels.includes(name.toLowerCase())) {
            labelsToRemove.push(name);
        }
    }
    
    if (labelsToRemove.length > 0) {
        console.log(`PR #${number} - Removing labels: ${labelsToRemove.join(', ')}`);
        // Remove labels one by one or in a single command? 
        // gh pr edit supports multiple --remove-label flags
        const removeFlags = labelsToRemove.map(l => `--remove-label "${l}"`).join(' ');
        runCmd(`gh pr edit ${number} --repo ${REPO} ${removeFlags}`);
    } else {
        console.log(`PR #${number} - No labels to remove.`);
    }
}
console.log("Done cleaning up PR labels.");
