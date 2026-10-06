const { InventoryItem, InventoryLog, InventoryVendor, InventoryPurchaseOrderDraft, InventoryPurchaseOrder, InventoryPurchaseOrderItem, Sequence, MenuItem, sequelize, Op } = require("../models");

exports.bulkAddInventoryItemsDB = async (items, tenantId, username, branchId) => {
  if (!items || items.length === 0) {
    return 0;
  }

  const t = await sequelize.transaction();
  try {
    let itemsProcessed = 0;
    const inventoryItemsToCreate = [];
    const inventoryLogsToCreate = [];

    for (const item of items) {
      const title = item.title;
      const quantity = parseFloat(item.quantity) || 0;
      const unit = item.unit;
      const minQuantityThreshold = parseFloat(item.min_quantity_threshold) || 0;

      if (!title || !unit) {
        continue;
      }
      itemsProcessed++;

      let status = "out";
      if (quantity > 0 && quantity <= minQuantityThreshold) {
        status = "low";
      } else if (quantity > minQuantityThreshold) {
        status = "in";
      }

      inventoryItemsToCreate.push({
        title: title,
        quantity: quantity,
        unit: unit,
        min_quantity_threshold: minQuantityThreshold,
        status: status,
        tenant_id: tenantId,
        branch_id: branchId
      });
    }

    if (itemsProcessed === 0) {
      throw new Error("No valid rows found in the file. Please ensure the columns are named correctly (title, quantity, unit, min_quantity_threshold) and that title and unit are not empty.");
    }

    const createdInventoryItems = await InventoryItem.bulkCreate(inventoryItemsToCreate, { transaction: t });

    for (let i = 0; i < createdInventoryItems.length; i++) {
        const item = items[i];
        const quantity = parseFloat(item.quantity) || 0;
        if (quantity > 0) {
            inventoryLogsToCreate.push({
                tenant_id: tenantId,
                branch_id: branchId,
                inventory_item_id: createdInventoryItems[i].id,
                type: 'IN',
                quantity_change: quantity,
                previous_quantity: 0,
                new_quantity: quantity,
                note: 'Initial stock (bulk upload)',
                created_by: username,
            });
        }
    }

    if (inventoryLogsToCreate.length > 0) {
        await InventoryLog.bulkCreate(inventoryLogsToCreate, { transaction: t });
    }

    await t.commit();
    return itemsProcessed;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.addInventoryItemDB = async (
  title,
  quantity,
  unit,
  minQuantityThreshold,
  tenantId,
  username,
  branchId
) => {
  const t = await sequelize.transaction();
  try {
    let status = 'out';
    if (quantity > 0 && quantity <= minQuantityThreshold) {
      status = 'low';
    } else if (quantity > minQuantityThreshold) {
      status = 'in';
    }

    const inventoryItem = await InventoryItem.create({
      title: title,
      quantity: quantity,
      unit: unit,
      min_quantity_threshold: minQuantityThreshold,
      status: status,
      tenant_id: tenantId,
      branch_id: branchId
    }, { transaction: t });

    const inventoryItemId = inventoryItem.id;

    await InventoryLog.create({
      tenant_id: tenantId,
      branch_id: branchId,
      inventory_item_id: inventoryItemId,
      type: 'IN',
      quantity_change: quantity,
      previous_quantity: 0,
      new_quantity: quantity,
      note: 'Initial stock',
      created_by: username,
    }, { transaction: t });

    await t.commit();

    return inventoryItemId;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.getInventoryItemsDB = async (status, tenantId, branchId) => {
  try {
    const statusCounts = await InventoryItem.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      where: { tenant_id: tenantId, branch_id: branchId },
      group: ['status'],
      raw: true,
    });

    const statusCountMap = {
      in: 0,
      low: 0,
      out: 0,
    };

    statusCounts.forEach(({ status, count }) => {
      if (statusCountMap[status] !== undefined) {
        statusCountMap[status] = count;
      }
    });

    let whereCondition = { tenant_id: tenantId, branch_id: branchId };
    if (status !== 'all') {
      whereCondition.status = status;
    }

    const items = await InventoryItem.findAll({
      where: whereCondition,
      attributes: [
        'id',
        'title',
        'quantity',
        'unit',
        'min_quantity_threshold',
        'status',
        'tenant_id',
        'created_at',
        'updated_at'
      ],
      order: [['id', 'DESC']],
    });

    return { items: items.map(item => item.get({ plain: true })), statusCounts: statusCountMap };
  } catch (error) {
    throw error;
  }
};

exports.updateInventoryItemDB = async (
  itemId,
  title,
  unit,
  minQuantityThreshold,
  tenantId,
  branchId
) => {
  try {
    // First, get the current quantity to determine the status
    const inventoryItem = await InventoryItem.findOne({
        where: { id: itemId, tenant_id: tenantId, branch_id: branchId },
        attributes: ['quantity']
    });

    let status = 'out';
    if (inventoryItem.quantity > 0 && inventoryItem.quantity <= minQuantityThreshold) {
      status = 'low';
    } else if (inventoryItem.quantity > minQuantityThreshold) {
      status = 'in';
    }

    await InventoryItem.update(
      {
        title: title,
        unit: unit,
        min_quantity_threshold: minQuantityThreshold,
        status: status,
      },
      {
        where: { id: itemId, tenant_id: tenantId, branch_id: branchId }
      }
    );
  } catch (error) {
    throw error;
  }
};

exports.addInventoryItemStockMovementDB = async (req, itemId, movementType, quantity, note, tenantId, username, branchId) => {
  const t = await sequelize.transaction();
  try {
    // Step 1: Get current quantity
    const inventoryItem = await InventoryItem.findOne({
      where: { id: itemId, tenant_id: tenantId, branch_id: branchId },
      attributes: ['quantity', 'min_quantity_threshold'],
      lock: t.LOCK.UPDATE, // FOR UPDATE equivalent
      transaction: t
    });

    if (!inventoryItem) throw new Error(req.__('inventory_item_not_found_message'));

    const previousQuantity = parseFloat(inventoryItem.quantity);
    const minQuantityThreshold = parseFloat(inventoryItem.min_quantity_threshold);

    // Determine quantity delta based on movement type
    let deltaQuantity;
    switch (movementType) {
      case 'IN':
        deltaQuantity = parseFloat(quantity);
        break;
      case 'OUT':
      case 'WASTAGE':
        deltaQuantity = -1 * parseFloat(quantity);
        break;
      default:
        throw new Error(req.__('invalid_movement_type_message'));
    }

    const newQuantity = previousQuantity + deltaQuantity;

    // Prevent negative inventory
    if (newQuantity < 0) throw new Error(req.__('insufficient_inventory_quantity_message'));

    // Determine new status
    let status = 'out';
    if (newQuantity > 0 && newQuantity <= minQuantityThreshold) {
      status = 'low';
    } else if (newQuantity > minQuantityThreshold) {
      status = 'in';
    }

    // Step 2: Update inventory quantity and status
    await InventoryItem.update(
      { quantity: newQuantity, status: status },
      { where: { id: itemId, tenant_id: tenantId, branch_id: branchId }, transaction: t }
    );

    // Step 3: Insert inventory log with correct type
    await InventoryLog.create({
      tenant_id: tenantId,
      branch_id: branchId,
      inventory_item_id: itemId,
      type: movementType,
      quantity_change: Math.abs(deltaQuantity),
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      note: note,
      created_by: username,
    }, { transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


exports.deleteInventoryItemDB = async (itemId, tenantId, branchId) => {
  try {
    await InventoryItem.destroy({
      where: { id: itemId, tenant_id: tenantId, branch_id: branchId }
    });
  } catch (error) {
    throw error;
  }
};

exports.getInventoryLogsDB = async (movementType, type, from, to, tenantId, branchId) => {
  try {
    const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

    let where = { tenant_id: tenantId };
    if (movementType !== 'all') {
      where.type = movementType;
    }

    const itemWhere = {};
    if (branchId !== undefined && branchId !== null && branchId !== '') {
      itemWhere.branch_id = branchId;
    }

    const inventoryLogs = await InventoryLog.findAll({
      where: { ...where, ...filterCondition },
      include: [
        {
          model: InventoryItem,
          as: 'InventoryItem',
          attributes: ['title', 'unit'],
          where: Object.keys(itemWhere).length > 0 ? itemWhere : undefined,
          required: Object.keys(itemWhere).length > 0 ? true : false,
        }
      ],
      attributes: [
        'id',
        'inventory_item_id',
        [sequelize.col('InventoryItem.title'), 'title'],
        [sequelize.col('InventoryItem.unit'), 'unit'],
        'type',
        ['quantity_change', 'quantity'],
        'note',
        'created_by',
        'created_at'
      ],
      order: [['created_at', 'DESC']],
    });
    return inventoryLogs;
  } catch (error) {
    throw error;
  }
};

exports.getCummulativeInventoryMovementsDB = async (type, from, to, tenantId, branchId) => {
  try {
    const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

    const itemWhere = {};
    if (branchId !== undefined && branchId !== null && branchId !== '') {
      itemWhere.branch_id = branchId;
    }

    const movements = await InventoryLog.findAll({
      attributes: [
        'inventory_item_id',
        [sequelize.col('InventoryItem.title'), 'title'],
        [sequelize.col('InventoryItem.unit'), 'unit'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN InventoryLog.type = 'IN' THEN InventoryLog.quantity_change ELSE 0 END")), 'total_in'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN InventoryLog.type = 'OUT' THEN InventoryLog.quantity_change ELSE 0 END")), 'total_out'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN InventoryLog.type = 'WASTAGE' THEN InventoryLog.quantity_change ELSE 0 END")), 'total_wastage'],
        [sequelize.fn('COUNT', sequelize.col('InventoryLog.id')), 'movement_count']
      ],
      include: [
        {
          model: InventoryItem,
          as: 'InventoryItem',
          attributes: [],
          where: Object.keys(itemWhere).length > 0 ? itemWhere : undefined,
          required: true,
        }
      ],
      where: { tenant_id: tenantId, ...filterCondition },
      group: ['inventory_item_id', 'InventoryItem.title', 'InventoryItem.unit'],
      order: [[sequelize.literal('(total_in + total_out + total_wastage)'), 'DESC']],
      raw: true,
    });
    return movements;
  } catch (error) {
    throw error;
  }
};

exports.getInventoryUsageVsCurrentStockDB = async (type, from, to, tenantId, branchId) => {
  try {
    const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

    const itemWhere = { tenant_id: tenantId };
    if (branchId !== undefined && branchId !== null && branchId !== '') {
      itemWhere.branch_id = branchId;
    }

    const usageVsStock = await InventoryItem.findAll({
      attributes: [
        ['id', 'inventory_item_id'],
        'title',
        ['quantity', 'current_stock'],
        'min_quantity_threshold',
        'unit',
        'status',
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN InventoryLogs.type = 'OUT' THEN InventoryLogs.quantity_change ELSE 0 END")), 'total_usage']
      ],
      include: [
        {
          model: InventoryLog,
          as: 'InventoryLogs', // Use the alias defined in associations
          attributes: [],
          where: { tenant_id: tenantId, ...filterCondition },
          required: false // LEFT JOIN
        }
      ],
      where: itemWhere,
      group: ['InventoryItem.id', 'InventoryLogs.inventory_item_id'], // Group by both to ensure correct aggregation
      order: [[sequelize.literal('total_usage'), 'DESC']],
      raw: true,
    });
    return usageVsStock;
  } catch (error) {
    throw error;
  }
};

const getFilterCondition = (field, type, from, to) => {
  let where = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (type) {
      case 'custom': {
          where[field] = {
              [Op.between]: [new Date(from), new Date(to)]
          };
          break;
      }
      case 'today': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          where[field] = {
              [Op.gte]: today,
              [Op.lt]: tomorrow
          };
          break;
      }
      case 'this_month': {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          where[field] = {
              [Op.gte]: startOfMonth,
              [Op.lte]: endOfMonth
          };
          break;
      }
      case 'last_month': {
          const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          where[field] = {
              [Op.gte]: startOfLastMonth,
              [Op.lte]: endOfLastMonth
          };
          break;
      }
      case 'last_7days': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          where[field] = {
              [Op.gte]: sevenDaysAgo,
              [Op.lte]: today
          };
          break;
      }
      case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999);
          where[field] = {
              [Op.gte]: yesterday,
              [Op.lt]: endOfYesterday
          };
          break;
      }
      case 'tomorrow': {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          where[field] = {
              [Op.gte]: tomorrow,
              [Op.lt]: endOfTomorrow
          };
          break;
      }
      default: {
          // No specific date filter
      }
  }

  return { where };
}

/* inventory_vendors */
exports.addVendorDB = async (phone, name, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, tenantId, branchId) => {
    try {
        const vendor = await InventoryVendor.create({
            phone: phone,
            name: name,
            contact_person: contactPerson,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city: city,
            state: state,
            country: country,
            zipcode: zipcode,
            tax_id_no: taxIdNo,
            tenant_id: tenantId,
            branch_id: branchId
        });
        return vendor.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getVendorsDB = async(page, perPage, sort, filter, tenantId, branchId) => {
    try {
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 10;
        const offset = (currentPage - 1) * limit;

        let order = [['created_at', 'DESC']];
        if (sort) {
            const [column, direction] = sort.split(':');
            order = [[column, direction || 'ASC']];
        }

        let whereCondition = { tenant_id: tenantId, branch_id: branchId };
        if (filter) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { name: { [Op.like]: `${filter}%` } },
                    { phone: filter }
                ]
            };
        }

        const { count, rows: vendors } = await InventoryVendor.findAndCountAll({
            where: whereCondition,
            attributes: ['id', 'phone', 'name', 'contact_person', 'address_line1', 'address_line2', 'city', 'state', 'country', 'zipcode', 'tax_id_no', 'created_at'],
            order: order,
            limit: limit,
            offset: offset,
        });

        const response = {
            vendors,
            currentPage,
            perPage,
            totalPages: Math.ceil(count / limit),
            totalVendors: count
        };

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getAllVendorsDB = async(tenantId, branchId) => {
    try {
        const vendors = await InventoryVendor.findAll({
            where: { tenant_id: tenantId, branch_id: branchId },
            attributes: ['id', 'phone', 'name', 'contact_person', 'address_line1', 'address_line2', 'city', 'state', 'country', 'zipcode', 'tax_id_no', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        return vendors;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
exports.getVendorDB = async(id, tenantId, branchId) => {
  try {
      const vendor = await InventoryVendor.findOne({
          where: { id: id, tenant_id: tenantId, branch_id: branchId },
          attributes: ['id', 'phone', 'name', 'contact_person', 'address_line1', 'address_line2', 'city', 'state', 'country', 'zipcode', 'tax_id_no', 'created_at']
      });
      return vendor;
  } catch (error) {
      console.error(error);
      throw error;
  }
}

exports.searchVendorDB = async(searchString, tenantId, branchId) => {
  try {
      const vendors = await InventoryVendor.findAll({
          where: {
              [Op.or]: [
                  { phone: { [Op.like]: `${searchString}%` } },
                  { name: { [Op.like]: `%${searchString}%` } }
              ],
              tenant_id: tenantId,
              branch_id: branchId
          },
          attributes: ['id', 'phone', 'name', 'contact_person', 'address_line1', 'address_line2', 'city', 'state', 'country', 'zipcode', 'tax_id_no', 'created_at'],
          limit: 10
      });
      return vendors;
  } catch (error) {
      console.error(error);
      throw error;
  }
}

exports.updateVendorDB = async (id, phone, name, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, tenantId, branchId) => {
  try {
      await InventoryVendor.update(
          {
              name: name,
              phone: phone,
              contact_person: contactPerson,
              address_line1: addressLine1,
              address_line2: addressLine2,
              city: city,
              state: state,
              country: country,
              zipcode: zipcode,
              tax_id_no: taxIdNo,
              updated_at: new Date(),
          },
          {
              where: { id: id, tenant_id: tenantId, branch_id: branchId }
          }
      );
      return;
  } catch (error) {
      console.error(error);
      throw error;
  }
};

exports.deleteVendorDB = async (id, tenantId, branchId) => {
  try {
      await InventoryVendor.destroy({
          where: { id: id, tenant_id: tenantId, branch_id: branchId }
      });
      return;
  } catch (error) {
      console.error(error);
      throw error;
  }
};
/* inventory_vendors */

/* Purchase Orders */
exports.addItemToPurchaseOrdersDraftsDB = async (inventoryItemId, tenantId, quantity, branchId) => {
  try {
      const draftItem = await InventoryPurchaseOrderDraft.create({
          item_id: inventoryItemId,
          quantity: quantity,
          tenant_id: tenantId,
          branch_id: branchId,
          created_at: new Date(),
      });
      return draftItem.id;
  } catch (error) {
      console.error(error);
      throw error;
  }
};
exports.addBulkItemsToPurchaseOrdersDraftsDB = async (items, branchId) => {
  try {
      await InventoryPurchaseOrderDraft.bulkCreate(items.map(item => ({...item, branch_id: branchId})));
      return;
  } catch (error) {
      console.error(error);
      throw error;
  }
};
exports.getPurchaseOrderDraftsDB = async(tenantId, branchId) => {
  try {
      const drafts = await InventoryPurchaseOrderDraft.findAll({
          where: { tenant_id: tenantId, branch_id: branchId },
          include: [
              {
                  model: InventoryItem,
                  as: 'Item',
                  attributes: ['title', 'unit'],
                  required: false // LEFT JOIN
              }
          ],
          attributes: [
              'id',
              'item_id',
              'quantity',
              'created_at',
              [sequelize.col('InventoryItem.title'), 'title'],
              [sequelize.col('InventoryItem.unit'), 'unit']
          ],
      });
      return drafts;
  } catch (error) {
      console.error(error);
      throw error;
  }
}
exports.updatePurchaseOrderDraftItemQuantityDB = async (id, quantity, tenantId, branchId) => {
  try {
      await InventoryPurchaseOrderDraft.update(
          { quantity: quantity, updated_at: new Date() },
          { where: { id: id, tenant_id: tenantId, branch_id: branchId } }
      );
      return;
  } catch (error) {
      console.error(error);
      throw error;
  }
};
exports.deletePurchaseOrderDraftItemDB = async (id, tenantId, branchId) => {
  try {
      await InventoryPurchaseOrderDraft.destroy({
          where: { id: id, tenant_id: tenantId, branch_id: branchId }
      });
      return;
  } catch (error) {
      console.error(error);
      throw error;
  }
};

exports.createPurchaseOrderDB = async (vendorId, vendorName, contactPerson, taxIdNo, address, notes, items, userId, tenantId, branchId) => {
  const t = await sequelize.transaction();
  try {
    // get PO sequence
    let purchaseOrderId = 0;
    const sequence = await Sequence.findOne({
      where: { tenant_id: tenantId, branch_id: branchId, table_name: 'inventory_purchase_orders' },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (sequence) {
      purchaseOrderId = Number(sequence.current_value);
    }
    purchaseOrderId += 1;

    // insert into po
    await InventoryPurchaseOrder.create({
      id: purchaseOrderId,
      tenant_id: tenantId,
      branch_id: branchId,
      created_at: new Date(),
      vendor_id: vendorId,
      vendor_name: vendorName,
      contact_person: contactPerson,
      tax_id_no: taxIdNo,
      address: address,
      created_by: userId,
      notes: notes,
      status: 'ordered',
    }, { transaction: t });

    const itemsParams = items.map((item) => ({
      purchase_order_id: purchaseOrderId,
      tenant_id: tenantId,
      branch_id: branchId,
      inventory_item_id: item.item_id,
      inventory_item_name: item.title,
      inventory_item_unit: item.unit,
      quantity: item.quantity,
    }));

    // insert into po items
    await InventoryPurchaseOrderItem.bulkCreate(itemsParams, { transaction: t });

    // delete from drafts
    await InventoryPurchaseOrderDraft.destroy({
      where: { id: { [Op.in]: items.map((item) => item.id) }, tenant_id: tenantId, branch_id: branchId },
      transaction: t,
    });

    // update sequence
    await Sequence.upsert(
      {
        tenant_id: tenantId,
        branch_id: branchId,
        table_name: 'inventory_purchase_orders',
        current_value: purchaseOrderId,
      },
      { transaction: t }
    );

    await t.commit();
    return;
  } catch (error) {
    await t.rollback();
    console.error(error);
    throw error;
  }
};

exports.updatePurchaseOrderToCompleteDB = async (
  id,
  fullfilledDate,
  userId,
  tenantId,
  branchId
) => {
  const t = await sequelize.transaction();
  try {
    await InventoryPurchaseOrder.update(
      {
        status: 'completed',
        fullfilled_at: fullfilledDate,
      },
      { where: { id: id, tenant_id: tenantId, branch_id: branchId }, transaction: t }
    );

    // Add to inventory
    const purchaseOrderItems = await InventoryPurchaseOrderItem.findAll({
      where: { purchase_order_id: id, tenant_id: tenantId, branch_id: branchId },
      attributes: ['inventory_item_id', 'quantity'],
      transaction: t
    });

    const inventoryItemIds = purchaseOrderItems.map(
      (item) => item.inventory_item_id
    );

    const inventoryItems = await InventoryItem.findAll({
      where: { id: { [Op.in]: inventoryItemIds }, tenant_id: tenantId, branch_id: branchId },
      attributes: ['id', 'quantity', 'min_quantity_threshold'],
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    const inventoryLogs = [];
    for (const poItem of purchaseOrderItems) {
      const inventoryItem = inventoryItems.find(
        (item) => item.id === poItem.inventory_item_id
      );
      if (inventoryItem) {
        const previousQuantity = parseFloat(inventoryItem.quantity);
        const newQuantity = previousQuantity + parseFloat(poItem.quantity);

        // Update inventory quantity and status
        let status = 'out';
        if (newQuantity > 0 && newQuantity <= inventoryItem.min_quantity_threshold) {
          status = 'low';
        } else if (newQuantity > inventoryItem.min_quantity_threshold) {
          status = 'in';
        }

        await InventoryItem.update(
          { quantity: newQuantity, status: status },
          { where: { id: inventoryItem.id, tenant_id: tenantId, branch_id: branchId }, transaction: t }
        );

        // Prepare inventory log
        inventoryLogs.push({
          tenant_id: tenantId,
          branch_id: branchId,
          inventory_item_id: inventoryItem.id,
          type: "IN",
          quantity_change: poItem.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          note: `Purchase Order #${id} fulfilled`,
          created_by: userId,
          created_at: new Date(),
        });
      }
    }

    // Add to inventory logs
    if (inventoryLogs.length > 0) {
      await InventoryLog.bulkCreate(inventoryLogs, { transaction: t });
    }

    // Enable Menu item again if disabled and inventory items required for preparation are all available now
    const disabledMenuItems = await MenuItem.findAll({
      where: { is_enabled: false, tenant_id: tenantId, branch_id: branchId },
      attributes: ['id'],
      transaction: t
    });

    for (const menu of disabledMenuItems) {
      const menuItemId = menu.id;

      // Step 2: Get base recipe inventory requirements
      const recipes = await MenuItemRecipe.findAll({
        where: {
          menu_item_id: menuItemId,
          variant_id: 0,
          addon_id: 0,
          tenant_id: tenantId,
          branch_id: branchId
        },
        include: [
          {
            model: InventoryItem,
            as: 'Ingredient',
            attributes: ['quantity'],
          }
        ],
        attributes: ['inventory_item_id', 'quantity'],
        transaction: t
      });

      // Step 3: Check if all required items are available
      const canEnable = recipes.length > 0 && recipes.every(r =>
        parseFloat(r.Item.quantity) >= parseFloat(r.quantity)
      );

      // Step 4: Enable if all ingredients are sufficient
      if (canEnable) {
        await MenuItem.update(
          { is_enabled: true },
          { where: { id: menuItemId, tenant_id: tenantId, branch_id: branchId }, transaction: t }
        );
      }
    }

    await t.commit();
    return;
  } catch (error) {
    await t.rollback();
    console.error(error);
    throw error;
  }
};

exports.getPurchaseOrdersDB = async (type, from, to, tenantId, branchId) => {
  try {
    const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

    const purchaseOrders = await InventoryPurchaseOrder.findAll({
      where: { ...filterCondition, tenant_id: tenantId, branch_id: branchId },
      attributes: [
        'id',
        'tenant_id',
        'created_at',
        'fullfilled_at',
        'vendor_id',
        'vendor_name',
        'contact_person',
        'tax_id_no',
        'address',
        'created_by',
        'notes',
        'status'
      ],
      order: [['created_at', 'DESC']],
    });
    return purchaseOrders;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPurchaseOrderItemsDB = async (purchaseOrderIds, tenantId, branchId) => {
  try {
    const purchaseOrderItems = await InventoryPurchaseOrderItem.findAll({
      where: {
        purchase_order_id: { [Op.in]: purchaseOrderIds },
        tenant_id: tenantId,
        branch_id: branchId
      },
      attributes: [
        'id',
        'purchase_order_id',
        'tenant_id',
        'inventory_item_id',
        'inventory_item_name',
        'inventory_item_unit',
        'quantity'
      ],
    });
    return purchaseOrderItems;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Purchase Orders */
