import { connect } from '../src/db';

export interface Book {
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};


// Function to filter books based on price range
async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    const db = await connect();
    const query: any = {};
    const collection = db.collection('books') || null;

    if (filters && filters.length > 0) {
        query.price = {
            $and: filters.map(filter => ({
                $gte: filter.from ?? 0,
                $lte: filter.to ?? Number.MAX_VALUE
            }))
        };
    }

    try {
        const result = await collection.find(query).toArray();
        return result.map(doc => ({
            id: doc._id.toString(),
            name: doc.name,
            author: doc.author,
            description: doc.description,
            price: doc.price,
            image: doc.image
        }));
    } catch (error) {
        console.error("Failed to fetch books:", error);
        return [];
    }
}


const assignment = "assignment-1";

export default {
    assignment,
    listBooks
};