import json, os
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, PartitionKey

load_dotenv()

ENDPOINT = os.getenv("COSMOS_ENDPOINT")
KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "AiTutorDB"
CONTAINER_NAME = "AiTutor"

client = CosmosClient(url=ENDPOINT, credential=KEY)
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)

container.upsert_item({
    'id': "1",
    "documentType": "paper",
    "topic": "english",
    "content": "BLOB URI"
})

for item in container.query_items(
        query='SELECT * FROM c',
        enable_cross_partition_query=True):
    print(json.dumps(item, indent=True))
        