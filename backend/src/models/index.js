const sequelize = require('../config/sequelize');
const { DataTypes, Op } = require('sequelize');

// Import all models
const Tenant = require('./Tenant');
const User = require('./User');
const Branch = require('./Branch');
const SubscriptionPlan = require('./SubscriptionPlan');
const PlatformSetting = require('./PlatformSetting');
const TenantSubscription = require('./TenantSubscription');
const StoreDetails = require('./StoreDetails');
const PrintSetting = require('./PrintSetting');
const Tax = require('./Tax');
const PaymentType = require('./PaymentType');
const StoreTable = require('./StoreTable');
const Category = require('./Category');
const QrOrder = require('./QrOrder');
const QrOrderItem = require('./QrOrderItem');
const Customer = require('./Customer');
const Feedback = require('./Feedback');
const Order = require('./Order');
const Invoice = require('./Invoice');
const MenuItem = require('./MenuItem');
const ExchangeRate = require('./ExchangeRate');
const SubscriptionHistory = require('./SubscriptionHistory');
const Superadmin = require('./Superadmin');
const Reservation = require('./Reservation');
const RefreshToken = require('./RefreshToken');
const MenuItemAddon = require('./MenuItemAddon');
const MenuItemVariant = require('./MenuItemVariant');
const MenuItemRecipe = require('./MenuItemRecipe');
const InventoryItem = require('./InventoryItem');
const InventoryLog = require('./InventoryLog');
const InventoryVendor = require('./InventoryVendor');
const InventoryPurchaseOrderDraft = require('./InventoryPurchaseOrderDraft');
const InventoryPurchaseOrder = require('./InventoryPurchaseOrder');
const InventoryPurchaseOrderItem = require('./InventoryPurchaseOrderItem');
const Sequence = require('./Sequence');
const TokenSequence = require('./TokenSequence');
const InvoiceSequence = require('./InvoiceSequence');
const OrderItem = require('./OrderItem');
const CashShift = require('./CashShift');
const AccountabilityExpense = require('./AccountabilityExpense');
const AccountabilityTarget = require('./AccountabilityTarget');
const AccountabilityActivity = require('./AccountabilityActivity');

// Define associations

// Tenant and User
Tenant.hasMany(User, { foreignKey: 'tenant_id', sourceKey: 'id' });
Tenant.hasMany(User, { foreignKey: 'tenant_id', sourceKey: 'id', as: 'adminUser' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Branch
Tenant.hasMany(Branch, { foreignKey: 'tenant_id', sourceKey: 'id' });
Branch.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Branch and User
Branch.hasMany(User, { foreignKey: 'branch_id', sourceKey: 'id' });
User.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });

// Branch and InventoryItem
Branch.hasMany(InventoryItem, { foreignKey: 'branch_id', sourceKey: 'id' });
InventoryItem.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });

// Branch and MenuItem
Branch.hasMany(MenuItem, { foreignKey: 'branch_id', sourceKey: 'id' });
MenuItem.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });

// Branch and Order
Branch.hasMany(Order, { foreignKey: 'branch_id', sourceKey: 'id' });
Order.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });
Branch.hasMany(Invoice, { foreignKey: 'branch_id', sourceKey: 'id' });
Invoice.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });

// Branch and StoreTable
Branch.hasMany(StoreTable, { foreignKey: 'branch_id', sourceKey: 'id' });
StoreTable.belongsTo(Branch, { foreignKey: 'branch_id', targetKey: 'id' });

// RefreshToken and User
User.hasMany(RefreshToken, { foreignKey: 'username', sourceKey: 'username' });
RefreshToken.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });

// RefreshToken and Tenant
Tenant.hasMany(RefreshToken, { foreignKey: 'tenant_id', sourceKey: 'id' });
RefreshToken.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Reservation
Tenant.hasMany(Reservation, { foreignKey: 'tenant_id', sourceKey: 'id' });
Reservation.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Reservation and Customer
Reservation.belongsTo(Customer, { foreignKey: 'customer_id', targetKey: 'phone', as: 'Customer' });
Customer.hasMany(Reservation, { foreignKey: 'customer_id', sourceKey: 'phone', as: 'Reservations' });

