/*
  TODO:
    - (optionally) register a new user
    - get logged in
    - add some items to your cart (need to create a cart on first item addition)
      - setCartQuantity(item_id, quantity)
      - quantity can be zero to delete
    - create the order, subscribe to the create_order row
    - when we get the order id, subscribe to the order row, diff out updates to console
*/


/*
  shopping cart idea:
    - for mutations, custom remote graphql schema
    - for queries, use built in hasura functionality
      - (through a STABLE sql function that looks up your current cart)
      - set 'x-hasura-session-id' in auth webhook
*/

