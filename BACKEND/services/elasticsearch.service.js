import client from '../config/elasticsearch.js';

const INDEX_NAME = 'products';

/**
 * Upserts a product document in Elasticsearch.
 * @param {Object} product - The Mongoose product document
 */
export const indexProduct = async (product) => {
    if (!client) return;
    try {
        await client.index({
            index: INDEX_NAME,
            id: product._id.toString(),
            document: {
                name: product.name,
                description: product.description,
                category: product.category,
                brand: product.brand,
                tags: product.tags,
                price: product.price,
                isDeleted: product.isDeleted,
                image: product.image,
                averageRating: product.averageRating,
                reviewCount: product.reviewCount
            }
        });
    } catch (error) {
        console.error("Elasticsearch indexing error:", error.message);
    }
};

/**
 * Removes a product document from Elasticsearch.
 * @param {String} productId - The ID of the product
 */
export const deleteProductFromIndex = async (productId) => {
    if (!client) return;
    try {
        await client.delete({
            index: INDEX_NAME,
            id: productId.toString()
        });
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            return; // Document already deleted
        }
        console.error("Elasticsearch deletion error:", error.message);
    }
};

/**
 * Searches for products using Elasticsearch.
 * @param {String} queryText - The search query
 * @returns {Array|null} Array of matching product documents or null if client is unavailable
 */
export const searchProductsES = async (queryText) => {
    if (!client) return null;
    try {
        const response = await client.search({
            index: INDEX_NAME,
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: queryText,
                                fields: ['name^3', 'brand^2', 'category', 'description', 'tags'],
                                fuzziness: 'AUTO'
                            }
                        }
                    ],
                    filter: [
                        { term: { isDeleted: false } }
                    ]
                }
            }
        });
        
        // Format hits to resemble MongoDB documents
        return response.hits.hits.map(hit => ({
            _id: hit._id,
            ...hit._source
        }));
    } catch (error) {
        console.error("Elasticsearch search error:", error.message);
        return null;
    }
};
