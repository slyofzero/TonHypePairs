import { setPromoText } from "@/vars/promo";
import { CommandContext, Context } from "grammy";

export async function sponsor(ctx: CommandContext<Context>) {
  const { match } = ctx;

  if (!match) {
    return ctx.reply(
      "No sponsor text passed, use command like this -\n/sponsor This is a sponsor"
    );
  }

  setPromoText(match);
  ctx.reply(`Sponsor text set as - ${match}`);
}
