# GraphQL API

## Endpoint

`/graphql`

Apollo Sandbox is available at:

http://localhost:5000/graphql

## Product Query Example

```graphql
query GetProducts {
  products {
    _id
    name
    price
    image
    description
    category
    brand
    stock
    averageRating
    reviewCount
  }
}
```

## Product Mutation Example

```graphql
mutation CreateProduct {
  createProduct(
    name: "Sample Product"
    price: 99.99
    image: "https://example.com/image.png"
    description: "A sample product"
    category: "General"
    brand: "DemoBrand"
    stock: 10
  ) {
    _id
    name
    price
  }
}
```

## User Query Example

```graphql
query GetUsers {
  users {
    _id
    name
    email
    avatar
  }
}
```

## Order Query Example

```graphql
query {
  orders {
    _id
    totalAmount
    paymentStatus
  }
}
```
