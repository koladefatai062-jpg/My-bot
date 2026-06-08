const warnings = {};
const blocked = new Set();

function warn(user) {
  if (blocked.has(user)) return { blocked: true, count: 3 };

  warnings[user] = (warnings[user] || 0) + 1;

  if (warnings[user] >= 3) {
    blocked.add(user);
    return { blocked: true, count: 3 };
  }

  return { blocked: false, count: warnings[user] };
}

function isBlocked(user) {
  return blocked.has(user);
}

function unblock(user) {
  blocked.delete(user);
  delete warnings[user];
}

function getWarnings(user) {
  return warnings[user] || 0;
}

module.exports = { warn, isBlocked, unblock, getWarnings };
