const { execSync } = require('child_process');
const prs = JSON.parse(execSync('gh pr list --state open --limit 100 --json number,body').toString());
prs.forEach(pr => {
    const match = pr.body.match(/(?:fixes|closes|resolves)\s*#(\d+)/i);
    if (match) {
        const issueNumber = match[1];
        console.log(`PR ${pr.number} is linked to Issue ${issueNumber}`);
        try {
            const issueJson = execSync(`gh issue view ${issueNumber} --json labels`).toString();
            const issueData = JSON.parse(issueJson);
            const labels = issueData.labels.map(l => l.name).join(',');
            if (labels) {
                console.log(`Adding labels ${labels} to PR ${pr.number}`);
                execSync(`gh pr edit ${pr.number} --add-label "${labels}"`);
            }
        } catch (e) {
            console.error(`Failed to fetch/apply labels for issue ${issueNumber}`);
        }
    } else {
        console.log(`PR ${pr.number} has no linked issue`);
    }
});
