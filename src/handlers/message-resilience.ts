import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { mainMenuKeyboard } from "../toolkit/index.js";

// Typed free-form input is not part of the trading workflow.  Keep it terminal
// so a pasted credential, an incomplete manual-signal draft, or any other
// unexpected text cannot fall through into an integration or leave the sender
// without a response.
const composer = new Composer<Ctx>();

export const INPUT_ACKNOWLEDGEMENT =
  "I’m here. Tap a menu option below, or use /help for guidance.";

composer.on("message:text", async (ctx, next) => {
  const text = ctx.message.text.trim();
  // Commands have dedicated handlers. Let them continue through the composer
  // chain, including unknown commands which receive the shared fallback.
  if (text.startsWith("/")) return next();

  await ctx.reply(INPUT_ACKNOWLEDGEMENT, { reply_markup: mainMenuKeyboard() });
});

export default composer;
