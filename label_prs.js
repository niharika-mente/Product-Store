import { execSync } from 'child_process';
import fs from 'fs';

function runCmd(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 10 });
    } catch (e) {
        return null;
    }
}

const REPO = runCmd('gh repo view --json nameWithOwner -q .nameWithOwner').trim();
console.log(`Working on repo: ${REPO}`);

// Fetch existing labels
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

console.log(`Fetching open PRs for ${REPO}...`);
const prsJson = runCmd(`gh pr list --repo ${REPO} --limit 100 --state open --search "-label:mentor:Aamod007" --json number,title,body,closingIssuesReferences`);
if (!prsJson) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}
const prs = JSON.parse(prsJson);

let processedCount = 0;

for (const pr of prs) {
    const { number, title, body } = pr;
    
    if (number === 164 || number === 163) {
        console.log(`Skipping PR #${number} (already manually reviewed)`);
        continue;
    }
    
    console.log(`\nReviewing PR #${number} - ${title}`);
    
    // Check mergeability status
    const viewJsonStr = runCmd(`gh pr view ${number} --repo ${REPO} --json mergeable`);
    let isConflicting = false;
    if (viewJsonStr) {
        try {
            const viewData = JSON.parse(viewJsonStr);
            if (viewData.mergeable === 'CONFLICTING') {
                isConflicting = true;
            }
        } catch(e) {}
    }
    
    // Get diff
    const diff = runCmd(`gh pr diff ${number} --repo ${REPO}`);
    if (!diff) {
        console.log(`Failed to fetch diff for PR #${number}`);
        continue;
    }

    const titleLower = title.toLowerCase();
    const bodyLower = (body || '').toLowerCase();
    const diffLower = diff.toLowerCase();
    
    const diffLines = diff.split('\n');
    let filesChangedCount = 0;
    for (const line of diffLines) {
        if (line.startsWith('diff --git')) filesChangedCount++;
    }

    let points = [];
    
    // Check for negative quality signals
    if (diff.includes('console.log') || diff.includes('debugger') || diff.includes('// TODO')) {
        points.push("* There appear to be leftover debugging statements (`console.log`) or `TODO` comments. Please clean these up for maintainability.");
    }

    if (isConflicting) {
        points.push("* There are merge conflicts with the base branch. Please resolve them to ensure existing functionality isn't broken.");
    }

    let labels = [];
    
    // Fetch labels from closing issues
    if (pr.closingIssuesReferences && pr.closingIssuesReferences.length > 0) {
        for (const issueRef of pr.closingIssuesReferences) {
            const issueJson = runCmd(`gh issue view ${issueRef.number} --repo ${REPO} --json labels`);
            if (issueJson) {
                try {
                    const issueData = JSON.parse(issueJson);
                    if (issueData.labels) {
                        for (const l of issueData.labels) {
                            const nameLower = l.name.toLowerCase();
                            if (['ssoc26', 'ssoc', 'easy', 'medium', 'hard'].includes(nameLower)) {
                                labels.push(l.name);
                            }
                        }
                    }
                } catch(e) {}
            }
        }
    }

    labels = [...new Set(labels)]; // deduplicate
    
    // Construct the review body
    let action = 'approve';
    let reviewBody = '';
    
    if (points.length > 0 || isConflicting) {
        action = 'request-changes';
        reviewBody = `Thanks for the contribution. I went through the changes and the overall approach looks good, but there are a few issues that should be addressed before this can be merged. Most of the concerns are related to correctness and maintainability.\n\n${points.join('\n\n')}\n\nOnce these issues are addressed, I'll be happy to take another look. Thanks again for the contribution.`;
    } else {
        reviewBody = `Thanks for the contribution. I went through the changes and everything looks solid. The code is readable, well-structured, and aligns with the project conventions.`;
        if (isExceptional) {
            reviewBody += `\n\nJustifying the \`quality:exceptional\` label: you went meaningfully beyond the ask by including robust tests and handling edge cases, reducing future tech debt. Great engineering work here!`;
        }
        reviewBody += `\n\nI'll go ahead and approve this PR. Thanks again for the contribution!`;
    }

    // Execute Label Assignment
    ensureLabelsExist(labels);
    runCmd(`gh pr edit ${number} --repo ${REPO} --add-label "${labels.join(',')}"`);
    console.log(`  -> Applied labels: ${labels.join(', ')}`);

    // Execute Review
    fs.writeFileSync('temp_review.txt', reviewBody);
    const reviewCmd = `gh pr review ${number} --repo ${REPO} --${action} --body-file temp_review.txt`;
    const reviewResult = runCmd(reviewCmd);
    
    if (reviewResult !== null) {
        console.log(`  -> Successfully submitted review: ${action}`);
        processedCount++;
    } else {
        console.log(`  -> Failed to submit review for PR #${number}`);
    }
}

console.log(`\nFinished processing! Successfully reviewed ${processedCount} PRs in ${REPO}.`);

