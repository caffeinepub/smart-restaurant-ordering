import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    available : Bool;
  };

  type OrderItem = {
    menuItemId : Nat;
    name : Text;
    price : Float;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #ready;
  };

  type Order = {
    id : Nat;
    tableNumber : Nat;
    items : [OrderItem];
    status : OrderStatus;
    placedAt : Int;
    estimatedMinutes : ?Nat;
  };

  // State
  var nextMenuItemId = 1;
  var nextOrderId = 1;

  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();

  // Helpers
  module MenuItem {
    public func compare(item1 : MenuItem, item2 : MenuItem) : Order.Order {
      Text.compare(item1.name, item2.name);
    };
  };

  func getTimestamp() : Int {
    Time.now();
  };

  func seedMenu() {
    if (menuItems.size() == 0) {
      let defaultItems = [
        {
          name = "Chicken Wings";
          description = "5 pieces hot buffalo wings";
          price = 8.99;
          category = "Appetizer";
          imageUrl = "https://example.com/chicken-wings.jpg";
          available = true;
        },
        {
          name = "Spaghetti Carbonara";
          description = "Classic Italian pasta with bacon and cream sauce";
          price = 14.50;
          category = "Main";
          imageUrl = "https://example.com/carbonara.jpg";
          available = true;
        },
        {
          name = "Lemonade";
          description = "Freshly squeezed lemon juice";
          price = 3.25;
          category = "Drink";
          imageUrl = "https://example.com/lemonade.jpg";
          available = true;
        },
        {
          name = "Chocolate Cake";
          description = "Rich chocolate cake with fudge icing";
          price = 6.00;
          category = "Dessert";
          imageUrl = "https://example.com/chocolate-cake.jpg";
          available = true;
        },
      ];

      for (item in defaultItems.values()) {
        let menuItem : MenuItem = {
          id = nextMenuItemId;
          name = item.name;
          description = item.description;
          price = item.price;
          category = item.category;
          imageUrl = item.imageUrl;
          available = item.available;
        };
        menuItems.add(nextMenuItemId, menuItem);
        nextMenuItemId += 1;
      };
    };
  };

  // Menu Management
  public shared ({ caller }) func createMenuItem(name : Text, description : Text, price : Float, category : Text, imageUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create menu items");
    };
    let menuItem : MenuItem = {
      id = nextMenuItemId;
      name;
      description;
      price;
      category;
      imageUrl;
      available = true;
    };
    menuItems.add(nextMenuItemId, menuItem);
    nextMenuItemId += 1;
    menuItem.id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, name : Text, description : Text, price : Float, category : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?existingItem) {
        let updatedItem : MenuItem = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          available = existingItem.available;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func toggleMenuItemAvailability(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle availability");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        let updatedItem = {
          id = item.id;
          name = item.name;
          description = item.description;
          price = item.price;
          category = item.category;
          imageUrl = item.imageUrl;
          available = not item.available;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item not found");
    };
    menuItems.remove(id);
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    seedMenu();
    menuItems.values().toArray().filter(func(item) { item.available }).sort();
  };

  public query ({ caller }) func getMenuByCategory(category : Text) : async [MenuItem] {
    seedMenu();
    menuItems.values().toArray().filter(func(item) { item.category == category and item.available }).sort();
  };

  // Order Management
  public shared ({ caller }) func placeOrder(tableNumber : Nat, items : [OrderItem]) : async Nat {
    if (tableNumber < 1 or tableNumber > 20) {
      Runtime.trap("Invalid table number");
    };
    if (items.size() == 0) {
      Runtime.trap("Order must have at least one item");
    };
    let order : Order = {
      id = nextOrderId;
      tableNumber;
      items;
      status = #pending;
      placedAt = getTimestamp();
      estimatedMinutes = null;
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public shared ({ caller }) func confirmOrder(id : Nat, estimatedMinutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.status != #pending) {
          Runtime.trap("Order is not pending");
        };
        let updatedOrder = {
          id = order.id;
          tableNumber = order.tableNumber;
          items = order.items;
          status = #confirmed;
          placedAt = order.placedAt;
          estimatedMinutes = ?estimatedMinutes;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func markOrderReady(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark orders as ready");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.status != #confirmed) {
          Runtime.trap("Order is not confirmed");
        };
        let updatedOrder = {
          id = order.id;
          tableNumber = order.tableNumber;
          items = order.items;
          status = #ready;
          placedAt = order.placedAt;
          estimatedMinutes = order.estimatedMinutes;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrderStatus(orderId : Nat) : async OrderStatus {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order.status };
    };
  };

  public query ({ caller }) func getTableOrders(tableNumber : Nat) : async [Order] {
    orders.values().toArray().filter(func(order) { order.tableNumber == tableNumber });
  };

  public query ({ caller }) func getActiveKitchenOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view kitchen orders");
    };
    orders.values().toArray().filter(func(order) { order.status != #ready });
  };

  public shared ({ caller }) func clearTableOrders(tableNumber : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear table orders");
    };

    let completedOrderIds = List.empty<Nat>();

    for ((orderId, _) in orders.entries()) {
      switch (orders.get(orderId)) {
        case (null) {};
        case (?order) {
          if (order.tableNumber == tableNumber and order.status == #ready) {
            completedOrderIds.add(orderId);
          };
        };
      };
    };

    for (id in completedOrderIds.values()) {
      orders.remove(id);
    };
  };

  // Billing
  public query ({ caller }) func getTableBill(tableNumber : Nat) : async Float {
    var total : Float = 0;
    for ((orderId, order) in orders.entries()) {
      if (order.tableNumber == tableNumber) {
        for (item in order.items.values()) {
          total += (item.price * item.quantity.toFloat());
        };
      };
    };
    total;
  };

  public shared ({ caller }) func payBill(tableNumber : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process payments");
    };

    let completedOrderIds = List.empty<Nat>();

    for ((orderId, order) in orders.entries()) {
      if (order.tableNumber == tableNumber) {
        completedOrderIds.add(orderId);
      };
    };

    for (id in completedOrderIds.values()) {
      orders.remove(id);
    };
  };
};
