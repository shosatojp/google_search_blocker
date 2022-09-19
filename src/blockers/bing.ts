import { BlockTarget, SiteSetting } from './blocker';

export class BingBlockTarget extends BlockTarget {
    constructor(root: HTMLElement) {
        super(root);
    }

    public getTitle(): string | null {
        return this.root.querySelector('.b_title')?.textContent?.trim() ?? null;
    }

    public getUrl(): URL | null {
        const url = (this.root.querySelector('.b_title > a') as HTMLAnchorElement)?.href ?? null;
        if (!url)
            return null;

        return new URL(url);
    }

    public hide(hidden: boolean): void {
        this.root.style.display = hidden ? 'none' : 'block';
    }

    public highlight(on: boolean, color: string): void {
        this.root.style.backgroundColor = on ? color : 'unset';
    }
}

export class BingSiteSetting extends SiteSetting {
    public get name(): string {
        return 'bing';
    }

    public match(): boolean {
        return location.hostname.split('.').includes('bing');
    }

    public createRootContainer(): HTMLElement {
        const searchElement = document.querySelector('#b_results');
        if (!searchElement) {
            throw new Error('couldn\'t find parent element');
        }

        const container = document.createElement('div');
        searchElement.appendChild(container);
        return container;
    }

    getTargets(): BlockTarget[] {
        const elements = Array.from(document.querySelectorAll('ol#b_results > li.b_algo'));
        const blockTargets: BlockTarget[] = [];

        for (const element of elements) {
            if (!(element instanceof HTMLElement)) {
                continue;
            }

            blockTargets.push(new BingBlockTarget(element));
        }

        return blockTargets;
    }

    public createBlockTarget(root: HTMLElement): BlockTarget {
        return new BingBlockTarget(root);
    }
}
