import { BlockTarget, SiteSetting } from './blocker';
import * as util from '../util';

export class GoogleBlockTarget extends BlockTarget {
    constructor(root: HTMLElement) {
        super(root);
    }

    public getTitle(): string | null {
        return this.root.querySelector('h3')?.textContent?.trim() ?? null;
    }

    public getUrl(): URL | null {
        const url = this.root.querySelector('a')?.href ?? null;
        if (!url)
            return null;

        return new URL(url);
    }

    public hide(hidden: boolean): void {
        this.root.style.display = hidden ? 'none' : 'block';
    }

    public highlight(on: boolean, color: string): void {
        this.root.style.backgroundColor = on ? color : 'unset';
        const inner = this.root.querySelector('.g');
        if (!(inner instanceof HTMLElement)) {
            return;
        }

        inner.style.backgroundColor = on ? color : 'unset';
    }
}

export class GoogleSiteSetting extends SiteSetting {
    private mutationObserver: MutationObserver | null = null;
    private blockTargetsCache: Set<HTMLElement> = new Set<HTMLElement>();

    public get name(): string {
        return 'google';
    }

    public match(): boolean {
        return location.hostname.split('.').includes('google') &&
            !util.isMobile();
    }

    public createRootContainer(): HTMLElement {
        const searchElement = document.querySelector('#search');
        if (!searchElement) {
            throw new Error('couldn\'t find parent element');
        }

        const container = document.createElement('div');
        searchElement.appendChild(container);
        return container;
    }

    getTargets(_elements?: Element[]): BlockTarget[] {
        const elements = _elements || Array.from(document.getElementsByClassName('g'));
        const blockTargets: BlockTarget[] = [];

        for (const element of elements) {
            if (!(element instanceof HTMLElement &&
                element.parentElement instanceof HTMLElement)) {
                continue;
            }
            if (element.querySelector('g-card') || element.tagName === 'G-CARD') {
                continue;
            }

            element.style.marginBottom = '0px';

            this.blockTargetsCache.add(element.parentElement);

            blockTargets.push(new GoogleBlockTarget(element.parentElement));
        }

        return blockTargets;
    }

    public observeMutate(onAdded: (blockTargets: BlockTarget[]) => void): void {
        /* stop observing if exists */
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        this.mutationObserver = new MutationObserver((_records: MutationRecord[]) => {
            const prevNumTargets = this.blockTargetsCache.size;
            const currTargetElements = document.getElementsByClassName('g');
            if (prevNumTargets !== currTargetElements.length) {
                const blockTargets = this.getTargets(Array.from(currTargetElements));
                onAdded(blockTargets);
            }
            return;
        });

        this.mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
}
