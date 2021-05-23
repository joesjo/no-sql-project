const neo4j = require('neo4j-driver')
const driver = neo4j.driver('bolt://localhost:7687/', neo4j.auth.basic('neo4j', 'password'))
const util = require('util')

exports.getRecipe = (recipeId) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = `
            MATCH (r:Recipe)-[rel:CONTAINS]->(i:Ingredient) WHERE id(r) = $id
            CALL {
                WITH i
                MATCH (i)-[:IS]->(p:Product)
                RETURN p
                ORDER BY p.price
                LIMIT 1
            }
            RETURN r AS recipe, i AS ingredient, rel.amount AS grams, p AS product, 
                toInteger(round(toFloat(p.price) * (toFloat(rel.amount) / 100.0))) AS cost, 
                toInteger(round(toFloat(i.calories) * (toFloat(rel.amount) / 100.0))) as calories,
                toInteger(round(toFloat(i.protein) * (toFloat(rel.amount) / 100.0))) as protein;
        `
        const parameters = {
            id: parseInt(recipeId)
        }

        session.run(query, parameters)
        .then(res => {
            session.close()
            let recipe = res.records[0].get('recipe')
            resolve(
                {
                    recipe: {
                        identity: recipe.identity.low,
                        ...recipe.properties
                    },
                    ingredients: res.records.map(record => ({
                        ingredient: {
                            identity: record.get('ingredient').identity.low,
                            ...record.get('ingredient').properties
                        },
                        amount: record.get('grams').low,
                        product: {
                            identity: record.get('product').identity.low,
                            ...record.get('product').properties
                        },
                        cost: record.get('cost').low
                    })),
                    totalCost: res.records.reduce((acc, cur) => acc + cur.get('cost').low, 0),
                    totalCalories: res.records.reduce((acc, cur) => acc + cur.get('calories').low, 0),
                    totalProtein: res.records.reduce((acc, cur) => acc + cur.get('protein').low, 0)
                }
            )
        })
        .catch(err => reject(err))
    })
}

exports.getIngredientPrices = (ingredientId) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = 'MATCH (i:Ingredient)-[:IS]->(p:Product) WHERE id(i) = $id RETURN i, p'
        const parameters = {
            id: parseInt(ingredientId)
        }

        session.run(query, parameters)
        .then(res => {
            session.close()
            let ingredient = res.records[0].get('i')
            let result = {
                ingredient: {
                    identity: ingredient.identity.low,
                    ...ingredient.properties
                },
                products: res.records.map(item => ({
                    identity: item.get('p').identity.low,
                    ...item.get('p').properties
                }))
            }
            resolve(result)
        })
        .catch(err => reject(err))
    })
}

exports.getUser = (userId) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = 'MATCH (user:User)-[rel:LIKE|DISLIKE]->(n) WHERE id(user) = $id RETURN user, rel, n'
        const parameters = {
            id: parseInt(userId)
        }
        session.run(query, parameters)
        .then(res => {
            session.close()
            let user = res.records[0].get('user')
            let likeArray = []
            let dislikeArray = []
            res.records.forEach(record => {
                item = record.get('n')
                formatted = {
                    identity: item.identity.low,
                    type: item.labels[0],
                    ...item.properties
                }
                if (record.get('rel').type === 'LIKE') {
                    likeArray = [...likeArray, formatted]
                } else if (record.get('rel').type === 'DISLIKE') {
                    dislikeArray = [...dislikeArray, formatted]
                }
            })
            resolve({
                user: {
                    identity: user.identity.low,
                    ...user.properties
                },
                likes: likeArray,
                dislikes: dislikeArray
            })
        })
        .catch(err => reject(err))
    })
}

exports.getNodes = (nodeLabel) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = `MATCH (n:${nodeLabel}) return n;`

        session.run(query)
        .then(res => {
            session.close()
            resolve(res.records.map(item => ({
                identity: item.get('n').identity.low,
                ...item.get('n').properties
            })))
        })
        .catch(err => reject(err))
    })
}

exports.createNode = (nodeLabel, properties) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = `MERGE (n:${nodeLabel}${util.inspect(properties)}) return n;`

        session.run(query)
        .then(response => resolve(response.records[0].get('n')))
        .catch(err => reject(err))
    })
}

exports.createRelationship = (firstId, secondId, relationshipLabel, relationshipProperties = {}) => {
    return new Promise((resolve, reject) => {
        const session = driver.session({database:"neo4j"})
        const query = `
            MATCH (i), (j)
            WHERE id(i) = ${firstId} AND id(j) = ${secondId}
            MERGE (i)-[r:${relationshipLabel}${util.inspect(relationshipProperties)}]->(j)
            RETURN i, r, j;
        `
        
        session.run(query)
        .then(response => resolve(response.records[0]))
        .catch(err => reject(err))
    })
}

getItemLabel = (record) => {
    return record._fields[0].labels[0]
}

getItemId = (record) => {
    return record._fields[0].identity.low
}

getItemProperties = (record) => {
    return record._fields[0].properties
}