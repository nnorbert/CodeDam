# Video 03 — Statements & expressions (the basics)

| Field | Value |
| --- | --- |
| **Title** | Statements vs expressions — how CodeDam works |
| **Target length** | 80–95 seconds |
| **Goal** | Explain the two widget kinds, how to spot them, and the drop rules so building doesn’t feel “broken” |
| **Start URL** | `/playground` |
| **Series position** | After Hello World (Video 02), before Variables (Video 04) |
| **Tone** | Simple analogies; call out the rule that trips people up |

---

## Why this comes here

Viewers just built “Hello, Beavy!” — they already dropped a **plank** on the dam and a **slice** into a slot. Now explain *why* that worked, before they try bigger programs and get stuck dragging the wrong shape to the wrong place.

---

## Recording setup

- Open `/playground` (empty, or keep the Hello World program from Video 02)
- Desktop 1920×1080
- Open **Variables** (both shapes) and briefly **Operations** (slices only)
- Silent capture + AI voice
- Include one failed drop: drag a slice onto the empty dam — it should **not** accept — then drop it into a slot

---

## Visual cheat sheet (for the recorder)

| Kind | Looks like in the Workshop | Where it can go |
| --- | --- | --- |
| **Statement** | Rectangular **wood plank** | Onto the dam (“Drop planks here…”) — stacks as program steps |
| **Expression** | Round **wood slice** (log rings) | **Only** into expression slots (holes inside planks / other slices) — **not** onto the empty dam |

**Statements (planks):** Create Variable, Create Constant, Set Variable, If / If-Else, Repeat N, While Loop, User Output  

**Expressions (slices):** Use Value, Use Variable, math, comparisons, logic, Text Builder, User Input, …  

**Rules everybody needs:**

1. Expressions **return a value** (an answer: a number, text, true/false, …).
2. Statements **do a step** — they don’t return a value to plug in somewhere else.
3. **Only statements** can be dropped on the main droppable area.
4. **Expressions** go into **expression slots** — the empty places that need a value.

---

## On-screen text (optional captions)

1. `Two kinds of blocks`
2. `Planks = statements → drop on the dam`
3. `Slices = expressions → give a value`
4. `Slices only fit in slots — not on the empty dam`

---

## Shot list + narration

| Time | Action | Narration |
| --- | --- | --- |
| 0:00–0:10 | Playground. Optional: show leftover Hello World briefly, then clear or leave it. | You just built your first program. Now let’s learn how CodeDam’s blocks fit together — so the next ones feel easy, not confusing. |
| 0:10–0:25 | Open **Variables**. Point at Create Variable (plank) vs Use Value / Use Variable (slices). | There are two kinds of blocks. Rectangular wood planks, and round wood slices — like a cut from a tree. The shape tells you what each one is for. |
| 0:25–0:42 | Point at planks (Create Variable, then User Output). Gesture at the dam / “Drop planks here”. | Planks are statements. A statement is a step in your program — something that happens. Create a variable. Show a message. Statements do work. They don’t hand you back an answer. And here’s the key: only statements can be dropped onto the dam. |
| 0:42–1:00 | Point at slices. Try dragging **Use Value** onto the empty dam — show it doesn’t stick. Then point at an empty slot on a plank. | Slices are expressions. An expression’s job is to give you a value — a number, some text, true or false. Think of it as an answer to a tiny question. You can’t drop an expression onto the empty dam — the dam won’t take it. Expressions only go into the slots that need a value. |
| 1:00–1:15 | Drop a plank (e.g. User Output or Create Variable) on the dam, then drop Use Value into its slot. | So: plank on the dam — that’s your step. Slice into the slot — that’s the value the step needs. That’s how CodeDam is built. |
| 1:15–1:25 | Quick recap pointing: dam ← planks only; slots ← slices. | Remember: statements do something and stack on the dam. Expressions return something and fill the slots. Once that clicks, the Workshop makes sense. |

**Full narration (copy-paste for AI voice):**

> You just built your first program. Now let’s learn how CodeDam’s blocks fit together — so the next ones feel easy, not confusing. There are two kinds of blocks. Rectangular wood planks, and round wood slices — like a cut from a tree. The shape tells you what each one is for. Planks are statements. A statement is a step in your program — something that happens. Create a variable. Show a message. Statements do work. They don’t hand you back an answer. And here’s the key: only statements can be dropped onto the dam. Slices are expressions. An expression’s job is to give you a value — a number, some text, true or false. Think of it as an answer to a tiny question. You can’t drop an expression onto the empty dam — the dam won’t take it. Expressions only go into the slots that need a value. So: plank on the dam — that’s your step. Slice into the slot — that’s the value the step needs. That’s how CodeDam is built. Remember: statements do something and stack on the dam. Expressions return something and fill the slots. Once that clicks, the Workshop makes sense.

---

## End card / CTA

- Text: `Dam = planks · Slots = slices`
- Optional: `Next: Variables & constants`

---

## Production notes

- The failed drop (slice → empty dam) is worth 2–3 seconds of screen time — it teaches the rule better than words alone
- Keep the demo tiny; this video is about the mental model, not a new project
- Previous: `02-your-first-program.md` · Next: `04-variables-and-constants.md`
