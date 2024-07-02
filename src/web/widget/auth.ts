import express from "express";
import { User } from "../../db/entity/user";
import { telegram } from "./auth/telegram";

export const auth = express.Router();

auth.use("/telegram", telegram);

auth.get("/profile", async (req, res) => {
    const session = req.session;

    if (!session) {
        return res.sendStatus(401);
    }

    const user = await User.findOne({
        where: {
            id: session.user.id,
        },
    });

    res.json(await user?.toJson());
});

auth.post("/logout", async (req, res) => {
    if (req.session) {
        await req.session.remove();
    }

    res.sendStatus(200);
});
