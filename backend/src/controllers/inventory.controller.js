const fs = require("fs");
const {
  addInventoryItemDB,
  getInventoryItemsDB,
  updateInventoryItemDB,
  deleteInventoryItemDB,
  addInventoryItemStockMovementDB,
  getInventoryLogsDB,
  getCummulativeInventoryMovementsDB,
  getInventoryUsageVsCurrentStockDB,
  bulkAddInventoryItemsDB,
} = require("../services/inventory.service");
const papaparse = require("papaparse");
const xlsx = require("xlsx");

exports.bulkAddInventoryItems = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const username = req.user.username;

    if (!req.files || !req.files.csv) {
      return res.status(400).json({
        success: false,
        message: req.__("no_csv_file_uploaded"),
      });
    }

    const file = req.files.csv;
    
    if (file.mimetype === "text/csv") {
      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file.tempFilePath);
        papaparse.parse(stream, {
          header: true,
          skipEmptyLines: true,
          bom: true,
          transformHeader: header => header.toLowerCase().trim().replace(/ /g, '_'),
          complete: async (results) => {
            try {
              const processedCount = await bulkAddInventoryItemsDB(results.data, tenantId, username);
              res.status(200).json({
                success: true,
                message: `${processedCount} items added successfully.`,
              });
              resolve();
            } catch (error) {
              console.error(error);
              res.status(500).json({
                success: false,
                message: error.message || req.__("something_went_wrong_try_later"),
              });
              reject(error);
            }
          },
          error: (error) => {
            console.error(error);
            res.status(400).json({
              success: false,
              message: req.__("error_parsing_csv"),
            });
            reject(error);
          },
        });
      });
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const workbook = xlsx.readFile(file.tempFilePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      const dataToInsert = jsonData.map(row => {
        const newRow = {};
        for (const key in row) {
          const newKey = key.toLowerCase().trim().replace(/ /g, '_');
          newRow[newKey] = row[key];
        }
        return newRow;
      });

      try {
        const processedCount = await bulkAddInventoryItemsDB(dataToInsert, tenantId, username);
        return res.status(200).json({
          success: true,
          message: `${processedCount} items added successfully.`,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: error.message || req.__("something_went_wrong_try_later"),
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: req.__("unsupported_file_type"),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || req.__("something_went_wrong_try_later"),
    });
  }
};

exports.addInventoryItem = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const username = req.user.username;
    const {
      title,
      quantity,
      unit,
      min_quantity_threshold,
    } = req.body;

    if (!title || !quantity || !unit || !min_quantity_threshold) {
      return res.status(400).json({
        success: false,
        message: req.__("provide_required_fields"),
      });
    }

    const newItemId = await addInventoryItemDB(
      title,
      quantity,
      unit,
      min_quantity_threshold,
      tenantId,
      username
    );

    return res.status(200).json({
      success: true,
      message: req.__("inventory_item_added_success"),
      itemId: newItemId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"),
    });
  }
};

exports.getInventoryItems = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const tenantId = req.user.tenant_id;
    const status = req.query.status || null;
    const {items, statusCounts} = await getInventoryItemsDB(status, tenantId);
    return res.status(200).json({items, statusCounts});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("failed_to_fetch_inventory_items"),
    });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const itemId = req.params.id;
    const {
      title,
      unit,
      min_quantity_threshold,
    } = req.body;

    await updateInventoryItemDB(
      itemId,
      title,
      unit,
      min_quantity_threshold,
      tenantId
    );

    return res.status(200).json({
      success: true,
      message: req.__("inventory_item_updated_success"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("failed_to_update_inventory_item"),
    });
  }
};

exports.addInventoryItemStockMovement = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const username = req.user.username;
    const itemId = req.params.id;
    const { movementType, quantity, note } = req.body;

    if(!movementType){
      return res.status(400).json({
        success: false,
        message: req.__("provide_required_fields"),
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_quantity_provided"),
      });
    }

    await addInventoryItemStockMovementDB(req, itemId, movementType, quantity, note, tenantId, username);

    return res.status(200).json({
      success: true,
      message: req.__("stock_added_success"),
    });
  } catch (error) {
    console.error(error);

     const knownErrors = [
      req.__("inventory_item_not_found_message"),
      req.__("invalid_movement_type_message"),
      req.__("insufficient_inventory_quantity_message")
    ];

    if (knownErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: req.__("failed_to_add_stock"),
    });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const itemId = req.params.id;

    await deleteInventoryItemDB(itemId, tenantId);

    return res.status(200).json({
      success: true,
      message: req.__("inventory_item_deleted_success"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("failed_to_delete_inventory_item"),
    });
  }
};

exports.getInventoryLogs = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const from = req.query.from || null;
    const to = req.query.to || null;
    const type = req.query.type;
    const movementType = req.query.movementType || null;

    if(!type){
      return res.status(400).json({
        success: false,
        message: req.__("provide_required_details"),
      });
    }

    if (type == "custom") {
      if (!(from && to)) {
        return res.status(400).json({
          success: false,
          message: req.__("provide_from_to_dates"),
        });
      }
    }

    const logs = await getInventoryLogsDB(movementType, type, from, to, tenantId);
    return res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("failed_to_fetch_inventory_logs"),
    });
  }
};

exports.getInventoryDashboardData = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const from = req.query.from || null;
    const to = req.query.to || null;
    const type = req.query.type;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details"),
      });
    }

    if (type == "custom") {
      if (!(from && to)) {
        return res.status(400).json({
          success: false,
          message: req.__("provide_from_to_dates_error"),
        });
      }
    }

    const [cummulativeInventoryMovements, inventoryUsageVSCurrentStock] = await Promise.all([
      getCummulativeInventoryMovementsDB(type, from, to, tenantId),
      getInventoryUsageVsCurrentStockDB(type, from, to, tenantId),
    ]);

    return res.status(200).json({
      cummulativeInventoryMovements,
      inventoryUsageVSCurrentStock,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"),
    });
  }
};
