const fs = require("fs-extra");
const { Parser } = require("json2csv");
const path = require("path");

// Path to your data.json
const dataFile = "./lib/data.json";

// Output folder
const outputFolder = "./csv-output";

async function convertData() {
  try {
    // Ensure output folder exists
    await fs.ensureDir(outputFolder);

    // Read JSON file
    const rawData = await fs.readFile(dataFile, "utf8");

    // Parse JSON
    const data = JSON.parse(rawData);

    // Convert each collection separately
    for (const key in data) {
      const collection = data[key];

      // Only process arrays
      if (Array.isArray(collection)) {
        const parser = new Parser();

        const csv = parser.parse(collection);

        const outputPath = path.join(
          outputFolder,
          `${key}.csv`
        );

        await fs.writeFile(outputPath, csv);

        console.log(`✅ Converted ${key}.csv`);
      }
    }

    console.log("\n🎉 ALL DATA CONVERTED SUCCESSFULLY");
  } catch (error) {
    console.error("❌ Conversion failed:", error);
  }
}

convertData();