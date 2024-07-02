import { YooCheckout } from "@a2seven/yoo-checkout";
import dotenv from "dotenv";

dotenv.config();

export const yooKassa = new YooCheckout({
    shopId: process.env.YOOKASSA_SHOP_ID || "",
    secretKey: process.env.YOOKASSA_SECRET_KEY || "",
});
