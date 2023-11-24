const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

let client;
let database;
let container;

function setupCosmosDB() {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;

    client = new CosmosClient({ endpoint, key });

    const databaseId = process.env.COSMOS_DB_DATABASE_ID;
    database = client.database(databaseId);

    const userContainerId = process.env.COSMOS_DB_USER_CONTAINER_ID;
    userContainer = database.container(userContainerId);

    const noteContainerId = process.env.COSMOS_DB_NOTE_CONTAINER_ID;
    noteContainer = database.container(noteContainerId);
}

module.exports = {
    setupCosmosDB,
    getClient: () => client,
    getDatabase: () => database,
    getUserContainer: () => userContainer,
    getNoteContainer: () => noteContainer,
};
