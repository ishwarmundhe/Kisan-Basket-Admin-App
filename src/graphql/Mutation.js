import { gql } from "@apollo/client";

export const TOKEN_AUTH = gql`
  mutation TokenAuth($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      errors {
        field
        message
      }
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation refreshToken($refreshToken: String!) {
    tokenRefresh(refreshToken: $refreshToken) {
      token
      errors {
        code
        field
        message
      }
    }
  }
`;

export const ORDER_LINE_ADD = gql`
  mutation MyMutation($id: ID!, $input: [OrderLineCreateInput!]!) {
    orderLinesCreate(id: $id, input: $input) {
      errors {
        addressType
        field
        message
      }
      order {
        id
        lines {
          id
          metadata {
            key
            value
          }
          productName
          quantity
          totalPrice {
            gross {
              amount
            }
          }
        }
      }
    }
  }
`;

export const ORDER_DRAFT_FINALIZE = gql`
  mutation OrderDraftFinalize($id: ID!, $date: Date, $slot: String) {
    draftOrderComplete(id: $id, date: $date, slot: $slot) {
      errors {
        addressType
        field
        message
      }
      order {
        created
        deliveryMethod {
          ... on ShippingMethod {
            id
            name
            price {
              amount
              currency
            }
          }
        }
        userEmail
        chargeStatus
        actions
        channel {
          name
        }
      }
    }
  }
`;

export const ORDER_DRAFT_UPDATE = gql`
  mutation OrderDraftUpdate($id: ID!, $input: DraftOrderInput!) {
    draftOrderUpdate(input: $input, id: $id) {
      errors {
        addressType
        code
        message
        orderLines
      }
      order {
        created
        id
        lines {
          productName
          quantity
          totalPrice {
            gross {
              amount
            }
          }
          variantName
        }
        billingAddress {
          city
          cityArea
          companyName
          country {
            code
            country
          }
          countryArea
          firstName
          lastName
          metadata {
            key
            value
          }
          phone
          postalCode
          streetAddress1
          streetAddress2
        }
        payments {
          availableCaptureAmount {
            amount
          }
          created
          transactions {
            created
            id
            amount {
              amount
              currency
            }
          }
          paymentMethodType
        }
        shippingAddress {
          city
          cityArea
          companyName
          country {
            code
            country
          }
          countryArea
          firstName
          lastName
          phone
          postalCode
          streetAddress1
          streetAddress2
        }
        shippingMethodName
        status
        subtotal {
          currency
          gross {
            amount
          }
          net {
            amount
          }
          tax {
            amount
          }
        }
        user {
          email
          id
        }
        userEmail
      }
    }
  }
`;

export const SHIPPING_METHOD_UPDATE = gql`
  mutation shippingMethodUpdate($id: ID!, $input: OrderUpdateShippingInput!) {
    orderUpdateShipping(order: $id, input: $input) {
      errors {
        code
        message
      }
      order {
        shippingMethods {
          id
          name
        }
        total {
          tax {
            amount
            currency
          }
          gross {
            amount
            currency
          }
        }
        shippingMethodName
        shippingPrice {
          gross {
            amount
            currency
          }
        }
        id
      }
    }
  }
`;
export const ORDER_DRAFT_CREATE = gql`
  mutation OrderDraftCreate($input: DraftOrderCreateInput!) {
    draftOrderCreate(input: $input) {
      errors {
        code
        field
        message
      }
      order {
        id
      }
    }
  }
`;

export const CANCEL_ORDER_QUERY = gql`
  mutation orderCancellation($id: ID!) {
    orderCancel(id: $id) {
      errors {
        code
        message
        field
      }
      order {
        created
        id
        status
        lines {
          variantName
        }
      }
    }
  }
`;

export const ADD_CUSTOMER_ADDRESS = gql`
  mutation addCutomerAddress($input: UserCreateInput!) {
    customerCreate(input: $input) {
      errors {
        code
        message
        field
      }
      user {
        id
      }
    }
  }
`;

export const ORDER_LINE_DELETE = gql`
  mutation OrderLineDelete($id: ID!) {
    orderLineDelete(id: $id) {
      errors {
        code
        field
        message
        addressType
        orderLines
      }
      order {
        id
        lines {
          id
          productName
          variantName
        }
      }
    }
  }
`;
export const ORDER_DRAFT_CANCEL = gql`
  mutation OrderDraftCancel($id: ID!) {
    draftOrderDelete(id: $id) {
      errors {
        field
        code
        message
        variants
      }
      order {
        canFinalize
        created
        id
        lines {
          productName
          quantity
          variant {
            id
          }
          variantName
        }
      }
    }
  }
`;
export const CONFIRM_ORDER_MUTATION = gql`
  mutation OrderConfirm($id: ID!) {
    orderConfirm(id: $id) {
      errors {
        code
        field
        message
        orderLines
      }
      order {
        created
        lines {
          id
          productName
        }
        status
      }
    }
  }
`;
export const GENERATE_INVOICE = gql`
  mutation InvoiceRequest($orderId: ID!) {
    invoiceRequest(orderId: $orderId) {
      errors {
        code
        field
        message
      }
      invoice {
        createdAt
        id
        number
        status
        url
      }
      order {
        id
      }
    }
  }
`;

export const UPDATE_CUSTOMER_UPDATE = gql`
  mutation UpdateCustomer($id: ID!, $input: AddressInput!) {
    addressUpdate(id: $id, input: $input) {
      errors {
        message
        field
        code
      }
      address {
        city
        cityArea
        companyName
        countryArea
        firstName
        id
        lastName
        phone
        streetAddress1
        streetAddress2
      }
    }
  }
`;

export const UPDATE_CUSTOMER_INFO = gql`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    customerUpdate(id: $id, input: $input) {
      errors {
        field
        code
        message
      }
      user {
        email
        firstName
        lastName
        phoneNumber
      }
    }
  }
`;

export const ORDER_CONFIRM = gql`
  mutation OrderConfirm($id: ID!) {
    orderConfirm(id: $id) {
      errors {
        field
        message
      }
      order {
        id
        status
      }
    }
  }
`;

export const ORDER_LINE_UPDATE = gql`
  mutation OrderLineUpdate($id: ID!, $input: OrderLineInput!) {
    orderLineUpdate(id: $id, input: $input) {
      errors {
        code
        field
        message
      }
      order {
        id
        lines {
          id
          quantity
          totalPrice {
            gross {
              amount
            }
          }
        }
      }
    }
  }
`;

export const ORDER_MARK_AS_PAID = gql`
  mutation OrderMarkAsPaid($id: ID!) {
    orderMarkAsPaid(id: $id) {
      errors {
        field
        message
      }
      order {
        id
        isPaid
        paymentStatus
      }
    }
  }
`;

export const FULFILL_ORDER = gql`
  mutation FulfillOrder($orderId: ID!, $input: OrderFulfillInput!) {
    orderFulfill(order: $orderId, input: $input) {
      errors {
        field
        message
      }
      order {
        id
        status
      }
    }
  }
`;


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
