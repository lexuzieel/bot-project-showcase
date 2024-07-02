export class CyclicList<T extends object> {
    private cursor = 0;

    constructor(private items: T[]) {
        //
    }

    public get length() {
        return this.items.length;
    }

    public next(): T {
        const item = this.items[this.cursor];
        this.cursor = (this.cursor + 1) % this.items.length;
        return item;
    }
}
