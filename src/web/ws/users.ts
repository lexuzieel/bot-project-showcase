import { Server } from "socket.io";
import { User } from "../../db/entity/user";
import logger from "../../utils/logger";

export const users = (io: Server) => {
    const namespace = io.of("/users");

    namespace.on("connection", async socket => {
        const user = await User.findOne({
            where: {
                id: socket.handshake.auth.user?.id,
            },
        });

        if (!user) {
            return;
        }

        logger.debug(`User ${user.id} connected`);

        await socket.join(user.id);
    });
};
