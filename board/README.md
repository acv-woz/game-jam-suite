# Game Jam Board (source snapshot)

`index.html` is the source for the live, shared brainstorming board:

**https://claude.ai/artifact/2zow4XXrz3z93xAvcRYF4q**

That live page is a Claude Artifact with its own shared database
(pitches, votes) — this file is a version-controlled snapshot of its
HTML/CSS/JS for history and backup, not something served from here.

## Keeping this in sync

Editing this file does **not** update the live board. To ship a
change:

1. Edit `index.html` here (or ask Claude to).
2. Publish it to the artifact URL above (Claude does this via the
   Artifact tool, republishing to the same URL).
3. Commit the same change here so the repo matches what's live.

The board's data (ideas, votes, specs) lives in the artifact's own
database, not in this repo, and isn't captured by this snapshot.
