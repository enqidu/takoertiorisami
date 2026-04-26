/* ═══════════════════════════════════════════════════════════════
   POSTS DATA
   Add a new post: paste a block at the TOP of this array.
   Images go in /images. Set type: "idea" for a text-only card.

   FUZZY BREAKS BETWEEN POSTS — control the little creatures + notes:
     - Global pools (optional): paste above `window.POSTS =`:
         window.TWEEN_NOTES  = ["my note", "აქ მიყვარს ყოფნა", "..."];
         window.TWEEN_MOODS  = ["shy", "happy", "cozy"];
         window.TWEEN_COLORS = ["var(--grape)", "var(--tomato)"];
     - Per-post (goes on the post object):
         tween: false                                    → no break after this post
         tween: "აქ მიყვარს ყოფნა"                        → force this note
         tween: { note: "...", mood: "shy", color: "var(--grape)" }
   ═══════════════════════════════════════════════════════════════ */

window.POSTS = [
  {
    title: "Underground Poster Series — Arcane",
    date: "April 2026",
    description: `posters set in the world of arcane (netflix / league of legends) — each one made to be pasted on the walls of the undercity. character details and typography drawn pen-tool by hand.`,
    tags: ["graphic design", "poster", "illustration", "fan art"],
    images: ["images/arcane-1.webp", "images/arcane-2.webp", "images/arcane-3.webp", "images/arcane-4.webp"],
  },
  {
    title: "The Shoes Off Campaign",
    date: "March 2026",
    description: `posters for a small household problem — shoe trails after every hangout. solved with quirky slippers from temu, offered to guests on arrival. inspired by asian graphic design.`,
    tags: ["graphic design", "poster", "campaign"],
    images: ["images/shoes-off-1.webp", "images/shoes-off-2.webp", "images/shoes-off-3.webp"],
  },
  {
    title: "Trois Couleurs",
    date: "March 2026",
    description: ``,
    tags: ["creatures"],
    images: ["images/Trois couleurs.jpeg"],
  },
  {
    title: "Thailand",
    date: "March 22 2026",
    description: `ThaiThaiThaiThaiThaThaiThaiThaiThaiThai`,
    tags: ["creatures"],
    images: ["images/thailand.jpg"],
  },
  {
    title: "",
    date: "April 2026",
    type: "idea",
    description: `watching twin peaks for the first time. the red room won't leave.`,
    tags: ["notes", "watching"],
    images: [],
  },
  {
    title: "Three Monkeys",
    date: "March 2026",
    description: `Drawn in Dachi's house while listening to Public Enemy and watching documentary about Manosphere`,
    tags: ["creatures"],
    images: ["images/three monkeys.png"],
  },
  {
    title: "Pumpkin Head",
    date: "March 2025",
    description: `ეს დავხატე როდესაც მინდოდა მეჭამა გოგრის სუპი.`,
    tags: ["creatures"],
    images: ["images/pumpkin.png"],
    placeholder: "pumpkin",
  },
  {
    title: "Virtxa",
    date: "February 2026",
    description: `virtxa virtxa`,
    tags: ["creatures"],
    images: ["images/virtxa.png"],
  },
  {
    title: "Mrs Peanut Butter — Brand Identity",
    date: "October 2025",
    description: `fictional brand identity for a peanut butter company built on three ingredients: roasted nuts, olive oil, salt. a dog mascot, classy-with-a-twist, packaging and illustration.`,
    tags: ["graphic design", "brand identity", "packaging"],
    images: ["images/mrs-peanut-1.webp", "images/mrs-peanut-2.webp", "images/mrs-peanut-3.webp"],
  },
  {
    title: "",
    date: "March 2025",
    type: "idea",
    description: `Its about to be summer.`,
    tags: ["summer", "season", "anticipation"],
    images: [],
  },
  {
    title: "Pink Creature",
    date: "February 2025",
    description: `ვარდისფერია ძმა.`,
    tags: ["Pink", "Close"],
    images: ["images/pink.png", "images/pink2.png"],
    placeholder: "creature",
  },
  {
    title: "",
    date: "April 2026",
    type: "idea",
    description: `currently sketching with andrew loomis. heads as soft little eggs, hands like polite families. relearning how to look.`,
    tags: ["notes", "sketching", "loomis"],
    images: [],
  },
  {
    title: "გრიდი))",
    date: "December 2024",
    description: `გრიდი სადაც დავჩხარტე ჭყურტები `,
    tags: ["canvas", "acrylic", "ensemble", "creatures"],
    images: ["images/grid.png"],
    placeholder: "eyes",
  },
  {
    title: "Hospital",
    date: "October 2024",
    type: "idea",
    description: `When you get out of the hospital
Let me back into your life
I can't stand what you do
I'm in love with your eyes

And when you get out of the dating bar
I'll be here to get back into your life
I can't stand what you do
I'm in love with your eyes `,
    tags: ["Jonathan Richman", "teeth"],
    images: [],
  },
];
