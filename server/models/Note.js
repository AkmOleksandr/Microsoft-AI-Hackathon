const { getContainer } = require('../config/dbConfig');

class User {
	constructor(title, url, summary) {
		this.title = title;
    	this.url = url;
        this.summary = summary;
  	}

  	async save() {
    	await getContainer().items.create(this);
  	}

  	static async findByTitle(title) {
    	const querySpec = {
			query: 'SELECT * FROM c WHERE c.title = @title',
			parameters: [{ name: '@title', value: title }],
    };

		const { resources } = await getNoteContainer().items.query(querySpec).fetchAll();
		return resources[0] || null;
  	}
}

module.exports = User;
