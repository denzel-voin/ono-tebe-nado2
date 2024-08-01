import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import { Component } from './components/base/Component';
import { createElement, ensureElement } from './utils/utils';
import { Model } from './components/base/Model';
import _, { map, pick } from 'lodash';
import { IBid, ILot, ILotItem, LotStatus } from './types';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
interface ICatalog {
  items: ILot[];
}

interface IBasket {
  activeLots: Lot[];
  closedLots: Lot[];
}

// Модель данных приложения

class Basket extends Model<ILot> implements IBasket {
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

class Lot extends Model<ILot> implements ILot {
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

  setItems(item: ILot) {
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


  setBid(bid: IBid) {
    if (bid.price >= this.price) {
      api.placeBid(this.id, bid)
        .then(result => {
          if (result.price > this.price) this.myLot = true;
          this.history = result.history;
          this.price = result.price;
          if (bid.price >= this.minPrice * 10) {
            this.datetime = 'Аукцион завершён';
            this.status = 'closed';
            this.history = [];
          }
          basket.setItems(this);
        })
        .catch(err => {
          console.error(err);
        });
    }
    else console.log('Ставка должна быть выше предыдущей');
  }

}

class Catalog extends Model<ICatalog> implements ILot {
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

// interface IItemConstructor {
//   new(): Component<ILotItem>;
// }

// class CatalogView extends Component<ICatalog> {
//   constructor(protected Item: IItemConstructor) {
//     super(createElement('ul'));
//     this.container.className = 'catalog__items';
//   }
//
//   set items(items: ILotItem[]) {
//     this.container.replaceChildren(...items.map(item => {
//       const itemView = new this.Item();
//       return itemView.render(item);
//     }))
//   }
// }

// class ItemView extends Component<ILot> {
//   id: string;
//
//   protected content: HTMLElement;
//   protected itemTitle: HTMLElement;
//   protected itemImage: HTMLImageElement;
//   protected description: HTMLElement;
//   protected foot: HTMLElement;
//   protected button: HTMLButtonElement;
//   protected itemStatus: HTMLElement;
//
//   constructor() {
//     super(createElement('li'));
//     this.container.addEventListener('click', this.onClick);
//     this.container.className = 'card';
//
//     this.content = createElement('div');
//     this.content.className = 'card__content';
//     this.container.append(this.content);
//
//     this.itemTitle = createElement('h3');
//     this.itemTitle.className = 'card__title';
//     this.content.append(this.itemTitle);
//
//     this.itemImage = createElement('img');
//     this.itemImage.className = 'card__image';
//     this.container.append(this.itemImage);
//
//     this.description = createElement('p');
//     this.description.className = 'card__description';
//     this.content.append(this.description);
//
//     this.foot = createElement('div');
//     this.foot.className = 'card__foot';
//     this.container.append(this.foot);
//
//     this.button = createElement('button');
//     this.button.className = 'button';
//     this.button.textContent = 'Сделать ставку';
//     this.foot.append(this.button);
//
//     this.itemStatus = createElement('span');
//     this.itemStatus.className = 'card__status';
//     this.foot.append(this.itemStatus);
//   }
//
//   protected onClick = () => {
//     alert(`Click on ${this.id}`);
//   }
//
//   set title(value: string) {
//     this.setText(this.itemTitle, value);
//   }
//
//   set image(value: string) {
//     this.setImage(this.itemImage, value);
//   }
//
//   set about(value: string) {
//     this.setText(this.description, value);
//   }
//
//   set status(value: string) {
//     if (value === 'active') this.itemStatus.className = 'card__status card__status_active';
//     if (value === 'closed') this.itemStatus.className = 'card__status card__status_closed';
//   }
//
//   set datetime(value: string) {
//     this.setText(this.itemStatus, `${new Date(value).getDate()} июля ${new Date(value).getHours()}:00`);
//   }
// }

const root = ensureElement('main .catalog__items');
const catalog = new Catalog({
  items: []
}, events);

const lot = new Lot({}, events);
const basket = new Basket({}, events);

// const catalogView = new CatalogView(ItemView);
// root.append(catalogView.render());
// events.on('catalog.items:changed', () => {
//   catalogView.render(catalog);
// })

// Глобальные контейнеры

// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно


// Получаем лоты с сервера
api.getLotList()
    .then(result => {
        // вместо лога поместите данные в модель
      catalog.setItems(result);
    })
    .catch(err => {
        console.error(err);
    });


api.getLotItem('c101ab44-ed99-4a54-990d-47aa2bb4e7d9')
  .then(result => {
    // вместо лога поместите данные в модель
    lot.setItems(result);
    lot.setBid({price: 710});
  })
  .catch(err => {
    console.error(err);
  });
