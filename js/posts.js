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
    date: "March 2025",
    type: "idea",
    description: `I'm watching Twin Peaks. Shitting my pants.`,
    tags: ["summer", "season", "anticipation"],
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
    title: "ენაცვალოს ჩემი ძუძუნი",
    date: "January 2025",
    type: "idea",
    description: `ენაცვალოს ჩემი ძუძუნი
მწყემსის, გარაის ყლესაო,
აეგრე დასჩვრეტს საოხრეს,
როგორც "ბერდენკა" ხესაო,
მეხი კი ჩამოვათხლიშე
ინტელიგენტის ყლესაო,
მიადებს, მეებრიცება,
თან მიაშველებს ხელსაო,
ბოლოს ბოდიშსაც მაიხდის:
- ლექცია მქონდა დღესაო..`,
    tags: ["მუტელი"],
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
