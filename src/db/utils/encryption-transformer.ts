import dotenv from "dotenv";

dotenv.config();

export const EncryptionTransformerConfig = {
    key: process.env.ENCRYPTION_KEY || "",
    algorithm: "aes-256-gcm",
    ivLength: 16,
};
