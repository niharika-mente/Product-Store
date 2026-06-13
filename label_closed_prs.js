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

console.log(`Fetching closed PRs for ${REPO}...`);
const prsJson = runCmd(`gh pr list --repo ${REPO} --limit 100 --state closed --search "is:pr is:closed -label:mentor:Aamod007" --json number,title,body,labels`);
if (!prsJson) {
    console.error("Failed to fetch PRs.");
    process.exit(1);
}
const prs = JSON.parse(prsJson);

let processedCount = 0;

for (const pr of prs) {
    const { number, title, body, labels: existingLabelsObj } = pr;
    console.log(`\nLabeling closed PR #${number} - ${title}`);
    
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

    // Determine type labels
    let typeLabels = [];
    if (titleLower.includes('fix') || titleLower.includes('bug')) typeLabels.push('type:bug');
    if (titleLower.includes('feat') || titleLower.includes('add') || titleLower.includes('implement')) typeLabels.push('type:feature');
    if (titleLower.includes('doc') || titleLower.includes('readme') || titleLower.includes('comment')) typeLabels.push('type:docs');
    if (titleLower.includes('test') || titleLower.includes('coverage') || titleLower.includes('spec') || titleLower.includes('theme-contrast')) typeLabels.push('type:testing');
    if (titleLower.includes('refactor') || titleLower.includes('restructure')) typeLabels.push('type:refactor');
    if (titleLower.includes('ui') || titleLower.includes('design') || titleLower.includes('css') || titleLower.includes('style') || titleLower.includes('visual')) typeLabels.push('type:design');
    if (titleLower.includes('a11y') || titleLower.includes('accessibility') || titleLower.includes('aria')) typeLabels.push('type:accessibility');
    if (titleLower.includes('perf') || titleLower.includes('performance') || titleLower.includes('optimize') || titleLower.includes('speed')) typeLabels.push('type:performance');
    if (titleLower.includes('ci') || titleLower.includes('cd') || titleLower.includes('docker') || titleLower.includes('action') || titleLower.includes('devops')) typeLabels.push('type:devops');
    if (titleLower.includes('security') || titleLower.includes('vuln') || titleLower.includes('xss') || titleLower.includes('csrf') || titleLower.includes('injection')) typeLabels.push('type:security');

    if (typeLabels.length === 0) {
        if (diffLower.includes('test(') || titleLower.includes('test:')) typeLabels.push('type:testing');
        else typeLabels.push('type:feature');
    }

    let difficultyLabel = 'level:beginner';
    const isCritical = typeLabels.includes('type:security') || 
                       titleLower.includes('auth') || 
                       titleLower.includes('database') || 
                       titleLower.includes('payment') || 
                       titleLower.includes('migration') ||
                       diffLower.includes('create table') ||
                       diffLower.includes('passport');
                       
    const isAdvanced = typeLabels.includes('type:performance') || 
                       titleLower.includes('architecture') || 
                       titleLower.includes('core logic') || 
                       titleLower.includes('complex') ||
                       (filesChangedCount >= 5 && diffLines.length > 300);

    const isIntermediate = filesChangedCount > 1 || 
                           titleLower.includes('validation') || 
                           titleLower.includes('component') ||
                           titleLower.includes('migrate') ||
                           diffLines.length > 50;
                           
    if (isCritical) {
        difficultyLabel = 'level:critical';
    } else if (isAdvanced) {
        difficultyLabel = 'level:advanced';
    } else if (isIntermediate) {
        difficultyLabel = 'level:intermediate';
    }

    let qualityLabel = 'quality:clean';
    if (diff.includes('console.log') || diff.includes('debugger') || diff.includes('// TODO')) {
        qualityLabel = '';
    }

    if (qualityLabel === 'quality:clean') {
        if ((typeLabels.includes('type:feature') || typeLabels.includes('type:bug')) && typeLabels.includes('type:testing')) {
            qualityLabel = 'quality:exceptional';
        } else if (difficultyLabel === 'level:advanced' && typeLabels.includes('type:refactor')) {
            qualityLabel = 'quality:exceptional';
        }
    }

    // Clean existing level labels
    const existingLabels = (existingLabelsObj || []).map(l => l.name);
    const oldLevelLabels = existingLabels.filter(l => l.startsWith('level:') && l !== difficultyLabel);
    
    if (oldLevelLabels.length > 0) {
        runCmd(`gh pr edit ${number} --repo ${REPO} --remove-label "${oldLevelLabels.join(',')}"`);
    }

    let labels = ["mentor:Aamod007", difficultyLabel];
    if (qualityLabel) labels.push(qualityLabel);
    labels = labels.concat(typeLabels);
    labels = [...new Set(labels)];

    runCmd(`gh pr edit ${number} --repo ${REPO} --add-label "${labels.join(',')}"`);
    console.log(`  -> Applied labels: ${labels.join(', ')}`);
    processedCount++;
}

console.log(`\nFinished processing! Successfully labeled ${processedCount} closed PRs in ${REPO}.`);
