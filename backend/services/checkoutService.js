// CheckoutService.js

class CheckoutService {
  static calculateTotal(cartItems) {
    let totalQuantity = 0;
    let totalPrice = 0;

    // Loop through each item in the cart
    cartItems.forEach(item => {
      console.log("Item:", item);
      totalQuantity += item.qty; // Add up the quantity
      totalPrice += item.qty * item.price; // Add up the total price of each item
    });

    console.log("Total Price:", totalPrice);

    return { totalQuantity, totalPrice };
  }
}

module.exports = CheckoutService;

