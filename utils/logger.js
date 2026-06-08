const fs = require("fs");

function log(data) {
  try {
    fs.appendFileSync("./logs/chat.json", JSON.stringify(data) + "\n");
  } catch (err) {
    console.error("Logger error:", err.message);
  }
}

module.exports = log;
