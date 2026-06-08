const fs = require("fs");
const path = "./logs/usernames.json";

function load() {
  try {
    if (!fs.existsSync(path)) return {};
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch { return {}; }
}

function save(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function getUsername(number) {
  const data = load();
  return data[number] || null;
}

function setUsername(number, name) {
  const data = load();
  data[number] = name;
  save(data);
}

function hasUsername(number) {
  return !!getUsername(number);
}

module.exports = { getUsername, setUsername, hasUsername };
