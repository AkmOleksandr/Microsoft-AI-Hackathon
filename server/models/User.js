const { getContainer } = require('../config/dbConfig');

class User {
	constructor(username, passwordHash) {
		this.username = username;
    	this.passwordHash = passwordHash;
  	}

  	async save() {
    	await getContainer().items.create(this);
  	}

  	static async findByUsername(username) {
    	const querySpec = {
			query: 'SELECT * FROM c WHERE c.username = @username',
			parameters: [{ name: '@username', value: username }],
    };

		const { resources } = await getUserContainer().items.query(querySpec).fetchAll();
		return resources[0] || null;
  	}
}

module.exports = User;
