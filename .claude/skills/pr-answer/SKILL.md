---
name: pr-answer
description: Answer unaddressed review comments on a pull request and post the replies to GitHub, marked as Claude-written. Use for "check the PR" or "answer the PR comments".
---

# Answer PR review comments

Every reply opens with this exact title line, then a blank line, then the answer:

```
🤖 **PRODUCED BY CLAUDE**

<the answer>
```

`gh` posts under the owner's account, so this is the only thing separating a
generated reply from a written one. Step 2 also matches on it to avoid answering
twice. Never reword it.

## Steps

1. **Fetch threads** for the current branch's PR:

   ```bash
   gh api graphql -f query='query($o:String!,$r:String!,$p:Int!){repository(owner:$o,name:$r){pullRequest(number:$p){reviewThreads(first:100){nodes{isResolved path line comments(first:50){nodes{databaseId body}}}}}}}' -F o=OWNER -F r=REPO -F p=NUM
   ```

2. **Select** threads where `isResolved` is false and the last comment lacks the
   marker. If none, say so and stop.

3. **Draft.** Read the code at `path:line` first. Answer only what was asked, in
   a few short paragraphs. Explain why, not just what. Admit uncertainty. If the
   comment finds a real problem, say so instead of defending the code.

4. **Confirm.** Show the drafts and wait. Skip only if invoked with `--post`.

5. **Post** to the thread's first comment id:

   ```bash
   gh api -X POST "repos/$REPO/pulls/NUM/comments/$ID/replies" -f body="$(cat draft.md)" -q .html_url
   ```

6. **Report the URLs. Never resolve a thread** — that is the reviewer's signal
   that they read the answer.
