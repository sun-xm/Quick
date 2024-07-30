export class Status {
    static init(elem: Element | null) {
        Status.elem = elem;
    }

    static show(content: string) {
        if (Status.elem) {
            Status.elem.innerHTML = content;
        }
    }

    private static elem: Element | null;
}