import { ILot, LotStatus } from '../../types';
import { Model } from '../base/Model';
import _ from 'lodash';

export interface ICatalog {
	items: Partial<ILot>[];
}

export class Catalog extends Model<ICatalog> implements ILot {
	price: number;
	minPrice: number;
	id: string;
	title: string;
	about: string;
	image: string;
	items: Partial<ILot>[];
	datetime: string;
	status: LotStatus;

	setItems(items: ILot[]) {
		this.items = items.map(item => _.pick(item,
			['status', 'datetime', 'id', 'about', 'image', 'title']));
		this.setTime();
		this.emitChanges('catalog.items:changed', {
			items: this.items
		})
	}

	setTime() {
		let state: string = 'Откроется';
		const months = [
			"января", "февраля", "марта", "апреля", "мая", "июня",
			"июля", "августа", "сентября", "октября", "ноября", "декабря"
		];

		this.items.forEach(item => {
			const day = new Date(item.datetime).getDate();
			const month = months[new Date(item.datetime).getMonth()];
			const hours = new Date(item.datetime).getHours();

			if (item.status === 'active') state = 'Открыто';
			if (item.status === 'closed') state = 'Закрыто';

			item.datetime = `${state} ${day} ${month} ${hours}:00`;
		})
	}
}
