import { execSync } from 'child_process';
import fs from 'fs';

const REPO = 'JhaSourav07/commitpulse';

function runCmd(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 10 });
    } catch (e) {
        return null;
    }
}

console.log(`Fetching all open PRs for ${REPO}...`);
const prsJsonStr = runCmd(`gh pr list --repo ${REPO} --state open --limit 200 --json number,title`);
if (!prsJsonStr) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}

const prs = JSON.parse(prsJsonStr);
let conflictsCount = 0;

for (const pr of prs) {
    const { number, title } = pr;
    
    let mergeable = 'UNKNOWN';
    // Try up to 3 times for UNKNOWN
    for (let i = 0; i < 3; i++) {
        const viewJsonStr = runCmd(`gh pr view ${number} --repo ${REPO} --json mergeable,reviews`);
        if (viewJsonStr) {
            try {
                const viewData = JSON.parse(viewJsonStr);
                mergeable = viewData.mergeable;
                
                if (mergeable === 'CONFLICTING') {
                    // Check if we already requested changes
                    const reviews = viewData.reviews || [];
                    const myReviews = reviews.filter(r => r.author.login === 'Aamod007');
                    
                    let shouldRequestChanges = true;
                    if (myReviews.length > 0) {
                        const lastReview = myReviews[myReviews.length - 1];
                        if (lastReview.state === 'CHANGES_REQUESTED') {
                            console.log(`PR #${number} is CONFLICTING, but we already requested changes.`);
                            shouldRequestChanges = false;
                        }
                    }

                    if (shouldRequestChanges) {
                        console.log(`\nPR #${number} - ${title} has CONFLICTS. Requesting changes...`);
                        const reviewBody = `Thanks for the contribution. I went through the changes and the overall approach looks good, but there are a few issues that should be addressed before this can be merged. Most of the concerns are related to correctness and maintainability.\n\n* There are merge conflicts with the base branch. Please resolve them to ensure existing functionality isn't broken.\n\nOnce these issues are addressed, I'll be happy to take another look. Thanks again for the contribution.`;
                        
                        fs.writeFileSync(`temp_review_${number}.txt`, reviewBody);
                        runCmd(`gh pr review ${number} --repo ${REPO} --request-changes --body-file temp_review_${number}.txt`);
                        console.log(`  -> Successfully requested changes on PR #${number}`);
                        fs.unlinkSync(`temp_review_${number}.txt`);
                    }
                    conflictsCount++;
                    break;
                } else if (mergeable !== 'UNKNOWN') {
                    break;
                }
            } catch(e) {}
        }
        
        // Wait 2 seconds before retrying if UNKNOWN
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
    }
}

console.log(`\nFinished checking conflicts. Processed ${prs.length} PRs. Found and handled ${conflictsCount} conflicting PRs.`);
