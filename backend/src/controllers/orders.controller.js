const { getOrdersDB, updateOrderItemStatusDB, cancelOrderDB, completeOrderDB, getOrdersPaymentSummaryDB, createInvoiceDB, completeOrdersAndSaveInvoiceIdDB, getInvoiceIdFromOrderIdsDB, getEncryptedInvoiceIdDB } = require("../services/orders.service");
const {
  getPaymentTypesDB,
  getPrintSettingDB,
  getStoreSettingDB,
  getServiceChargeDB,
} = require("../services/settings.service");

const ORDER_ITEM_STATUSES = new Set(['preparing', 'completed', 'cancelled', 'delivered']);

exports.getOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;

    const {kitchenOrders,kitchenOrdersItems,addons} = await getOrdersDB(tenantId, branchId);

    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems
        .filter((oi)=>oi.order_id == order.id)
        .map((oi)=>{
          const menuItem = oi.MenuItem || {};
          const variant = oi.MenuItemVariant || {};
          const tax = menuItem.Tax || {};
          const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;
          const itemAddons = addonsIds
            ? addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
            }).filter(Boolean)
            : [];

          return {
            ...oi,
            item_title: menuItem.item_title,
            variant_title: variant.variant_title,
            price: oi.price ?? menuItem.price,
            variant_price: variant.variant_price,
            tax_rate: tax.tax_rate,
            tax_type: tax.tax_type,
            addons: itemAddons,
          };
        });

      return {
        ...order,
        items: orderItems
      }
    })

    // group orders based on table id
    let ordersGroupedByTable = [];

    for (const order of formattedOrders) {
        const tableId = order.table_id;

        if(!tableId) {
            ordersGroupedByTable.push({
                table_id: tableId,
                table_title: order.table_title,
                floor: order.floor,
                orders: [{...order}],
                order_ids: [order.id],
            })
            continue;
        }

        const orderIndex = ordersGroupedByTable.findIndex(o=>o.table_id==tableId);
        if(orderIndex == -1) {
            ordersGroupedByTable.push({
                table_id: tableId,
                table_title: order.table_title,
                floor: order.floor,
                orders: [{...order}],
                order_ids: [order.id],
            })
        } else {
            ordersGroupedByTable[orderIndex].orders.push({...order})
            ordersGroupedByTable[orderIndex].order_ids.push(order.id)
        }
    }

    // add orders where table not present


    return res.status(200).json(ordersGroupedByTable);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getOrdersInit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const [paymentTypes, printSettings, storeSettings] = await Promise.all([
      getPaymentTypesDB(true, tenantId, branchId),
      getPrintSettingDB(tenantId, branchId),
      getStoreSettingDB(tenantId, branchId),
    ]);

    return res.status(200).json({
      paymentTypes,
      printSettings,
      storeSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.updateKitchenOrderItemStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const orderItemId = req.params.id;
    const { status } = req.body

    if(!ORDER_ITEM_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const updated = await updateOrderItemStatusDB(orderItemId, status, tenantId, branchId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: req.__("invalid_request"),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.__("order_item_status_updated") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.cancelKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    await cancelOrderDB(orderIds, tenantId, branchId, {
      username: req.user.username,
      name: req.user.name,
    });

    return res.status(200).json({
      success: true,
      message: req.__("order_cancelled_successfully") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.completeKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    await completeOrderDB(orderIds, tenantId, branchId);

    return res.status(200).json({
      success: true,
      message: req.__("order_completed_successfully") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getOrdersPaymentSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const orderIds = req.body.orderIds;

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const [ordersPaymentSummaryData, applicableServiceChargePercentage] = await Promise.all([
      getOrdersPaymentSummaryDB(orderIds, tenantId, branchId),
      getServiceChargeDB(tenantId, branchId),
    ]);

    const { kitchenOrders, kitchenOrdersItems, addons } = ordersPaymentSummaryData;


    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems
        .filter((oi)=>oi.order_id == order.id)
        .map((oi)=>{
          const menuItem = oi.MenuItem || {};
          const variant = oi.MenuItemVariant || {};
          const tax = menuItem.Tax || {};
          const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;
          const itemAddons = addonsIds
            ? addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
            }).filter(Boolean)
            : [];

          return {
            ...oi,
            item_title: menuItem.item_title,
            variant_title: variant.variant_title,
            price: oi.price ?? menuItem.price,
            variant_price: variant.variant_price,
            tax_rate: tax.tax_rate,
            tax_type: tax.tax_type,
            addons: itemAddons,
          };
        });

      return {
        ...order,
        items: orderItems
      }
    })


    // calculate summary
    let subtotal = 0;
    let taxTotal = 0;
    let serviceChargeTotal = 0;
    let total = 0;

    for (const order of formattedOrders) {
      const items = order.items;

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        const { variant_price, price, tax_rate, tax_type: taxType, quantity, addons } = item;
        const unitPrice = Number(variant_price ?? price);
        const itemQuantity = Number(quantity);
        const addonsTotal = (addons || []).reduce((sum, addon) => sum + Number(addon.price), 0);

        if (
          !Number.isFinite(unitPrice) ||
          !Number.isFinite(itemQuantity) ||
          itemQuantity <= 0 ||
          !Number.isFinite(addonsTotal)
        ) {
          return res.status(422).json({
            success: false,
            message: "Unable to calculate the order total. Check that every item has a valid price and quantity.",
          });
        }

        const itemPrice = (unitPrice + addonsTotal) * itemQuantity;
        const taxRate = Number(tax_rate ?? 0);
        if (
          (taxType === "exclusive" || taxType === "inclusive") &&
          (!Number.isFinite(taxRate) || taxRate < 0)
        ) {
          return res.status(422).json({
            success: false,
            message: "Unable to calculate the order total. Check the tax settings for each item.",
          });
        }

        if (taxType == "exclusive") {
          const tax = (itemPrice * taxRate) / 100;
          const priceWithTax = itemPrice + tax;

          taxTotal += tax;
          subtotal += itemPrice;
          total += priceWithTax;
        } else if (taxType == "inclusive") {
          const tax = itemPrice - (itemPrice * (100 / (100 + taxRate)));
          const priceWithoutTax = itemPrice - tax;

          taxTotal += tax;
          subtotal += priceWithoutTax;
          total += itemPrice;
        } else {
          subtotal += itemPrice;
          total += itemPrice;
        }
      }

    }

    // Calculate Total Service charge % from items total
    if (applicableServiceChargePercentage) {
      let serviceCharge = (Number(subtotal) * Number(applicableServiceChargePercentage)) / 100;
      serviceChargeTotal += serviceCharge;
      total += serviceCharge;
    }
    // calculate summary



    return res.status(200).json({
      subtotal,
      taxTotal,
      serviceChargeTotal,
      total,
      orders: formattedOrders
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.payAndCompleteKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const { orderIds, subTotal, taxTotal, serviceChargeTotal, total, selectedPaymentType } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const now = new Date();
    const date = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // get invoice id
    const invoiceId = await createInvoiceDB(subTotal, taxTotal, serviceChargeTotal, total, date, selectedPaymentType, tenantId, branchId, {
      username: req.user.username,
      name: req.user.name,
    });

    await completeOrdersAndSaveInvoiceIdDB(orderIds, invoiceId, tenantId, branchId);

    // get encrypted invoice id and customer id.
    const result = await getEncryptedInvoiceIdDB(invoiceId, tenantId, branchId);

    return res.status(200).json({
      success: true,
      message: req.__("order_completed_successfully"), // Translate message
      invoiceId: result?.invoice_id || null,
      customerId: result?.customer_id || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getInvoiceIdFromOrderId = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const result = await getInvoiceIdFromOrderIdsDB(orderIds, tenantId, branchId);

    return res.status(200).json({
      invoiceId: result?.invoice_id || null,
      customerId: result?.customer_id || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};
