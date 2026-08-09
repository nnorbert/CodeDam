# Video 06 — Loops (Repeat N / While)

| Field | Value |
| --- | --- |
| **Title** | Loops in CodeDam — repeat without copy-paste |
| **Target length** | 80–100 seconds |
| **Goal** | Show that loops run the same blocks multiple times, and that Repeat N gives you a free `index` |
| **Start URL** | `/playground` (empty) |
| **Demo result** | Output shows the current index each time (e.g. 0, 1, 2) |
| **Tone** | Energetic; “do it three times” is concrete |

---

## Recording setup

- Empty playground
- Desktop 1920×1080
- Silent capture + AI voice
- Prefer **Repeat N** as the main demo (easier than While for beginners)

---

## What you will build

Main demo (Repeat N):

```
Repeat N
  count: Use Value → number 3
  body:  User Output → Use Variable(index)   // index is auto-created — not from the Workshop
```

The block label reads **“Repeat … times using index”** — that `index` is created for you inside the loop (starts at 0).

Optional second beat (While) — keep short or skip if time is tight:

```
Create Variable → count = 0
While Loop
  condition: count < 3
  body:
    User Output → "Tick"
    Set Variable → count = count + 1   (needs Use Variable + Addition + Use Value)
```

**Recommendation:** film only Repeat N for a clean 90s video; mention While in narration as “also in Loops.”

---

## On-screen text (optional captions)

1. `Loops = do this again`
2. `Repeat N → exact number of times`
3. `index is free — use it inside the loop`
4. `While → keep going while true`

---

## Shot list + narration

| Time | Action | Narration |
| --- | --- | --- |
| 0:00–0:08 | Open **Loops**. Hover **Repeat N** and **While Loop**. | Sometimes you want the same steps more than once. That’s what loops are for. |
| 0:08–0:20 | Drag **Repeat N** onto the dam. Drop **Use Value** number `3` into the count slot. Point at **“using index”** on the block. | Repeat N runs its blocks a set number of times. We’ll repeat three times. Notice it already says “using index” — CodeDam creates that variable for you. You don’t drag it from the Workshop. |
| 0:20–0:40 | Inside the loop body: **User Output** → **Use Variable**, pick **index**. | Inside the loop, show the index. Drop User Output, then Use Variable, and choose index. |
| 0:40–0:55 | Point at Code Preview briefly. | Check the Code Preview — you’ll see the loop and index in JavaScript or Python. |
| 0:55–1:15 | Hit **Play**. Show outputs `0`, then `1`, then `2`. | Hit Play. Index starts at zero, then one, then two — one number per repeat. Handy when each turn needs to know “which time is this?” |
| 1:15–1:25 | Hover **While Loop** briefly without building it. | When you’re ready for a challenge, try While Loop — it keeps going as long as a condition stays true. |

**Full narration (copy-paste for AI voice):**

> Sometimes you want the same steps more than once. That’s what loops are for. Repeat N runs its blocks a set number of times. We’ll repeat three times. Notice it already says “using index” — CodeDam creates that variable for you. You don’t drag it from the Workshop. Inside the loop, show the index. Drop User Output, then Use Variable, and choose index. Check the Code Preview — you’ll see the loop and index in JavaScript or Python. Hit Play. Index starts at zero, then one, then two — one number per repeat. Handy when each turn needs to know “which time is this?” When you’re ready for a challenge, try While Loop — it keeps going as long as a condition stays true.

---

## End card / CTA

- Text: `Repeat N · index is automatic`
- Optional: `Next: Save & load your project`

---

## Production notes

- Pause on each output so `0 → 1 → 2` is obvious (index is zero-based)
- Make clear that `index` only exists **inside** the Repeat N body
- Previous: `05-decisions.md` · Next: `07-save-and-load.md`
