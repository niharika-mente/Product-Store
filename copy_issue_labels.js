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

let existingLabels = [];
try {
    const labelsJson = runCmd(`gh label list --repo ${REPO} --json name --limit 100`);
    if (labelsJson) {
        existingLabels = JSON.parse(labelsJson).map(l => l.name);
    }
} catch (e) {
    console.error("Failed to fetch labels");
}

function ensureLabelsExist(labels) {
    for (const label of labels) {
        if (!existingLabels.includes(label)) {
            console.log(`Creating missing label: ${label}`);
            runCmd(`gh label create "${label}" --repo ${REPO} --color "ededed" -f`);
            existingLabels.push(label);
        }
    }
}

console.log(`Fetching open PRs and their linked issues for ${REPO}...`);
const prsJson = runCmd(`gh pr list --repo ${REPO} --limit 100 --state open --json number,closingIssuesReferences`);
if (!prsJson) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}

const prs = JSON.parse(prsJson);

for (const pr of prs) {
    const { number, closingIssuesReferences } = pr;
    if (!closingIssuesReferences || closingIssuesReferences.length === 0) continue;
    
    let labelsToAdd = [];
    
    for (const issueRef of closingIssuesReferences) {
        const issueNumber = issueRef.number;
        const issueJson = runCmd(`gh issue view ${issueNumber} --repo ${REPO} --json labels`);
        if (issueJson) {
            const issueData = JSON.parse(issueJson);
            if (issueData.labels) {
                labelsToAdd.push(...issueData.labels.map(l => l.name));
            }
        }
    }
    
    if (labelsToAdd.length > 0) {
        labelsToAdd = [...new Set(labelsToAdd)]; // deduplicate
        console.log(`PR #${number} inherits labels from issues: ${labelsToAdd.join(', ')}`);
        ensureLabelsExist(labelsToAdd);
        runCmd(`gh pr edit ${number} --repo ${REPO} --add-label "${labelsToAdd.join(',')}"`);
    }
}
console.log("Done adding issue labels.");
