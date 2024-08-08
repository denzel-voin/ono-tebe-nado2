import { Component } from '../base/Component';
import { createElement, ensureElement } from '../../utils/utils';
import { ILot, ILotItem } from '../../types';
import { ICatalog } from '../model/Catalog';
import { Modal } from '../common/Modal';
import { EventEmitter, IEvents } from '../base/events';
import { Lot } from '../model/Item';

export interface IItemConstructor {
	new(events: IEvents): Component<ILotItem>;
}

export class CatalogView extends Component<ICatalog> {
	constructor(protected Item: IItemConstructor, private events: IEvents) {
		super(createElement('ul'));
		this.container.className = 'catalog__items';
	}

	set items(items: ILotItem[]) {
		this.container.replaceChildren(...items.map(item => {
			const itemView = new this.Item(this.events);
			return itemView.render(item);
		}))
	}
}

export class ItemView extends Component<ILot> {
	protected id: string;
	protected content: HTMLElement;
	protected itemTitle: HTMLElement;
	protected itemImage: HTMLImageElement;
	protected description: HTMLElement;
	protected foot: HTMLElement;
	protected button: HTMLButtonElement;
	protected itemStatus: HTMLElement;
	private events: IEvents;

	constructor(events: IEvents) {
		super(createElement('li'));
		this.container.className = 'card';
		this.events = events;

		this.content = createElement('div');
		this.content.className = 'card__content';
		this.container.append(this.content);

		this.itemTitle = createElement('h3');
		this.itemTitle.className = 'card__title';
		this.content.append(this.itemTitle);

		this.itemImage = createElement('img');
		this.itemImage.className = 'card__image';
		this.container.append(this.itemImage);

		this.description = createElement('p');
		this.description.className = 'card__description';
		this.content.append(this.description);

		this.foot = createElement('div');
		this.foot.className = 'card__foot';
		this.container.append(this.foot);

		this.button = createElement('button');
		this.button.className = 'button';
		this.button.textContent = 'Сделать ставку';
		this.button.addEventListener('click', this.onClick);
		this.foot.append(this.button);

		this.itemStatus = createElement('span');
		this.itemStatus.className = 'card__status';
		this.foot.append(this.itemStatus);
	}


	onClick = () => {
		this.events.emit('item:click', { id: this.id });
	}

	set title(value: string) {
		this.setText(this.itemTitle, value);
	}

	set image(value: string) {
		this.setImage(this.itemImage, value);
	}

	set about(value: string) {
		this.setText(this.description, value);
	}

	set status(value: string) {
		if (value === 'active') this.itemStatus.className = 'card__status card__status_active';
		if (value === 'closed') this.itemStatus.className = 'card__status card__status_closed';
	}

	set datetime(value: string) {
		this.setText(this.itemStatus, value);
	}
}

export class LotView extends Modal {
	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);
	}

	renderLot(lot: Lot): HTMLElement {

		const formBid = lot.status === 'active'? `
			<form class="form lot__bid">
      	<label class="form__label form__label_grouped lot__bid-amount">
         <input class="form__input" type="text" placeholder="Ваша ставка" />
        </label>
        <button class="button">Поставить</button>
      </form>` : '';

		const history = lot.history.length > 0 ?
			`<div class="lot__history">
        <span class="lot__history-caption">Последние ставки:</span>
        <ul class="lot__history-bids">
          ${lot.history.map(bid => `<li class="lot__history-item">${bid}</li>`).join('')}
        </ul>
      </div>` : '';

		const description = lot.description.split('\n');

		const lotContent = `
                <img class="lot__image" src="${lot.image}" alt="${lot.title}"/>
                <div class="lot__status">
                    <span class="lot__status-timer">${lot.datetime}</span>
                </div>
                ${formBid}
                ${history}
                <div class="lot__content">
                    <h1 class="lot__title">${lot.title}</h1>
                    ${description.map(el => `<p class="lot__description">${el}</p>`).join('')}
                </div>
        `;

		const contentElement = document.createElement('article');
		contentElement.className = 'lot';
		contentElement.innerHTML = lotContent;
		this.content = contentElement;
		this.open();
		return this.container;
	}
}
