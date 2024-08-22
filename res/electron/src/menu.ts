const GROUP = 'group';
const CHECK = 'check';
const RADIO = 'radio';
const CHECKED = 'checked';
const DISABLED = 'disabled';

function px(n : number)
{
    return `${n}px`;
}

export abstract class Menu {
    static hide() {
        Menu.root?.hideMenu();
        Menu.root = null;
    }

    destroy() {
        document.body.removeChild(this.elm);
    }

    item(id: string) {
        return this.items.get(id);
    }

    onCommand(id: string, handler: (i: Item, e: Event)=>void) {
        const item = this.items.get(id);
        if (!item) {
            console.debug('Menu.onCommand(): item not found');
            return;
        }

        item.handler = handler;
    }

    addItem(id: string, item: { html?: string, element?: HTMLElement }, insertBefore?: Node) {
        if (!id) {
            console.debug('Menu.addItem: invalid item id');
            return;
        }

        if (this.items.has(id)) {
            console.debug('Menu.addItem: duplicated item id ' + id);
            return;
        }

        let elem: HTMLElement;

        if (item.html) {
            elem = Menu.createElement(item.html);
        } else if (item.element) {
            elem = item.element;
        } else {
            throw Error('html and element can not be both absent');
        }

        elem.id = id;
        elem.classList.add('item');

        if (elem.classList.contains('menu')) {
            elem.classList.remove('menu');
        }

        elem.addEventListener('click', this.onClickItem.bind(this));
        elem.addEventListener('mouseenter', this.onEnterItem.bind(this));

        if (insertBefore) {
            this.elm.insertBefore(elem, insertBefore);
        } else {
            this.elm.appendChild(elem);
        }

        const i = new Item(id, elem, this);
        this.items.set(id, i);
    }

    addSubmenu(id: string, item: { html?: string, element?: HTMLElement }, menu: Popup, insertBefore?: Node) {
        if (!id) {
            console.debug('Menu.addSubmenu(): invalid menu id');
            return;
        }

        if (this.items.has(id)) {
            console.debug('Menu.addSubmenu(): duplicated menu id ' + id);
            return;
        }

        let elem: HTMLElement;

        if (item.html) {
            elem = Menu.createElement(item.html);
        } else if (item.element) {
            elem = item.element;
        } else {
            throw Error('html and element can not be both absent');
        }

        elem.id = id;
        elem.classList.add('menu');

        if (elem.classList.contains('item')) {
            elem.classList.remove('item');
        }

        elem.addEventListener('mouseenter', this.onEnterMenu.bind(this));

        if (insertBefore) {
            this.elm.insertBefore(elem, insertBefore);
        } else {
            this.elm.appendChild(elem);
        }

        const i = new Item(elem.id, elem, this);
        i.submenu = menu;
        this.items.set(id, i);
    }

    remove(id: string) {
        const item = this.items.get(id);
        if (item) {
            item.element.remove();
            this.items.delete(id);
        }
    }

    addSeparator(item: { html?: string, element?: HTMLElement }, insertBefore?: Node) {
        let elem: HTMLElement;

        if (item.html) {
            elem = Menu.createElement(item.html);
        } else if (item.element) {
            elem = item.element;
        } else {
            throw Error('html and element can not be both absent');
        }

        elem.classList.add('separator');

        if (insertBefore) {
            this.elm.insertBefore(elem, insertBefore);
        } else {
            this.elm.appendChild(elem);
        }
    }

    removeSeparator(id: string) {
        for (let i = 0; i < this.elm.children.length; i++) {
            const c = this.elm.children[i];
            if (id === c.id) {
                c.remove();
                break;
            }
        }
    }

    uncheckGroup(group: string) {
        this.items.forEach((item)=>{
            if (item.isRadio() && group === item.group()) {
                item.uncheck();
            }
        });
    }

    show(x: number, y: number, boundry: HTMLElement, zIndex?: number) {
        Menu.hide();
        Menu.root = this;

        const r = this.elm.getBoundingClientRect();
        const b = boundry.getBoundingClientRect();

        if (x + r.width > b.x + b.width) {
            x = b.x + b.width - r.width;
        }
        if (y + r.height > b.y + b.height) {
            y = b.y + b.height - r.height;
        }

        this.elm.style.left = px(x);
        this.elm.style.top  = px(y);
        this.elm.style.zIndex = (null != zIndex) ? zIndex.toString() : '';
        this.elm.style.display = 'block';
        this.elm.classList.add('popup-menu');
        this.elm.classList.remove('dropdown-menu');
        this.src = null;
    }

