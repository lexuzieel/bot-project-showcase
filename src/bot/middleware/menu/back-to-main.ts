import { Menu } from "@grammyjs/menu";
import { CustomContext } from "../../context";
import { showMenu } from "../menu";
import { history } from "./utils/history";

export const backToMain = new Menu<CustomContext>("back-to-main").text(
    ctx => ctx.t("nav.main"),
    history.delete,
    async ctx => {
        ctx.menu.close();
        await showMenu(ctx);
    },
);
