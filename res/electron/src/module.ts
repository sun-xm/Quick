import { Dynamic } from './dynamic';

export class Module {
    static async create<M extends Module>(html: { html?: string, path?: string }, module?: string) {
        if (!html.html) {
            if (html.path) {
                html.html = await (await fetch(html.path)).text();
            } else {
                throw Error('Parameter html and path should not be both invalid');
            }
        }

        if (!html.html) {
            throw Error('Invalid html content');
        }

        const div = document.createElement('div');
        div.innerHTML = html.html;

        if (0 == div.children.length) {
            throw Error('No element is created from html');
        }

        const elem = div.children[0];

        module = module ? module : elem.getAttribute('module') ?? undefined;
        if (!module) {
            throw Error('Undefined module name');
        }

        elem.dispatchEvent(new Event('moduleunload'));

        return <M>((await import(module)).module(elem));
    }

    static async load<M extends Module>(elem: Element, module?: string) {
        elem = await Dynamic.process(elem);

        module = module ? module : elem.getAttribute('module') ?? undefined;
        if (!module) {
            throw Error('Undefined module name');
        }

        elem.dispatchEvent(new Event('moduleunload'));

        return <M>(await require(module).module(elem));
    }

    constructor (e: Element) {
        this.element = e;
    }

    element: Element;
}