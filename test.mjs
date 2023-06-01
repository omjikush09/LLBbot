import * as fs from "fs"

const text = fs.readFileSync(
    "HMIS-Madhya_Pradesh-East_Nimar-Apr-2021-22.csv",
    "utf8"
  );

console.log(text)