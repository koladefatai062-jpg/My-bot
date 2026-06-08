const last = {};

function spamCheck(user) {
  const now = Date.now();
  if (last[user] && now - last[user] < 3000) return true;
  last[user] = now;
  return false;
}

module.exports = spamCheck;
