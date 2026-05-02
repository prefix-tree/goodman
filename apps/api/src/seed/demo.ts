import { ObjectId } from "mongodb";
import { connectDb } from "../db.js";
import { applySchema } from "../schema.js";
import {
  usersCollection,
  transcriptSegmentsCollection,
} from "../entities/index.js";
import { caseStateService } from "../case/state.js";

async function seed() {
  await connectDb();
  await applySchema();

  console.log("Seeding demo data...");

  // 1. Create demo user
  const userId = new ObjectId();
  const now = new Date();

  await usersCollection().deleteMany({ email: "sarah@demo.sol.ai" });
  await usersCollection().insertOne({
    _id: userId,
    email: "sarah@demo.sol.ai",
    name: "Sarah",
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  User: Sarah (${userId.toHexString()})`);

  // 2. Create case with immigration playbook
  const caseDoc = await caseStateService.createCase(
    userId.toHexString(),
    "immigration",
  );
  const caseId = caseDoc._id.toHexString();
  console.log(`  Case: ${caseDoc.title} (${caseId})`);

  // 3. Add transcript segments
  const segments = [
    { speaker: "agent" as const, text: "Hello Sarah! What is your nationality?" },
    {
      speaker: "user" as const,
      text: "I want to visit my sister in London but I had a visa refusal last year",
    },
    {
      speaker: "agent" as const,
      text: "I understand. Can you tell me what type of visa you were applying for?",
    },
  ];

  for (const seg of segments) {
    await transcriptSegmentsCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(caseId),
      speaker: seg.speaker,
      text: seg.text,
      isFinal: true,
      createdAt: now,
    });
  }
  console.log(`  Transcript: ${segments.length} segments`);

  // 4. Process facts from the user's statement
  const result = await caseStateService.processAndUpdate(caseId, {
    travel_purpose: "visit sister",
    host_relationship: "sister",
    previous_refusal: "yes, last year",
  });

  if (result) {
    console.log(`  Facts: ${Object.keys(result.facts).length}`);
    console.log(`  Risks: ${result.risks.length}`);
    console.log(`  Completion: ${result.completion}%`);
    console.log(
      `  Next question: ${result.nextQuestion?.question ?? "none"}`,
    );
  }

  console.log("\nSeed complete.");
  console.log(`\nUser ID: ${userId.toHexString()}`);
  console.log(`Case ID: ${caseId}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
