import { gql } from "@apollo/client";

export const WAREHOUSE_LIST = gql`
  query WarehouseList {
    warehouses(first: 20) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const ORDER_FULFILL_DATA = gql`
  query OrderFulfillData($orderId: ID!) {
    order(id: $orderId) {
      id
      lines {
        id
        quantityToFulfill
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query MyQuery {
    products(search: "", first: 100) {
      pageInfo {
        startCursor
        endCursor
      }
      totalCount
      edges {
        node {
          id
          name
          images {
            url
          }
        }
      }
    }
  }
`;

export const GET_CHANNELS = gql`
  query publicChannels {
    publicChannels {
      currencyCode
      id
      name
      slug
    }
  }
`;

export const USER_DETAILS_QUERY = gql`
  query UserDetails {
    me {
      id
      email
      firstName
      lastName
      isStaff
      dateJoined
      restrictedAccessToChannels
      metadata {
        key
        value
      }
      userPermissions {
        code
        name
      }
      avatar {
        url
      }
      accessibleChannels {
        id
        isActive
        name
        slug
        currencyCode
        defaultCountry {
          code
          country
        }
        stockSettings {
          allocationStrategy
        }
      }
    }
  }
`;

export const PRODUCT_LIST_QUERY = gql`
  query ProductList(
    $first: Int
    $after: String
    $filter: ProductFilterInput
    $sort: ProductOrder
    $channel: String
  ) {
    products(
      first: $first
      after: $after
      filter: $filter
      sortBy: $sort
      channel: $channel
    ) {
      edges {
        node {
          id
          name
          slug
          productType {
            id
            name
          }
          variants {
            id
            name
            sku
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          media {
            url
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const ORDER_LIST_QUERY = gql`
  query OrderList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: OrderFilterInput
    $sort: OrderSortingInput
  ) {
    orders(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          __typename
          created
          id
          number
          paymentStatus
          status
          isPaid
          payments {
            id
            chargeStatus
          }
          lines {
            id
            quantity
            variant {
              id
              product {
                name
                id
                collections {
                  name
                  id
                }
                category {
                  id
                  name
                }
              }
            }
            productName
          }
          total {
            __typename
            gross {
              __typename
              amount
              currency
            }
          }
          userEmail
          chargeStatus
          deliveryDate
          deliverySlot
          billingAddress {
            firstName
            phone
            lastName
            streetAddress1
          }
          canFinalize
          errors {
            code
            message
          }
          collectionPointName
          channel {
            name
            id
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_DRAFT_ORDERS = gql`
  query GetDraftOrders {
    draftOrders(first: 20, sortBy: { direction: DESC, field: CREATED_AT }) {
      edges {
        node {
          id
          number
          created
          billingAddress {
            firstName
            lastName
          }
          total {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_VARIANTS = gql`
  query GetProductVariants($id: ID!, $channel: String!) {
    product(id: $id, channel: $channel) {
      id
      name
      variants {
        id
        name
        pricing {
          price {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  }
`;

export const ORDER_DETAILS_WITH_METADATA = gql`
  query OrderDetailsWithMetadata($id: ID!) {
    order(id: $id) {
      ...OrderDetailsWithMetadata
    }
    shop {
      defaultWeightUnit
      fulfillmentAllowUnpaid
      fulfillmentAutoApprove
      availablePaymentGateways {
        ...PaymentGateway
      }
    }
  }

  fragment OrderDetailsWithMetadata on Order {
    id
    created
    number
    status
    lines {
      id
      productName
      quantity
      unitPrice {
        gross {
          amount
          currency
        }
      }
      variantName
      variant {
        id
        product {
          id
        }
      }
    }
    shippingAddress {
      firstName
      lastName
      streetAddress1
      city
      postalCode
      country {
        code
        country
      }
    }
    billingAddress {
      firstName
      lastName
      streetAddress1
      city
      postalCode
      country {
        code
        country
      }
    }
    metadata {
      key
      value
    }
  }

  fragment PaymentGateway on PaymentGateway {
    id
    name
    config {
      field
      value
    }
  }
`;

export const SEARCH_CUSTOMER_QUERY = gql`
  query SearchCustomers($after: String, $first: Int!, $query: String!) {
    search: customers(
      after: $after
      first: $first
      filter: { search: $query }
    ) {
      edges {
        node {
          id
          firstName
          lastName
          phoneNumber
          addresses {
            streetAddress1
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CUSTOMER_ADDRESSES = gql`
  query customerAddress($id: ID!) {
    user(id: $id) {
      addresses {
        city
        firstName
        lastName
        country {
          code
        }
        phone
        companyName
        postalCode
        cityArea
        streetAddress1
        streetAddress2
      }
      defaultBillingAddress {
        city
        firstName
        lastName
        phone
        postalCode
        companyName
        country {
          code
        }
        countryArea
        streetAddress1
        streetAddress2
      }
      defaultShippingAddress {
        city
        companyName
        firstName
        lastName
        country {
          code
        }
        phone
        postalCode
        countryArea
        streetAddress1
        streetAddress2
      }
    }
  }
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods($id: ID!) {
    order(id: $id) {
      id
      shippingMethods {
        id
        name
        price {
          amount
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories(first: 20) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: ID!) {
    products(first: 100, filter: { categories: [$categoryId] }) {
      edges {
        node {
          id
          name
          images {
            url
          }
        }
      }
    }
  }
`;

export const CUSTOMER_DETAILS = gql`
  query CustomerDetails($id: ID!) {
    user(id: $id) {
      email
      id
      addresses {
        firstName
        lastName
        id
        companyName
        cityArea
        city
        phone
        streetAddress1
        postalCode
      }
    }
  }
`;

export const MONTH_TOTAL_ORDERS = gql`
  query MyQuery($gte: Date!, $lte: Date!) {
    orders(filter: { created: { gte: $gte, lte: $lte } }) {
      totalCount
    }
  }
`;

export const CHECKOUT_SHIPPING_METHODS_QUERY = gql`
  query CheckoutShippingMethods($channelSlug: String!) {
    channel(slug: $channelSlug) {
      availableShippingMethodsPerCountry(countries: IN) {
        shippingMethods {
          id
          name
        }
      }
    }
  }
`;
