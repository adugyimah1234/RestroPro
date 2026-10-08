const { getKitchenOrdersDB } = require("../services/kitchen.service");
const { updateOrderItemStatusDB } = require("../services/orders.service");

const ORDER_ITEM_STATUSES = new Set(['preparing', 'completed', 'cancelled', 'delivered']);

exports.getKitchenOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
    const {addons,kitchenOrders,kitchenOrdersItems} = await getKitchenOrdersDB(tenantId, branchId);

    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems.filter((oi)=>oi.order_id == order.id);
      
      orderItems.forEach((oi, index)=>{
        const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;

        if(addonsIds) {
          const itemAddons = addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
          });
          orderItems[index].addons = [...itemAddons];
        }
      });

      return {
        ...order,
        items: orderItems
      }
    })

    return res.status(200).json(formattedOrders);
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
    const orderItemId = req.params.id;
    const tenantId = req.user.tenant_id;
    const branchId = req.user.branch_id;
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