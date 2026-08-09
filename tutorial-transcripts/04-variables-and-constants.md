# Video 04 — Variables and constants

| Field | Value |
| --- | --- |
| **Title** | Variables & constants in CodeDam |
| **Target length** | 80–100 seconds |
| **Goal** | Show creating a variable, a constant, using them, and updating a variable |
| **Start URL** | `/playground` (empty) |
| **Demo result** | Output shows a number that changed (e.g. score goes from 0 to 10) |
| **Tone** | Clear teaching; one idea at a time |

---

## Recording setup

- Empty playground
- Desktop 1920×1080
- Silent capture + AI voice

---

## What you will build

```
Create Variable   name: score   value: 0   (Use Value → number 0)
Create Constant   name: points  value: 10  (Use Value → number 10)
Set Variable      score ← Use Variable(points)   OR score ← Use Value(10)
User Output       Use Variable(score)
```

Simpler recommended flow (easier to follow on camera):

```
1. Create Variable  → score = 0
2. Set Variable     → score = 10   (Use Value number)
3. User Output      → Use Variable(score)
```

Then briefly show **Create Constant** as a second, shorter beat.

---

## On-screen text (optional captions)

1. `Variables store values that can change`
2. `Constants stay the same`
3. `Create → Set → Show`

---

## Shot list + narration

| Time | Action | Narration |
| --- | --- | --- |
| 0:00–0:10 | Open **Variables** category. Hover Create Variable / Create Constant. | Variables and constants are how programs remember things. A variable can change. A constant stays the same. |
| 0:10–0:30 | Drag **Create Variable** to the canvas. Configure name `score`. Drop **Use Value** into its value slot → Number `0`. | Let’s create a variable called score, and start it at zero. |
| 0:30–0:50 | Drag **Set Variable** below it. Configure it to target `score`. Drop **Use Value** with Number `10` into the set slot. | Now change it. Use Set Variable to update score to ten. |
| 0:50–1:05 | Drag **User Output**. Drop **Use Variable**, select `score`. | To show the value, use User Output with Use Variable pointed at score. |
| 1:05–1:20 | Hit **Play**. Show output `10`. Point briefly at Variable Stack / Code Preview if visible during run. | Hit Play — score is ten. Watch how the code preview mirrors what you built. |
| 1:20–1:35 | Clear or scroll; quickly drop **Create Constant**, name `points`, value `10`. Do not need a full second program. | Constants work the same way to create — but you don’t change them later. Use them for values that should stay fixed, like points or a max lives count. |

**Full narration (copy-paste for AI voice):**

> Variables and constants are how programs remember things. A variable can change. A constant stays the same. Let’s create a variable called score, and start it at zero. Now change it. Use Set Variable to update score to ten. To show the value, use User Output with Use Variable pointed at score. Hit Play — score is ten. Watch how the code preview mirrors what you built. Constants work the same way to create — but you don’t change them later. Use them for values that should stay fixed, like points or a max lives count.

---

## End card / CTA

- Text: `Remember: Create → Set → Use`
- Optional: `Next: Decisions with If`

---

## Production notes

- Name variables clearly (`score`, `points`) — readable in the UI
- If the configure modal is small on screen, zoom browser to 110% for that shot only
- Previous: `03-statements-and-expressions.md` · Next: `05-decisions.md`
