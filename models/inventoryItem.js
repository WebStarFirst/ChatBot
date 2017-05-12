'use strict';

const db = require('../db');
const Button = require('../botapi/structure_content/structured_content').Button;
const GenericElement = require('../botapi/structure_content/structured_content').GenericElement;
const NodeCache = require("node-cache");
const itemsCache = new NodeCache();
const logger = require('../logger');

const TYPE = {
	PRODUCT: 'PRODUCT',
	VARIANT: 'VARIANT',
	COMPLEX: 'COMPLEX',
};

const modelName = 'InventoryItem';

let Model = db.sequelize.define(modelName, {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	title: {
		type: db.Sequelize.STRING,
		allowNull: false,
	},

	description: {
		type: db.Sequelize.TEXT,
		allowNull: false,
		defaultValue: '',
	},

	price: {
		type: db.Sequelize.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0.0,
	},

	quantity: {
		type: db.Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},

	image: {
		type: db.Sequelize.TEXT,
		allowNull: false,
	},

	item_type: {
		type: db.Sequelize.ENUM(TYPE.PRODUCT, TYPE.VARIANT, TYPE.COMPLEX),
		allowNull: false,
		defaultValue: TYPE.PRODUCT,
	},

}, {
	tableName: 'inventory_order_items',
	indexes: [
		{
			name: 'index_inventory_order_items_on_price',
			unique: false,
			method: 'BTREE',
			fields: ['price'],
		},
		{
			name: 'index_inventory_order_items_on_quantity',
			unique: false,
			method: 'BTREE',
			fields: ['quantity'],
		},
		{
			name: 'index_inventory_order_items_on_title',
			unique: false,
			method: 'BTREE',
			fields: ['title'],
		},
	],

	instanceMethods: {

		getStructuredObject() {

			return new GenericElement({
				title: this.get('title'),
				item_url: "",
				image_url: this.get('image'),
				subtitle: this.get('description'),
			})
				.addButton(
					new Button({
						action: this.get('id'),
						title: `Buy ${this.get('price')}$`,
						type: Button.POSTBACK,
					})
				)
		},

		// get product variants from cache
		getProductVariants() {
			// return new Promise((resolve, reject) => {
			let ids = [];
			itemsCache.get('variantsRelation').forEach(item => {
				if (this.get('id') === item.id) {
					ids.push(item.VariantId);
				}
			});

			return itemsCache.get(modelName).filter(item => {
				return ids.indexOf(item.get('id')) >= 0;
			});

			// })
		},

	},

	classMethods: {

		type: TYPE,

		__getAllItems() {
			return new Promise((resolve, reject) => {
				if (itemsCache.get(modelName)) {
					console.log('InventoryItem', '__getAllItems resolve itemsCache.get(modelName)', itemsCache.get(modelName) );
					resolve(itemsCache.get(modelName));
					return;
				}
				Model.findAll({
					order: 'id',
				})
					.then(items => {
						itemsCache.set(modelName, items);
						logger.info(`Cached ${items.length} items`);
						db.sequelize.query('SELECT * FROM "InventoryItemsVariants"',
							{ type: db.sequelize.QueryTypes.SELECT})
							.then((variantsRelation) => {
								itemsCache.set('variantsRelation', variantsRelation);
								logger.info(`Cached ${variantsRelation.length} variantRelations`);
								db.sequelize.query('SELECT * FROM "InventoryItemsComplexProducts"',
									{ type: db.sequelize.QueryTypes.SELECT})
									.then((complexProductRelation) => {
										itemsCache.set('complexProductRelation', complexProductRelation);
										logger.info(`Cached ${variantsRelation.length} complexRelations`);
										console.log('InventoryItem', '__getAllItems resolve variantsRelation', variantsRelation );
										resolve(items);
									}).catch(reject);
							}).catch(reject);
					}).catch(reject)
			});
		},

		// get all products from cache
		getItems() {
			return new Promise((resolve, reject) => {
				Model.__getAllItems()
					.then(items => {
						console.log('InventoryItem', 'Model.__getAllItems()' );
						resolve(items.filter(item => item.get('item_type') === TYPE.PRODUCT));
					})
					.catch(reject)
			});
		},

		/**
		 * Get products for displaying in bot.
		 * @param startId
		 * @param pageSize
		 * @returns {Promise}
		 */
		getPage(startId, pageSize) {
			return new Promise((resolve, reject) => {
				Model.getItems().then(items => {
					console.log('InventoryItem', 'Model.getItems().then(items => {' );
					let i = 0;
					resolve(items.filter(item => {
						let predicate = item.get('id') > startId && i < pageSize;
						if (predicate) {
							i++;
						}
						return predicate;
					}))
				}).catch(reject);
			})
		},

	},
timestamps  : true,
underscored : true
});

module.exports = Model;
