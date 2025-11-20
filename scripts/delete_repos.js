const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://root:sapassword@devgo-docgo-cluster0.hsudzga.mongodb.net/?retryWrites=true&w=majority&appName=devgo-docgo-cluster0';
const client = new MongoClient(url);

// Database Name
const dbName = 'docgo';

async function main() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection('repositories');

        // Find all documents
        const allRepos = await collection.find({}).toArray();
        console.log(`Found ${allRepos.length} repositories.`);

        let deletedCount = 0;
        let keptCount = 0;

        for (const repo of allRepos) {
            // Check if name matches "archive" (case insensitive)
            if (repo.name && repo.name.toLowerCase().includes('archive')) {
                console.log(`Keeping repository: ${repo.name} (ID: ${repo._id})`);
                keptCount++;
            } else {
                console.log(`Deleting repository: ${repo.name} (ID: ${repo._id})`);
                await collection.deleteOne({ _id: repo._id });
                deletedCount++;
            }
        }

        console.log('------------------------------------------------');
        console.log(`Operation complete.`);
        console.log(`Deleted: ${deletedCount}`);
        console.log(`Kept: ${keptCount}`);

    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
    }
}

main();
