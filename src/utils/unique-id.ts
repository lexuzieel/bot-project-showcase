import Hashids from "hashids";
import { customAlphabet as customAlphabetNanoid } from "nanoid";

export const uniqueId = (seed?: number) => {
    const length = 8;
    const alphabet = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (seed) {
        return new Hashids("", length, alphabet).encode(seed);
    }

    return customAlphabetNanoid(alphabet, length)();
};
