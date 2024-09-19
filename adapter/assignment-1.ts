import { connect } from "../db"


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
    const collection = db.collection<Book>('books');

    let query = {};
    if (filters && filters.length > 0) {
        query = {
            $or: filters.map(filter => ({
                price: {
                    $gte: filter.from ?? 0,
                    $lte: filter.to ?? Number.MAX_VALUE
                }
            }))
        };
    }

    return await collection.find(query).toArray();

}


const assignment = "assignment-1";

export default {
    assignment,
    listBooks
};