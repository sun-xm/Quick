import * as remote from '@electron/remote';
import * as Menu   from './menu';
import { Module }  from './module';

export function module(elem: Element) {
    return new Title(elem);
}

export class Title extends Module {
    constructor(elem: Element) {
        super(elem);
    }

    async onload() {
        this.element.querySelector('#close.system')?.addEventListener('click', ()=>remote.getCurrentWindow().close());

        this.element.querySelector('#minimize.system')?.addEventListener('click', ()=>remote.getCurrentWindow().minimize());

        this.element.querySelector('#maximize.system')?.addEventListener('click', ()=>remote.getCurrentWindow().maximize());

        this.element.querySelector('#restore.system')?.addEventListener('click', ()=>remote.getCurrentWindow().restore());

        remote.getCurrentWindow().on('maximize', ()=>{
            const r = <HTMLElement>this.element.querySelector('#restore.system');
            const m = <HTMLElement>this.element.querySelector('#maximize.system');

            if (r && m) {
                r.style.display = 'block';
                m.style.display = 'none';
            }
        });

        remote.getCurrentWindow().on('unmaximize', ()=>{
            const r = <HTMLElement>this.element.querySelector('#restore.system');
            const m = <HTMLElement>this.element.querySelector('#maximize.system');

            if (r && m) {
                r.style.display = 'none';
                m.style.display = 'block';
            }
        });

        this.file = await Menu.Dropdown.create({ source: <HTMLElement>this.element.querySelector('#file.menu'), attribute: 'path'});
        this.help = await Menu.Dropdown.create({ source: <HTMLElement>this.element.querySelector('#help.menu'), attribute: 'path'});
        this.color = this.file.item('color')?.submenu;
        this.option = this.file.item('option')?.submenu;
    }

    file?:   Menu.Dropdown;
    help?:   Menu.Dropdown;
    color?:  Menu.Menu;
    option?: Menu.Menu;
}