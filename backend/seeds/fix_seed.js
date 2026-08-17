const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'plantSeed.js');
let content = fs.readFileSync(seedFile, 'utf8');

const mapping = {
    "Indoor": "Indoor & Outdoor",
    "Outdoor": "Indoor & Outdoor",
    "Bonsai": "Specialty Plants",
    "Succulent": "Specialty Plants",
    "Cactus": "Specialty Plants",
    "Orchid": "Specialty Plants",
    "Flowering": "Garden & Balcony",
    "Foliage": "Garden & Balcony",
    "Hanging Plant": "Garden & Balcony",
    "Climbing Plant": "Garden & Balcony",
    "Vegetable": "Kitchen Garden",
    "Fruit": "Kitchen Garden",
    "Herb": "Kitchen Garden",
    "Medicinal": "Kitchen Garden",
    "Seeds": "Kitchen Garden"
};

for (const [sub, group] of Object.entries(mapping)) {
    // Look for category: "sub" and add categoryGroup: "group" before it
    const regex = new RegExp(`(category:\\s*"${sub}",)`, 'g');
    content = content.replace(regex, `categoryGroup: "${group}",\n        $1`);
}

fs.writeFileSync(seedFile, content);
console.log("Updated plantSeed.js with categoryGroup!");
