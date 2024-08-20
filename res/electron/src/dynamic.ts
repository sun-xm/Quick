export class Dynamic {
    static async include(elem: Element, path?: string): Promise<Element> {
        if (!path) {
            path = elem.getAttribute('include') ?? undefined;
        }

        if (!path) {
            return Promise.reject('Dynamic.include(): neither path is defined nor element has a valid include attribute');
        }

        elem.innerHTML = await (await fetch(path)).text();

        const all: Promise<Element>[] = [];
        for (let i = 0; i < elem.children.length; i++) {
            all.push(Dynamic.process(elem.children[i]));
        }

        await Promise.all(all);

        return elem;
    }

    static async replace(elem: Element, path?: string): Promise<Element> {
        if (!path) {
            path = elem.getAttribute('replace') ?? undefined;
        }

        if (!path) {
            return Promise.reject('Dynamic.replace(): neither path is defined nor element has a valid replace attribute');
        }

        const div = document.createElement('div');
        div.innerHTML = await (await fetch(path)).text();

        const rep = await Dynamic.process(div.children[0]);
        elem.replaceWith(rep);

        return rep;
    }

    static async process(elem: Element): Promise<Element> {
        const inc = elem.getAttribute('include');
        if (inc) {
            return Dynamic.include(elem, inc);
        }

        const rep = elem.getAttribute('replace');
        if (rep) {
            return Dynamic.replace(elem, rep);
        }

        const all: Promise<Element>[] = [];

        for (let i = 0; i < elem.children.length; i++) {
            all.push(Dynamic.process(elem.children[i]));
        }

        await Promise.all(all);

        return elem;
    }
}