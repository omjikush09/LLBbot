import fs from "fs";
import csv from "csv-parser";

function csvToText(csvFilePath, textFilePath) {
  const rows = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const values = Object.values(row);
      const line = values.join(" ");
      rows.push(line);
    })
    .on("end", () => {
      const textData = rows.join("\n");
      fs.writeFileSync(textFilePath, textData);
      console.log("Conversion completed successfully.");
    });
}

// Example usage
csvToText("input.csv", "output.txt");