    protected isDropdown() {
        return this.elm.classList.contains('dropdown-menu');
    }

    protected showDropdown(source: HTMLElement) {
        source.classList.add('active');

        const r = source.getBoundingClientRect();
        this.elm.style.top  = px(r.top + r.height);
        this.elm.style.left = px(r.left);
        this.elm.style.display = 'block';
        this.elm.classList.add('dropdown-menu');
        this.elm.classList.remove('popup-menu');
        this.src = source;
    }

    protected showPopup(source: HTMLElement) {
        const r = source.getBoundingClientRect();
        this.elm.style.top  = px(r.top);
        this.elm.style.left = px(r.left + r.width);
        this.elm.style.zIndex = (source.style.zIndex + 1).toString();
        this.elm.style.display = 'block';
        this.elm.classList.add('popup-menu');
        this.elm.classList.remove('dropdown-menu');
        this.src = source;
    }

    protected hideMenu() {
        this.src?.classList.remove('active');
        this.src = null;
        this.sub?.hideMenu();
        this.sub = null;
        this.elm.style.display = 'none';
    }

    protected constructor() {
        this.sub = null;
        this.src = null;
        this.items = new Map<string, Item>();

        this.elm = document.createElement('div');
        this.elm.style.display  = 'none';
        this.elm.style.position = 'absolute';
        this.elm.addEventListener('click', Menu.onClickContainer);
    }

    protected async load(content: { html?: string, path?: string, element?: HTMLElement, attribute?: string }) {
        let html: string;

        if (content.html) {
            html = content.html;
        } else if (content.path) {
            html = await (await fetch(content.path)).text();
        } else if (content.element && content.attribute) {
            html = await (await fetch(content.element.getAttribute(content.attribute) ?? '')).text();
        }
        else {
            throw Error('Either html or path or element and attribute must be provided');
        }

        this.elm.innerHTML = html;

        const items = this.elm.getElementsByClassName('item');
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.id) {
                console.debug('Menu.load(): item id is missing');
                continue;
            }

            if (this.items.has(item.id)) {
                console.debug('Menu.load(): duplicated item ' + item.id);
                continue;
            }

            if (!(item instanceof HTMLElement)) {
                console.debug('Menu.load(): item ' + item.id + ' is not HTMLElement');
                continue;
            }

            if (item.classList.contains('menu')) {
                console.debug('Menu.load(): conflict item type - ' + item.id);
            }

            item?.addEventListener('click', this.onClickItem.bind(this));
            item?.addEventListener('mouseenter', this.onEnterItem.bind(this));
            this.items.set(item.id, new Item(item.id, item, this));
        }

        const menus = this.elm.getElementsByClassName('menu');
        for (let i = 0; i < menus.length; i++) {
            const item = menus[i];

            if (!item.id) {
                console.debug('Menu.load(): item id is missing');
                continue;
            }

            if (this.items.has(item.id)) {
                console.debug('Menu.load(): duplicated item ' + item.id);
                continue;
            }

            if (!(item instanceof HTMLElement)) {
                console.debug('Menu.load(): item ' + item.id + ' is not HTMLElement');
                continue;
            }

            if (!item.getAttribute('path')) {
                console.debug('Menu.load(): missing path attribute - ' + item.id);
                continue;
            }

            const mitem = new Item(item.id, item, this);
            mitem.submenu = await Popup.create({ element: item, attribute: 'path' });

            item.addEventListener('mouseenter', this.onEnterMenu.bind(this));
            this.items.set(mitem.id, mitem);
        }

        document.body.appendChild(this.elm);
    }

    protected onClickItem(e: Event) {
        let he = <HTMLElement>e.target;
        while (!he.classList.contains('item')) {
            he = he.parentElement!;
        }

        const item = this.items.get(he.id);
        if (item) {
            if (!item.isEnabled()) {
                return;
            }

            if (item.isCheckable()) {
                if (item.isChecked()) {
                    item.uncheck();
                } else {
                    item.check();
                }
                item.handler?.(item, e);

            } else if (item.isRadio()) {
                if (!item.isChecked()) {
                    item.check();
                    item.handler?.(item, e);
                };
            } else {
                item.handler?.(item, e);
            }
        }

        Menu.hide();
    }

    protected onEnterItem() {
        if (this.sub) {
            this.sub.hideMenu();
            this.sub = null;
        }
    }

    protected onEnterMenu(e: Event) {
        const id = (<HTMLElement>e.target).id;
        const item = this.items.get(id);

        if (this.sub != null && this.sub != item?.submenu) {
            this.sub.hideMenu();
            this.sub = null;
        }

        if (item?.isEnabled() && item.submenu && !this.sub) {
            item.submenu.src = <HTMLElement>e.target;
            this.sub = item.submenu;
            this.sub.showPopup(item.submenu.src);
        }
    }

    protected static onClickContainer(e: Event) {
        e.stopPropagation();
    }

    protected static createElement(html: string) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        if (!<HTMLElement>temp.firstChild) {
            throw Error("Failed to create element from html: " + html);
        }

        return <HTMLElement>temp.firstChild;
    }

    protected elm: HTMLElement;
    protected src: HTMLElement | null;
    protected sub: Menu | null;
    protected items : Map<string, Item>;

    protected static root: Menu | null = null;
    protected static init = (()=>window.addEventListener('click', ()=>Menu.hide()))();
}

