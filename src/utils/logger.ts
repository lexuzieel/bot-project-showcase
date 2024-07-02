import { WinstonTransport as AxiomTransport } from "@axiomhq/axiom-node";
import chalk from "chalk";
import crypto from "crypto";
import dotenv from "dotenv";
import escapeHTML from "escape-html";
import logfmt from "logfmt";
import ms from "ms";
import os from "os";
import { LEVEL } from "triple-beam";
import { ulid } from "ulid";
import winston from "winston";
import TelegramLogger from "winston-telegram";
import config from "../config";
import { applicationName, getEnvironment } from "../utils";

dotenv.config();

const logfmttr = new logfmt();

const logfmtChalk = new chalk.Instance({ level: 1 });

const colorizedLogfmtKeys = (data: object): string => {
    let attributes = logfmttr.stringify(data);

    for (const key of Object.keys(data)) {
        const hue = crypto
            .createHash("md5")
            .update(key)
            .digest()
            .readUIntBE(0, 1);

        const color = logfmtChalk.hsl(hue, 100, 50);

        // A positive lookbehind requiring a whitespace or start of string
        // immediately to the left of the current position.
        const regex = RegExp(`(?<=\\s|^)${key}`);

        attributes = attributes.replace(regex, color(key));
    }

    return attributes;
};

let previousTime = 0;

const errorReferenceFormat = winston.format.printf(info => {
    if (["error", "warn"].includes(info.level)) {
        info.ref = ulid();
    }

    return "";
});

const logfmtFormat = winston.format.printf(info => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { level, message, timestamp, error, ...extracted } = info;

    let padded = `${info[LEVEL]} ${message}`;

    const currentTime = Number(new Date());
    const diff = currentTime - (previousTime || currentTime);
    const diffString = diff > 0 ? ` +${ms(diff)}` : "";
    previousTime = currentTime;

    const minSpace = 70;
    const lengthToPad = padded.length + diffString.length;

    if (lengthToPad < minSpace) {
        padded =
            padded +
            " ".repeat(minSpace - lengthToPad) +
            chalk.gray(diffString);
    }

    for (const key of Object.keys(extracted)) {
        if (typeof extracted[key] == "object") {
            extracted[key] = JSON.stringify(extracted[key]);
        }
    }

    let keys = colorizedLogfmtKeys(extracted);

    if (error) {
        if (error instanceof Error) {
            keys = `${keys} ${colorizedLogfmtKeys({
                error: error.message,
                stack: error.stack,
            })}`;
        } else {
            keys = `${keys} ${colorizedLogfmtKeys({ error })}`;
        }
    }

    padded = padded.replace(info[LEVEL] as string, level);

    return `${padded} ${keys.trim()}`;
});

/**
 * Make logger configured depending on the current environment.
 *
 * @returns Configured instance of winston logger
 */
const makeLogger = (): winston.Logger => {
    const logfmt = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        logfmtFormat,
    );

    const loggerOptions = {
        level: process.env.LOG_LEVEL || "silly",
        format: errorReferenceFormat,
        transports: [
            new winston.transports.Console({
                format: logfmt,
            }),
        ],
    };

    const logger = winston.createLogger(loggerOptions);
    if (
        process.env.AXIOM_DATASET &&
        process.env.AXIOM_TOKEN &&
        process.env.AXIOM_ORG_ID
    ) {
        const axiomTransport = new AxiomTransport();
        logger.add(axiomTransport);
    }

    if (process.env.WINSTON_TELEGRAM_TOKEN && config.channels?.system) {
        const telegramTransport = new TelegramLogger({
            token: process.env.WINSTON_TELEGRAM_TOKEN,
            chatId: config.channels?.system,
            level: "warn",
            batchingDelay: 1000,
            parseMode: "HTML",
            formatMessage(params, info) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { level, message, error, ref, ...extracted } = info;

                const hostname = os.hostname();
                const icon = level === "error" ? "❌" : "⚠️";

                let body =
                    `\n<code>lvl: </code><code>${level}</code>` +
                    `\n<code>env: </code><code>${hostname}</code>`;

                if (info.ref) {
                    body += `\n<code>ref: </code><code>${info.ref}</code>`;
                }

                if (info.error?.message) {
                    const msg = escapeHTML(
                        info.error.message.substring(0, 1024),
                    );
                    body += `\n<code>msg: </code><code>${msg}</code>`;
                }

                for (const [key, value] of Object.entries(extracted)) {
                    if (typeof value !== "string") continue;

                    body += `\n<code>${key}: </code><code>${escapeHTML(
                        (value as string).substring(0, 256),
                    )}</code>`;
                }

                return `${icon} ${info.message}\n${body}`;
            },
        });

        logger.add(telegramTransport);
    }

    return logger;
};

export default makeLogger();
