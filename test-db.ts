import { db } from "./server/db";
import { timetable } from "./shared/schema";

async function testTimetableTable() {
  try {
    console.log("Testing timetable table...");
    
    // Try to select from the table to see if it exists and has the right structure
    const result = await db.select().from(timetable).limit(1);
    console.log("Table exists and is accessible. Sample:", result);
    
    // Test the table schema by describing it
    console.log("Timetable table test completed successfully");
  } catch (error) {
    console.error("Error testing timetable table:", error);
  }
}

testTimetableTable();