// Reservation and StoreTable
Reservation.belongsTo(StoreTable, { foreignKey: 'table_id', targetKey: 'id' });
StoreTable.hasMany(Reservation, { foreignKey: 'table_id', sourceKey: 'id' });

// MenuItem and MenuItemAddon
MenuItem.hasMany(MenuItemAddon, { foreignKey: 'item_id', sourceKey: 'id' });
MenuItemAddon.belongsTo(MenuItem, { foreignKey: 'item_id', targetKey: 'id' });

// Tenant and MenuItemAddon
Tenant.hasMany(MenuItemAddon, { foreignKey: 'tenant_id', sourceKey: 'id' });
MenuItemAddon.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// MenuItem and MenuItemVariant
MenuItem.hasMany(MenuItemVariant, { foreignKey: 'item_id', sourceKey: 'id' });
MenuItemVariant.belongsTo(MenuItem, { foreignKey: 'item_id', targetKey: 'id' });

// Tenant and MenuItemVariant
Tenant.hasMany(MenuItemVariant, { foreignKey: 'tenant_id', sourceKey: 'id' });
MenuItemVariant.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// MenuItem and MenuItemRecipe
MenuItem.hasMany(MenuItemRecipe, { foreignKey: 'menu_item_id', sourceKey: 'id' });
MenuItemRecipe.belongsTo(MenuItem, { foreignKey: 'menu_item_id', targetKey: 'id' });

// MenuItemVariant and MenuItemRecipe
MenuItemVariant.hasMany(MenuItemRecipe, { foreignKey: 'variant_id', sourceKey: 'id' });
MenuItemRecipe.belongsTo(MenuItemVariant, { foreignKey: 'variant_id', targetKey: 'id' });

// MenuItemAddon and MenuItemRecipe
MenuItemAddon.hasMany(MenuItemRecipe, { foreignKey: 'addon_id', sourceKey: 'id' });
MenuItemRecipe.belongsTo(MenuItemAddon, { foreignKey: 'addon_id', targetKey: 'id' });

// InventoryItem and MenuItemRecipe
InventoryItem.hasMany(MenuItemRecipe, { foreignKey: 'inventory_item_id', sourceKey: 'id' });
MenuItemRecipe.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', targetKey: 'id', as: 'Ingredient' });

