---
name: pr-answer
description: Find review comments on a pull request that have not been answered yet, draft replies, and post them to GitHub clearly marked as written by Claude. Use when the user says "check the PR", "answer the PR comments", or asks for unaddressed review questions to be handled.
---

# Answering pull request review comments

Find review threads awaiting a response, draft answers, and post them to GitHub
with an unmistakable marker showing Claude wrote them.

## Why the marker is not optional

`gh` authenticates as the repository owner, so anything posted through it appears
under **their** GitHub account with their avatar. Without a marker, a reader —
including the user themselves, months later — cannot tell which replies a human
wrote and which a model wrote.

Every posted reply MUST begin with exactly this line, followed by a blank line:

```
> 🤖 **PRODUCED BY CLAUDE** — drafted by Claude Code and posted with the repository owner's token, not written by them.
```

Never post without it. Never reword it. It is also how step 3 recognises Claude's
own previous replies, so changing it breaks the skill.

## Steps

### 1. Identify the pull request

If the user names a number, use it. Otherwise take the PR for the current branch:

```bash
gh pr view --json number,title,headRefName -q '"#\(.number) \(.title) [\(.headRefName)]"'
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
```

If there is no PR for the branch, say so and stop.

### 2. Fetch every review thread with its full comment history

```bash
gh api graphql -f query='
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      reviewThreads(first:100) {
        nodes {
          isResolved
          isOutdated
          path
          line
          comments(first:50) {
            nodes { databaseId author { login } body }
          }
        }
      }
    }
  }
}' -F owner=OWNER -F repo=REPO -F pr=NUMBER
```

Also fetch conversation-level comments, which are not review threads:

```bash
gh pr view NUMBER --json comments -q '.comments[] | "\(.author.login): \(.body)"'
```

### 3. Select the threads that need an answer

A thread needs an answer when **both** hold:

- `isResolved` is `false`, **and**
- the **last** comment in the thread does **not** begin with the PRODUCED BY CLAUDE line.

The second condition is what prevents replying twice to the same question. Since
replies post under the owner's account, author name cannot be used to detect
them — only the marker can.

Skip a thread when:

- it is already resolved
- Claude's marked reply is already last and the human has not written since
- `isOutdated` is true **and** the comment refers to code that no longer exists —
  say so rather than answering about deleted code

If nothing needs an answer, report that plainly and stop. Do not invent work.

### 4. Draft the replies

Read the code the comment anchors to before answering. `path` and `line` are
given; open that file and read the surrounding context.

For each reply:

- Answer the actual question asked. Do not review adjacent code unprompted.
- Be concise. A comment thread is not a tutorial — a few short paragraphs.
- Quote the specific lines being discussed when it aids clarity.
- Explain *why* the code is the way it is, not just what it does. The user is
  learning; a reply that only restates the code teaches nothing.
- If the comment identifies a real problem, say so directly, and say what the
  fix would be. Do not defend the code.
- If unsure, say so. Never invent behaviour, APIs, or reasons.
- Never claim something was tested or verified unless it actually was in this
  session.

### 5. Show the drafts and get confirmation

Print every draft with its file and line, then ask the user to confirm before
posting. This is a public repository; posting is not reversible in any quiet way.

Skip the confirmation only if the user explicitly asked for it to be skipped
(for example `/pr-answer --post`).

### 6. Post

Reply into an existing thread using the `databaseId` of that thread's **first**
comment:

```bash
gh api -X POST "repos/$REPO/pulls/NUMBER/comments/COMMENT_ID/replies" \
  -f body="$(cat /path/to/draft.md)" -q .html_url
```

For a conversation-level comment:

```bash
gh pr comment NUMBER --body-file /path/to/draft.md
```

Write drafts to the scratchpad directory first. Never pass long markdown as an
inline shell string — backticks and quotes will break the command.

### 7. Report, and do not resolve

List each posted reply with its URL.

**Never resolve a thread.** Resolution is the reviewer's signal that they read
and accepted the answer. Resolving on their behalf would defeat the branch
protection rule requiring conversation resolution before merge, and would hide
answers they never saw.

Say clearly that the threads remain open for them to resolve.

## Reply template

```markdown
> 🤖 **PRODUCED BY CLAUDE** — drafted by Claude Code and posted with the repository owner's token, not written by them.

<the answer>
```
