# Activation Prompt

## Step 1 — Update CLAUDE.md (one-time)

Open `CLAUDE.md` in the project root and append the entire contents of `AUTONOMY_CHARTER.md` to the end of it. Save.

(Or just delete the existing CLAUDE.md and replace with one combined file — your choice.)

## Step 2 — Rotate Leaked Secrets (10 min, do this yourself)

Before activating Claude Code, rotate the secrets that were exposed in the audit:

1. **Supabase anon key**: Dashboard → Settings → API → "Reset publishable key" → update `.env.local`
2. **JWT_SECRET**: terminal → `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` → paste into `.env.local`
3. **MSG91 auth key**: MSG91 dashboard → API keys → regenerate → update `.env.local`
4. **Sanitize `.env.example`**: replace all real values with placeholders like `your_key_here`

## Step 3 — Fire This Prompt to Claude Code

Paste this into your Claude Code session:

```
The CLAUDE.md has been updated with an Operating Charter that grants you 
full autonomous engineering authority for this project going forward.

Read CLAUDE.md completely (including the new Operating Charter section).

Then take ownership of the entire roadmap:

1. Confirm you understand your authority, the escalation triggers, the 
   roadmap, the quality bar, and the working rhythm
2. Tell me what credentials and decisions you need from me upfront so I 
   can provide them once and let you run autonomously through Phase A 
   and Phase B
3. Propose the execution plan for Phase A (Foundation Lockdown) — show 
   me the order you'll tackle the 16 sub-tasks, your time estimate for 
   each, and any risks you foresee
4. Wait for my "go" on the plan before you start writing code

I have already rotated the leaked secrets (Supabase anon key, JWT_SECRET, 
MSG91 auth key) and sanitized .env.example. 

After I approve your Phase A plan, you have full authority to execute it 
end-to-end, commit as you go, and only pause if you hit one of the 
escalation triggers in the Operating Charter.

Once Phase A is complete, send me the phase report (per the format in the 
charter) and immediately propose Phase B's plan. I'll approve and you'll 
proceed. We will continue this rhythm — plan → approve → execute → report 
— for each phase until launch.

Begin.
```

## Step 4 — What to Expect

After firing this prompt, Claude Code will:

1. Read updated CLAUDE.md and confirm understanding
2. Send you a list of credentials it needs (MSG91 details, etc.)
3. Send you a Phase A execution plan
4. Wait for your "go"
5. Once approved, execute Phase A autonomously — possibly 2-3 hours of agent work
6. Commit each major piece to git
7. Send a Phase A completion report
8. Immediately propose Phase B
9. You approve, it executes, repeats

## Your Role Going Forward

You are now the **Product Owner**, not the Project Manager. You will:

- Approve phase plans (mostly with "go" or with minor course corrections)
- Provide credentials when Claude Code requests them
- Test the product manually as a regular user after each phase
- Make business decisions when escalated (pricing, feature priorities, etc.)
- Read the phase reports and confirm you understand what shipped

You do NOT need to:

- Translate prompts back and forth
- Generate technical instructions
- Decide on libraries or tech approach
- Track which file does what

This saves you tokens on both sides and lets Claude Code use its full agentic capability.

## When to Loop Me Back In

Talk to me again if:

- A phase report confuses you and you want it explained
- Claude Code asks for a business decision you're unsure about
- You hit an issue Claude Code can't solve and want a second opinion
- You want to add features beyond the current roadmap
- You want a UI/UX review at any point
- Anything feels off product-wise

Otherwise, let Claude Code drive. That's the point of giving it autonomy.

## Important: Trust But Verify

Claude Code will be honest in reports (the audit you just saw proves this), but always:

- Test critical user flows yourself after each phase
- Spot-check the actual app in browser, not just trust the report
- If something feels broken or wrong, tell Claude Code immediately
- Keep an eye on git commits — if you see something that worries you, ask
