import { CommandContext } from "grammy";
import { countries } from "../../location/location";
import { forEachAdmin } from "../../utils/admins";
import { CustomContext } from "../context";
import { main } from "../middleware/menu/main";

type CampaignData = {
    name: string | null;
    source: string;
};

const resolveCampaign = (
    ctx: CommandContext<CustomContext>,
): CampaignData | undefined => {
    /**
     * REDACTED
     */
};

export const generateLead = async (ctx: CommandContext<CustomContext>) => {
    const campaign = resolveCampaign(ctx);
    const user = ctx.user.fullName;
    let source = ctx.t("telemetry.unknown-source");

    if (campaign) {
        source = campaign.source;
        if (campaign.name) {
            source = `${source} (#${campaign.name})`;
        }
    }

    return campaign;
};

export const start = {
    text: (ctx: CustomContext) =>
        ctx.t("main", { countries: countries.length }),
    other: {
        reply_markup: main,
        link_preview_options: {
            // is_disabled: true,
            prefer_large_media: false,
            url: "https://visacat.ru/blog/tpost/3vbvzgafu1?utm_source=telegram&utm_medium=bot&utm_campaign=start&utm_content=main-menu",
        },
    },
};
