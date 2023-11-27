const { getNoteContainer } = require('../config/dbConfig');

class Note {
	constructor(title, url, summary) {
		this.title = title;
    	this.url = url;
        this.summary = summary;
  	}

  	async save() {
    	await getNoteContainer().items.create(this);
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

module.exports = Note;
