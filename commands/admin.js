const banned = new Set();
const { unblock } = require("../utils/stickerWarnings");

function handle(args) {
  const [action, target] = args;

  if (!action) {
    return (
      "🛠️ *Admin Commands:*\n\n" +
      "• kola admin ban <number>\n" +
      "• kola admin unban <number>\n" +
      "• kola admin list\n" +
      "• kola admin unblock <number> — unblock sticker-blocked user"
    );
  }

  if (action === "ban") {
    if (!target) return "❓ Usage: kola admin ban <number>";
    banned.add(target);
    return `✅ Banned: ${target}`;
  }

  if (action === "unban") {
    if (!target) return "❓ Usage: kola admin unban <number>";
    if (!banned.has(target)) return `⚠️ ${target} is not banned.`;
    banned.delete(target);
    return `✅ Unbanned: ${target}`;
  }

  if (action === "list") {
    if (banned.size === 0) return "📋 No banned users.";
    return `📋 Banned users:\n${[...banned].join("\n")}`;
  }

  if (action === "unblock") {
    if (!target) return "❓ Usage: kola admin unblock <number>";
    unblock(target);
    return `✅ Unblocked sticker warning for: ${target}`;
  }

  return `❓ Unknown action: ${action}`;
}

function isBanned(sender) {
  const number = sender.replace("@s.whatsapp.net", "");
  return banned.has(number);
}

module.exports = { handle, isBanned };
