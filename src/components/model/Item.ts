import { Model } from '../base/Model';
import { IBid, ILot, LotStatus, LotUpdate } from '../../types';
import { IAuctionAPI } from '../AuctionAPI';
import { IBasket } from './Basket';

export class Lot extends Model<ILot> implements ILot {
	about: string;
	datetime: string;
	description: string;
	history: number[] = [];
	id: string;
	image: string;
	minPrice: number;
	price: number;
	status: LotStatus;
	title: string;
	myLot: boolean;

	setItem(item: ILot) {
		this.datetime = item.datetime;
		this.status = item.status;
		this.id = item.id;
		this.history = item.history;
		this.about = item.about;
		this.description = item.description;
		this.history = item.history;
		this.image = item.image;
		this.minPrice = item.minPrice;
		this.price = item.price;
		this.title = item.title;
		this.myLot = false;
		this.setTime();

		this.emitChanges('item:changed', {
			item: this
		})
	}

	setTime() {
		let state: string = 'Откроется';
		const months = [
			"января", "февраля", "марта", "апреля", "мая", "июня",
			"июля", "августа", "сентября", "октября", "ноября", "декабря"
		];
		const day = new Date(this.datetime).getDate();
		const month = months[new Date(this.datetime).getMonth()];
		const hours = new Date(this.datetime).getHours();

		if (this.status === 'active') state = 'Открыто';
		if (this.status === 'closed') state = 'Закрыто';

		this.datetime = `${state} ${day} ${month} ${hours}:00`;
	}


	setBid(bid: IBid, callback: IAuctionAPI, container: IBasket) {
		if (bid.price >= this.price) {
			callback.placeBid(this.id, bid)
				.then(result => {
					if (result.price > this.price) this.myLot = true;
					this.history = result.history;
					this.price = result.price;
					if (bid.price >= this.minPrice * 10) {
						this.datetime = 'Аукцион завершён';
						this.status = 'closed';
						this.history = [];
					}
					container.setItems(this);
				})
				.catch(err => {
					console.error(err);
				});
		}
		else console.log('Ставка должна быть выше предыдущей');
	}
}

