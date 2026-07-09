import { generateChapterContent } from "./src/services/groq.service";

async function run() {
  try {
    const res = await generateChapterContent("guitar", "beginner", "Introduction to Chords", "Learn the basic open chords A, D, and E.");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.log("Caught Error:", e);
  }
}
run();
