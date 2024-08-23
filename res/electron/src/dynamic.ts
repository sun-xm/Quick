export class Dynamic {
    static async include(elem: Element, content?: { html?: string, path?: string }): Promise<Element> {
        let html: string;

        if (content) {
            if (content.html) {
                html = content.html;
            } else if (content.path) {
                html = await (await fetch(content.path)).text();
            } else {
                throw Error('Parameter html and path should not be both invalid');
            }
        } else {
            const path = elem.getAttribute('include');
            if (!path) {
                throw Error('Property "include" path is not available on element');
            }
            html = await (await fetch(path)).text();
        }

        if (!html) {
            throw Error('Invalid include content');
        }

        elem.innerHTML = html;

        const all: Promise<Element>[] = [];
        for (let i = 0; i < elem.children.length; i++) {
            all.push(Dynamic.process(elem.children[i]));
        }

        await Promise.all(all);

        return elem;
    }

    static async replace(elem: Element, content?: { html?: string, path?: string }): Promise<Element> {
        let html: string;

        if (content) {
            if (content.html) {
                html = content.html;
            } else if (content.path) {
                html = await (await fetch(content.path)).text();
            } else {
                throw Error('Parameter html and path should not be both invalid');
            }
        } else {
            const path = elem.getAttribute('replace');
            if (!path) {
                throw Error('Property "replace" path is not available on element');
            }
            html = await (await fetch(path)).text();
        }

        if (!html) {
            throw Error('Invalid replace content');
        }

        const div = document.createElement('div');
        div.innerHTML = html;

        const rep = await Dynamic.process(div.children[0]);
        elem.replaceWith(rep);

        return rep;
    }

    static async process(elem: Element): Promise<Element> {
        const inc = elem.getAttribute('include');
        if (inc) {
            return Dynamic.include(elem, { path: inc });
        }

        const rep = elem.getAttribute('replace');
        if (rep) {
            return Dynamic.replace(elem, { path: rep });
        }

        const all: Promise<Element>[] = [];

        for (let i = 0; i < elem.children.length; i++) {
            all.push(Dynamic.process(elem.children[i]));
        }

        await Promise.all(all);

        return elem;
    }
}