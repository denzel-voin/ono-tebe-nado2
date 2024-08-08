import { Model } from '../base/Model';
import { ILot } from '../../types';
import _ from 'lodash';
import { Lot } from './Item';

export interface IBasket {
	activeLots: Lot[];
	closedLots: Lot[];
	setItems(item: Lot): void;
}

export class Basket extends Model<ILot> implements IBasket {
	activeLots: Lot[] = [];
	closedLots: Lot[] = [];

	setItems(item: Lot ) {
		if (item.status === 'active') {
			this.activeLots.push(<Lot>_.pick(item,
				['id', 'image', 'title', 'price', 'myLot', 'status']));
		} else {
			this.closedLots.push(<Lot>_.pick(item,
				['id', 'image', 'title', 'price', 'myLot', 'status']));
		}

		this.emitChanges('basket.items:changed', {
			activeLots: this.activeLots,
			closedLots: this.closedLots
		})
	}
}
