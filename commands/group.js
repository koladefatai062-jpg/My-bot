async function handle(sock, msg, cmd, args, senderNumber, owner) {
  const groupId = msg.key.remoteJid;

  try {
    const groupMeta = await sock.groupMetadata(groupId);
    const participants = groupMeta.participants;

    // Check if sender is admin or owner
    const senderParticipant = participants.find((p) => p.id.includes(senderNumber.replace("@s.whatsapp.net", "")));
    const isAdmin = senderParticipant?.admin === "admin" || senderParticipant?.admin === "superadmin";
    const isOwner = senderNumber.includes(owner);

    if (!isAdmin && !isOwner) {
      return "🚫 You need to be a group admin to use this command.";
    }

    // Get mentioned user
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentioned) return "❓ Please mention a user. Example: *kola kick @user*";

    if (cmd === "kick") {
      await sock.groupParticipantsUpdate(groupId, [mentioned], "remove");
      return `✅ User removed from group.`;
    }

    if (cmd === "promote") {
      await sock.groupParticipantsUpdate(groupId, [mentioned], "promote");
      return `✅ User promoted to admin.`;
    }

    if (cmd === "demote") {
      await sock.groupParticipantsUpdate(groupId, [mentioned], "demote");
      return `✅ User demoted from admin.`;
    }
  } catch (err) {
    console.error("Group error:", err.message);
    return "❌ Failed. Make sure the bot is a group admin.";
  }
}

module.exports = { handle };
