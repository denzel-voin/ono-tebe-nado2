import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import { EventEmitter } from './components/base/events';
import { ensureElement } from './utils/utils';
import { Basket } from './components/model/Basket';
import { Lot } from './components/model/Item';
import { Catalog } from './components/model/Catalog';
import { CatalogView, ItemView, LotView } from './components/View/ViewCatalog';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

const root = ensureElement('main .catalog__items');
const catalog = new Catalog({
  items: []
}, events);

const container = ensureElement('#modal-container');
const lotView = new LotView(container, events);


const lot = new Lot({}, events);
const basket = new Basket({}, events);

const catalogView = new CatalogView(ItemView, events);
root.append(catalogView.render());

events.on('catalog.items:changed', () => {
  catalogView.render(catalog);
})

events.on('item:click', (data: {id: string}) => {
  api.getLotItem(data.id)
    .then(result => {
      lot.setItem(result);
      lotView.renderLot(lot);
    })
    .catch(err => {
      console.error(err);
    });
});

api.getLotList()
    .then(result => {
      catalog.setItems(result);
    })
    .catch(err => {
        console.error(err);
    });
