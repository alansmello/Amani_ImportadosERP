# Issue tracker: GitHub

Engineering skills track tasks in GitHub Issues for
alansmello/Amani_ImportadosERP. Use the gh CLI.

Existing SpecKit artifacts remain under specs/ and retain their
workflow and approval requirements. Link relevant artifacts from issues.

## Operations

- Create: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --comments
- List: gh issue list --state open --json number,title,body,labels
- Comment: gh issue comment <number> --body-file <file>
- Add labels: gh issue edit <number> --add-label "..."
- Remove labels: gh issue edit <number> --remove-label "..."
- Close: gh issue close <number>

Use UTF-8 files for multiline bodies. Infer the repository from origin;
outside the clone, pass --repo alansmello/Amani_ImportadosERP.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill conventions

“Publish to the issue tracker” means create a GitHub issue.
“Fetch the relevant ticket” means read the issue and its comments.
These conventions do not independently authorize publication or messages.

## Wayfinding

- The map is an issue labelled wayfinder:map.
- Link child tickets as GitHub sub-issues. If unavailable, use a task
  list in the map and a “Part of #<map>” reference in each child.
- Use wayfinder:research, wayfinder:prototype, wayfinder:grilling,
  or wayfinder:task labels for child tickets.
- Record blockers using native issue dependencies where supported.
  Otherwise, add “Blocked by: #<number>” references.
- The frontier is the first open, unassigned child in map order
  whose blockers are all closed.
- Claim a ticket by assigning it to the driving developer.
- On resolution, record the result, close the ticket, and update
  the map with the decision and a link.
