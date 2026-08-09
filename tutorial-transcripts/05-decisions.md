# Video 05 — Decisions (If / If-Else)

| Field | Value |
| --- | --- |
| **Title** | Make decisions with If in CodeDam |
| **Target length** | 80–100 seconds |
| **Goal** | Teach branching: if a condition is true, do one thing (else, another) |
| **Start URL** | `/playground` (empty) |
| **Demo result** | Output message depends on a number (e.g. age ≥ 10 → “You can play!”) |
| **Tone** | Story-like example kids understand |

---

## Recording setup

- Empty playground
- Desktop 1920×1080
- Silent capture + AI voice

---

## What you will build

Recommended demo:

```
Create Variable  → age = 12   (Use Value number)
If-Else Decision
  condition:  age ≥ 10   (Greater or Equal + Use Variable(age) + Use Value(10))
  then:       User Output → "You can play!"
  else:       User Output → "Ask a grown-up first."
```

Simpler alternative (If only):

```
Create Variable → age = 12
If Decision
  condition: age > 10
  then: User Output → "Big enough!"
```

Prefer **If-Else** for a clearer “two paths” lesson.

---

## On-screen text (optional captions)

1. `Ask a question`
2. `If yes → do this`
3. `If no → do that`
4. `Change the value and run again`

---

## Shot list + narration

| Time | Action | Narration |
| --- | --- | --- |
| 0:00–0:10 | Empty playground; open **Decisions**. Hover If / If-Else. | Programs make choices. In CodeDam, that’s Decisions — If, and If-Else. |
| 0:10–0:25 | Create variable `age` = `12` (Create Variable + Use Value number). | First, store a value to check. We’ll call it age and set it to twelve. |
| 0:25–0:45 | Drag **If-Else Decision** below. Open **Comparisons**. Drop **≥** into the condition slot. Fill left with **Use Variable(age)**, right with **Use Value(10)**. | Now drop If-Else. For the condition, use Greater or Equal: is age at least ten? |
| 0:45–1:05 | In the **then** branch: User Output + Use Value text `You can play!`. In the **else** branch: User Output + Use Value text `Ask a grown-up first.` | If that’s true, show “You can play!” Otherwise, show “Ask a grown-up first.” |
| 1:05–1:20 | Hit **Play**. Show the then-path message. | Hit Play. Age is twelve — so we take the first path. |
| 1:20–1:35 | Optionally change age to `8` via Set Variable or reconfigure, Play again, show else message. | Change age to eight and run again — now the other path runs. That’s how decisions work. |

**Full narration (copy-paste for AI voice):**

> Programs make choices. In CodeDam, that’s Decisions — If, and If-Else. First, store a value to check. We’ll call it age and set it to twelve. Now drop If-Else. For the condition, use Greater or Equal: is age at least ten? If that’s true, show “You can play!” Otherwise, show “Ask a grown-up first.” Hit Play. Age is twelve — so we take the first path. Change age to eight and run again — now the other path runs. That’s how decisions work.

---

## End card / CTA

- Text: `True path · False path`
- Optional: `Next: Loops`

---

## Production notes

- Nested drops are the hardest part on camera — go slow; zoom if needed
- Categories: Variables, Decisions, Comparisons, Interactions
- Previous: `04-variables-and-constants.md` · Next: `06-loops.md`
