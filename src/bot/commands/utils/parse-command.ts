import { CommandContext } from "grammy";
import { CustomContext } from "../../context";

export type CommandArguments = {
    id?: string;
    action: string;
    args: string[];
};

const trimArgument = (arg: string): string =>
    arg.trim().replace(/[\u2068,\u2069]/g, "") || "";

const parseArguments = (args?: string): string[] => {
    if (args) {
        return args.split(/\s+/).map(trimArgument);
    }

    return [];
};

export const parseCommand = (
    ctx: CommandContext<CustomContext>,
): CommandArguments => {
    const args = parseArguments(ctx.match);

    const id = args.shift();
    const action = args.shift() || "show";

    return {
        id,
        action,
        args,
    };
};