// Tenant and MenuItemRecipe
Tenant.hasMany(MenuItemRecipe, { foreignKey: 'tenant_id', sourceKey: 'id' });
MenuItemRecipe.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and InventoryItem
Tenant.hasMany(InventoryItem, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryItem.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryLog and Tenant
Tenant.hasMany(InventoryLog, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryLog.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryLog and InventoryItem
InventoryLog.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', targetKey: 'id', as: 'InventoryItem' });

// InventoryVendor and Tenant
Tenant.hasMany(InventoryVendor, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryVendor.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryPurchaseOrderDraft and InventoryItem
InventoryItem.hasMany(InventoryPurchaseOrderDraft, { foreignKey: 'item_id', sourceKey: 'id' });
InventoryPurchaseOrderDraft.belongsTo(InventoryItem, { foreignKey: 'item_id', targetKey: 'id', as: 'Item' });

// InventoryPurchaseOrderDraft and Tenant
Tenant.hasMany(InventoryPurchaseOrderDraft, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryPurchaseOrderDraft.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryPurchaseOrder and Tenant
Tenant.hasMany(InventoryPurchaseOrder, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryPurchaseOrder.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryPurchaseOrder and InventoryVendor
InventoryVendor.hasMany(InventoryPurchaseOrder, { foreignKey: 'vendor_id', sourceKey: 'id' });
InventoryPurchaseOrder.belongsTo(InventoryVendor, { foreignKey: 'vendor_id', targetKey: 'id' });

// InventoryPurchaseOrderItem and InventoryPurchaseOrder
InventoryPurchaseOrder.hasMany(InventoryPurchaseOrderItem, { foreignKey: 'purchase_order_id', sourceKey: 'id' });
InventoryPurchaseOrderItem.belongsTo(InventoryPurchaseOrder, { foreignKey: 'purchase_order_id', targetKey: 'id' });

// InventoryPurchaseOrderItem and Tenant
Tenant.hasMany(InventoryPurchaseOrderItem, { foreignKey: 'tenant_id', sourceKey: 'id' });
InventoryPurchaseOrderItem.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InventoryPurchaseOrderItem and InventoryItem
InventoryItem.hasMany(InventoryPurchaseOrderItem, { foreignKey: 'inventory_item_id', sourceKey: 'id' });
InventoryPurchaseOrderItem.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', targetKey: 'id', as: 'Item' });

// Sequence and Tenant
Tenant.hasMany(Sequence, { foreignKey: 'tenant_id', sourceKey: 'id' });
Sequence.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });
Tenant.hasOne(TokenSequence, { foreignKey: 'tenant_id', sourceKey: 'id' });
TokenSequence.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// InvoiceSequence and Tenant
Tenant.hasMany(InvoiceSequence, { foreignKey: 'tenant_id', sourceKey: 'id' });
InvoiceSequence.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and StoreDetails
Tenant.hasOne(StoreDetails, { foreignKey: 'tenant_id', sourceKey: 'id' });
StoreDetails.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// StoreDetails and ExchangeRate
StoreDetails.belongsTo(ExchangeRate, { foreignKey: 'currency', targetKey: 'currency_code' });

// Tenant and PrintSetting
Tenant.hasOne(PrintSetting, { foreignKey: 'tenant_id', sourceKey: 'id' });
PrintSetting.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Tax
Tenant.hasMany(Tax, { foreignKey: 'tenant_id', sourceKey: 'id' });
Tax.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and PaymentType
Tenant.hasMany(PaymentType, { foreignKey: 'tenant_id', sourceKey: 'id' });
PaymentType.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and StoreTable
Tenant.hasMany(StoreTable, { foreignKey: 'tenant_id', sourceKey: 'id' });
StoreTable.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Category
Tenant.hasMany(Category, { foreignKey: 'tenant_id', sourceKey: 'id' });
Category.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and QrOrder
Tenant.hasMany(QrOrder, { foreignKey: 'tenant_id', sourceKey: 'id' });
QrOrder.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// QrOrder and Customer
QrOrder.belongsTo(Customer, { foreignKey: 'customer_id', targetKey: 'phone' });
Customer.hasMany(QrOrder, { foreignKey: 'customer_id', sourceKey: 'phone' });

// QrOrder and StoreTable
QrOrder.belongsTo(StoreTable, { foreignKey: 'table_id', targetKey: 'id' });
StoreTable.hasMany(QrOrder, { foreignKey: 'table_id', sourceKey: 'id' });

// QrOrder and QrOrderItem
QrOrder.hasMany(QrOrderItem, { foreignKey: 'order_id', sourceKey: 'id' });
QrOrderItem.belongsTo(QrOrder, { foreignKey: 'order_id', targetKey: 'id' });

// QrOrderItem and MenuItem
QrOrderItem.belongsTo(MenuItem, { foreignKey: 'item_id', targetKey: 'id' });
MenuItem.hasMany(QrOrderItem, { foreignKey: 'item_id', sourceKey: 'id' });

// MenuItem and Tax
MenuItem.belongsTo(Tax, { foreignKey: 'tax_id', targetKey: 'id', as: 'Tax' });

// MenuItem and Category
MenuItem.belongsTo(Category, { foreignKey: 'category', targetKey: 'id', as: 'Category' });

// InventoryItem and InventoryLog
InventoryItem.hasMany(InventoryLog, { foreignKey: 'inventory_item_id', sourceKey: 'id', as: 'InventoryLogs' });

// Tenant and Customer
Tenant.hasMany(Customer, { foreignKey: 'tenant_id', sourceKey: 'id' });
Customer.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Feedback
Tenant.hasMany(Feedback, { foreignKey: 'tenant_id', sourceKey: 'id' });
Feedback.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Feedback and Customer
Feedback.belongsTo(Customer, { foreignKey: 'phone', targetKey: 'phone', as: 'Customer' });
Customer.hasMany(Feedback, { foreignKey: 'phone', sourceKey: 'phone', as: 'Feedbacks' });

// Feedback and Invoice
Feedback.belongsTo(Invoice, { foreignKey: 'invoice_id', targetKey: 'id' });
Invoice.hasMany(Feedback, { foreignKey: 'invoice_id', sourceKey: 'id' });

// Tenant and Order
Tenant.hasMany(Order, { foreignKey: 'tenant_id', sourceKey: 'id' });
Order.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Invoice and Order
Invoice.hasMany(Order, { foreignKey: 'invoice_id', sourceKey: 'id', as: 'Orders', constraints: false });
Order.belongsTo(Invoice, { foreignKey: 'invoice_id', targetKey: 'id', as: 'InvoiceRecord', constraints: false });

// Order and Customer
Order.belongsTo(Customer, { foreignKey: 'customer_id', targetKey: 'phone', as: 'Customer' });

// Order and StoreTable
Order.belongsTo(StoreTable, { foreignKey: 'table_id', targetKey: 'id', as: 'StoreTable' });

// OrderItem and MenuItem
OrderItem.belongsTo(MenuItem, { foreignKey: 'item_id', targetKey: 'id', as: 'MenuItem' });
MenuItem.hasMany(OrderItem, { foreignKey: 'item_id', sourceKey: 'id', as: 'OrderItems' });

// OrderItem and MenuItemVariant
OrderItem.belongsTo(MenuItemVariant, { foreignKey: 'variant_id', targetKey: 'id', as: 'MenuItemVariant' });

// OrderItem and Tenant
Tenant.hasMany(OrderItem, { foreignKey: 'tenant_id', sourceKey: 'id' });
OrderItem.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Tenant and Invoice
Tenant.hasMany(Invoice, { foreignKey: 'tenant_id', sourceKey: 'id' });
Invoice.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// Invoice and PaymentType
Invoice.belongsTo(PaymentType, { foreignKey: 'payment_type_id', as: 'PaymentType' });
PaymentType.hasMany(Invoice, { foreignKey: 'payment_type_id' });
CashShift.hasMany(Invoice, { foreignKey: 'cash_shift_id', as: 'Invoices' });
Invoice.belongsTo(CashShift, { foreignKey: 'cash_shift_id', as: 'CashShift' });

// Tenant and SubscriptionHistory
Tenant.hasMany(SubscriptionHistory, { foreignKey: 'tenant_id', sourceKey: 'id' });
SubscriptionHistory.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'id' });

// TenantSubscription associations (moved from TenantSubscription.js)
TenantSubscription.belongsTo(Tenant, { foreignKey: 'tenant_id' });
TenantSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan_id' });
Tenant.hasMany(TenantSubscription, { foreignKey: 'tenant_id', sourceKey: 'id' });
SubscriptionPlan.hasMany(TenantSubscription, { foreignKey: 'subscription_plan_id', sourceKey: 'id' });


// Export models
module.exports = {
    sequelize,
    Tenant,
    User,
    Branch,
    SubscriptionPlan,
    PlatformSetting,
    TenantSubscription,
    StoreDetails,
    PrintSetting,
    Tax,
    PaymentType,
    StoreTable,
    Category,
    QrOrder,
    QrOrderItem,
    Customer,
    Feedback,
    Order,
    Invoice,
    MenuItem,
    ExchangeRate,
    SubscriptionHistory,
    Superadmin,
    RefreshToken,
    Reservation,
    MenuItemAddon,
    MenuItemVariant,
    MenuItemRecipe,
    InventoryItem,
    InventoryLog,
    InventoryVendor,
    InventoryPurchaseOrderDraft,
    InventoryPurchaseOrder,
    InventoryPurchaseOrderItem,
    Sequence,
    TokenSequence,
    InvoiceSequence,
    OrderItem,
    CashShift,
    AccountabilityExpense,
    AccountabilityTarget,
    AccountabilityActivity,
    Op,
};