import { Module } from './module';
import { Menu }   from './menu';

export function module(elem: Element) {
    return new Content(elem);
}

export class Content extends Module {
    constructor(elem: Element) {
        super(elem);

        elem.addEventListener('contextmenu', (e)=>{
            if (this.menu) {
                this.menu.show((<MouseEvent>e).x, (<MouseEvent>e).y, <HTMLElement>this.element);
            }
        });
    }

    context(menu: Menu | undefined | null) {
        this.menu = menu;
    }

    private menu: Menu | undefined | null;
}