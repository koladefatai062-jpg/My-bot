require("dotenv").config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const askAI = require("./ai");
const spamCheck = require("./utils/antiSpam");
const log = require("./utils/logger");
const { prefix, owner } = require("./config");
const adminCommands = require("./commands/admin");
const weatherCommands = require("./commands/weather");
const funCommands = require("./commands/fun");
const groupCommands = require("./commands/group");
const stickerWarnings = require("./utils/stickerWarnings");
const { getUsername, setUsername, hasUsername } = require("./utils/usernames");

if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

const BOT_NAME = "CYBERLORD";
const AI_TRIGGER = "cyberlord";
const pendingName = new Set();

function fmt(text) {
  return `╔═══════════════════╗\n${text}\n╚═══════════════════╝`;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (!sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(process.env.OWNER);
          console.log(`\n🔑 PAIRING CODE: ${code}`);
          console.log("WhatsApp → Linked Devices → Link a Device → Link with phone number\n");
        } catch (err) {
          console.error("Pairing error:", err.message);
        }
      }, 3000);
    }

    if (connection === "open") console.log(`✅ ${BOT_NAME} CONNECTED`);

    if (connection === "close") {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("🔄 Reconnecting...");
        startBot();
      } else {
        console.log("❌ Logged out. Delete auth folder and restart.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith("@g.us");
    const senderNumber = msg.key.participant || sender;
    const msgType = Object.keys(msg.message)[0];

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    // ── Sticker warning ────────────────────────────────────
    if (msgType === "stickerMessage") {
      const result = stickerWarnings.warn(senderNumber);
      if (result.blocked) {
        await sock.sendMessage(sender, {
          text: fmt(`🚫 *You have been blocked.*\n\nReason: Sending stickers.\nContact the owner to be unblocked.`),
        });
        return;
      }
      await sock.sendMessage(sender, {
        text: fmt(`⚠️ *Sticker Warning ${result.count}/3*\n\nStop sending stickers or you will be blocked.`),
      });
      return;
    }

    // ── Blocked users ──────────────────────────────────────
    if (stickerWarnings.isBlocked(senderNumber)) {
      await sock.sendMessage(sender, { text: `🚫 You are blocked. Contact the owner.` });
      return;
    }

    // ── Spam check ─────────────────────────────────────────
    if (spamCheck(senderNumber)) {
      await sock.sendMessage(sender, { text: `⏳ Slow down! Wait 3 seconds.` });
      return;
    }

    // ── Image message handler ──────────────────────────────
    if (msgType === "imageMessage") {
      const username = getUsername(senderNumber) || "friend";
      const caption = msg.message.imageMessage?.caption || "What is in this image?";
      try {
        const stream = await downloadContentFromMessage(msg.message.imageMessage, "image");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const imageBase64 = buffer.toString("base64");
        await sock.sendMessage(sender, { text: `🤖 _Analyzing image, ${username}..._` });
        const reply = await askAI(caption, "gpt", username, imageBase64);
        await sock.sendMessage(sender, { text: fmt(`🤖 *CYBERLORD AI*\n\n${reply}`) });
      } catch (err) {
        console.error("Image error:", err.message);
        await sock.sendMessage(sender, { text: `❌ Could not read image.` });
      }
      return;
    }

    if (!text) return;

    log({ sender: senderNumber, text, time: new Date().toISOString() });

    const lower = text.toLowerCase().trim();
    const username = getUsername(senderNumber) || "friend";

    // ── Username registration ──────────────────────────────
    if (pendingName.has(senderNumber)) {
      const name = text.trim();
      setUsername(senderNumber, name);
      pendingName.delete(senderNumber);
      await sock.sendMessage(sender, {
        text: fmt(`✅ *Got it, ${name}!*\n\nWelcome to ${BOT_NAME} 🤖\n\nType *cyberlord <question>* to ask me anything\nor *kola menu* for all commands.`),
      });
      return;
    }

    // ── First time user ────────────────────────────────────
    if (!hasUsername(senderNumber)) {
      pendingName.add(senderNumber);
      await sock.sendMessage(sender, {
        text: fmt(`👋 *Welcome to ${BOT_NAME}!*\n\nBefore we start, what's your name?`),
      });
      return;
    }

    // ── Cyberlord AI trigger ───────────────────────────────
    if (lower.startsWith(AI_TRIGGER)) {
      const question = text.slice(AI_TRIGGER.length).trim();

      if (!question) {
        await sock.sendMessage(sender, {
          text: fmt(`🤖 *CYBERLORD AI*\n\nUsage: *cyberlord <your question>*\n\nExample: cyberlord what is bitcoin`),
        });
        return;
      }

      await sock.sendMessage(sender, { text: `🤖 _Thinking, ${username}..._` });
      const reply = await askAI(question, "gpt", username);
      await sock.sendMessage(sender, {
        text: fmt(`🤖 *CYBERLORD AI*\n\n${reply}`),
      });
      return;
    }

    // ── Reply to messages without prefix ──────────────────
    if (!lower.startsWith(prefix)) {
      const greetings = ["hi", "hello", "hey", "sup", "yo", "hii", "good morning", "good evening", "good afternoon"];
      if (greetings.some((g) => lower === g || lower.startsWith(g))) {
        await sock.sendMessage(sender, {
          text: fmt(`👋 *Hey ${username}!*\n\nI'm ${BOT_NAME} 🤖\n\nType *cyberlord <question>* to ask me anything\nor *kola menu* for all commands.`),
        });
        return;
      }

      await sock.sendMessage(sender, { text: `🤖 _Thinking, ${username}..._` });
      const reply = await askAI(text, "gpt", username);
      await sock.sendMessage(sender, { text: fmt(`🤖 *${BOT_NAME}*\n\n${reply}`) });
      return;
    }

    // ── Kola commands ──────────────────────────────────────
    const body = text.slice(prefix.length).trim();
    const [command, ...args] = body.split(" ");
    const cmd = command.toLowerCase();

    console.log(`📩 ${cmd} | ${senderNumber}`);

    if (cmd === "menu" || cmd === "help") {
      await sock.sendMessage(sender, {
        text: fmt(
          `🤖 *${BOT_NAME} MENU*\n\n` +
          `📌 *General*\n` +
          `• kola menu\n` +
          `• kola ping\n\n` +
          `🤖 *AI*\n` +
          `• cyberlord <question>\n\n` +
          `🌍 *Utility*\n` +
          `• kola weather <city>\n\n` +
          `😂 *Fun*\n` +
          `• kola joke\n` +
          `• kola quote\n` +
          `• kola roast\n\n` +
          `👥 *Group (admin only)*\n` +
          `• kola kick @user\n` +
          `• kola promote @user\n` +
          `• kola demote @user\n\n` +
          `🛡️ *Owner only*\n` +
          `• kola admin ban/unban/list\n` +
          `• kola admin unblock <number>`
        ),
      });
      return;
    }

    if (cmd === "ping") {
      const start = Date.now();
      await sock.sendMessage(sender, { text: `🏓 Pong ${username}! *${Date.now() - start}ms*` });
      return;
    }

    if (cmd === "weather") {
      const result = await weatherCommands.getWeather(args.join(" "));
      await sock.sendMessage(sender, { text: fmt(result) });
      return;
    }

    if (cmd === "joke") {
      await sock.sendMessage(sender, { text: fmt(`😂 *Joke for ${username}*\n\n${funCommands.joke()}`) });
      return;
    }

    if (cmd === "quote") {
      await sock.sendMessage(sender, { text: fmt(`💬 *Quote for ${username}*\n\n${funCommands.quote()}`) });
      return;
    }

    if (cmd === "roast") {
      await sock.sendMessage(sender, { text: fmt(`🔥 *Roast*\n\n${funCommands.roast()}`) });
      return;
    }

    if (["kick", "promote", "demote"].includes(cmd)) {
      if (!isGroup) {
        await sock.sendMessage(sender, { text: `❌ Group only command.` });
        return;
      }
      const result = await groupCommands.handle(sock, msg, cmd, args, senderNumber, owner);
      await sock.sendMessage(sender, { text: fmt(result) });
      return;
    }

    if (cmd === "admin") {
      const isOwner = senderNumber.includes(owner) || sender.includes(owner);
      if (!isOwner) {
        await sock.sendMessage(sender, { text: `🚫 *Owner only command.*` });
        return;
      }
      const result = adminCommands.handle(args);
      await sock.sendMessage(sender, { text: fmt(result) });
      return;
    }

    await sock.sendMessage(sender, {
      text: fmt(`❓ Unknown: *kola ${cmd}*\n\nType *kola menu* for all commands.`),
    });
  });
}

startBot();