export class Dropdown extends Menu {
    static async create(source: HTMLElement, content: { html?: string, path?: string, element?: HTMLElement, attribute?: string }): Promise<Dropdown> {
        const m = new Dropdown(source);
        await m.load({ html: content.html, path: content.path, element: content.element ?? source, attribute: content.attribute });

        source.addEventListener('click', m.onClickSource.bind(m));
        source.addEventListener('mouseenter', m.onEnterSource.bind(m));

        return m;
    }

    constructor(source: HTMLElement) {
        super();
        this.source = source;
    }

    destroy() {
        this.source.removeEventListener('click', this.onClickSource);
        this.source.removeEventListener('mouseenter', this.onEnterSource);
        super.destroy();
    }

    protected onClickSource(e: Event) {
        e.stopPropagation();

        if (this == Menu.root && this.isDropdown()) {
            Menu.root = null;
            this.hideMenu();
        } else {
            Menu.hide();
            Menu.root = this;
            this.showDropdown(this.source);
        }
    }

    protected onEnterSource() {
        if (Menu.root && (<Dropdown>Menu.root).isDropdown()) {
            Menu.hide();
            Menu.root = this;
            this.showDropdown(this.source);
        }
    }

    protected source: HTMLElement;
}

export class Popup extends Menu {
    static async create(content: { html?: string, path?: string, element?: HTMLElement, attribute?: string }) : Promise<Popup> {
        const m = new Popup();
        await m.load(content);
        return m;
    }
}

export class Item {
    constructor(id: string, element: HTMLElement, menu: Menu) {
        this.id = id;
        this.menu = menu;
        this.element = element;
    }

    isEnabled() {
        return !this.element.classList.contains(DISABLED);
    }

    enable() {
        this.element.classList.remove(DISABLED);
    }

    disable() {
        this.element.classList.add(DISABLED);
    }

    isCheckable() {
        return this.element.classList.contains(CHECK);
    }

    isRadio() {
        return this.element.classList.contains(RADIO);
    }

    isChecked() {
        if (!this.isCheckable() && !this.isRadio()) {
            return false;
        }

        return this.element.classList.contains(CHECKED);
    }

    check() {
        if (this.isCheckable()) {
            if (!this.isChecked()) {
                this.element.classList.add(CHECKED);
            }
        } else if (this.isRadio()) {
            if (!this.isChecked()) {
                if (this.group()) {
                    this.menu.uncheckGroup(this.group()!);
                }
                this.element.classList.add(CHECKED);
            }
        }
    }

    uncheck() {
        this.element.classList.remove(CHECKED);
    }

    group() {
        return this.element.getAttribute(GROUP);
    }

    id : string;
    menu: Menu;
    element: HTMLElement;
    handler: undefined | ((i: Item, e: Event)=>void);
    submenu: undefined | Popup;
}