const { execSync } = require('child_process');

const threads = [
  'PRRT_kwDOOzjpks6I7TIi',
  'PRRT_kwDOOzjpks6I7TJI',
  'PRRT_kwDOOzjpks6I7TJf',
  'PRRT_kwDOOzjpks6I7TJ_',
  'PRRT_kwDOOzjpks6I7TKR',
  'PRRT_kwDOOzjpks6I7TKw'
];

for (const id of threads) {
  const query = `mutation { resolveReviewThread(input: {threadId: "${id}"}) { thread { isResolved } } }`;
  console.log(`Resolving ${id}...`);
  try {
    const out = execSync(`gh api graphql -f query='${query}'`).toString();
    console.log(out);
  } catch (err) {
    console.error(err);
  }
}
