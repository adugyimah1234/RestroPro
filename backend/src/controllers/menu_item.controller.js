const { addMenuItemDB, updateMenuItemDB, deleteMenuItemDB, addMenuItemAddonDB, updateMenuItemAddonDB, deleteMenuItemAddonDB, getMenuItemAddonsDB, getAllAddonsDB, addMenuItemVariantDB, updateMenuItemVariantDB, deleteMenuItemVariantDB, getMenuItemVariantsDB, getAllVariantsDB, getAllMenuItemsDB, getMenuItemDB, updateMenuItemImageDB, changeMenuItemVisibilityDB, getRecipeItemsDB, addRecipeItemDB, deleteRecipeItemDB, updateRecipeItemDB, bulkAddMenuItemsDB } = require("../services/menu_item.service");

const path = require("path")
const fs = require("fs");
const Papa = require("papaparse");
const { getInventoryItemsDB } = require("../services/inventory.service");
const { Category } = require("../models");

exports.addMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const {title, description, price, netPrice, taxId, categoryId} = req.body;

        if (!title || price === undefined || price === null || price === "" || isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_provide_required_details") // Translate message
            });
        }

        const numericPrice = Number(price);
        const numericNetPrice = (netPrice !== undefined && netPrice !== null && netPrice !== "" && !isNaN(Number(netPrice))) ? Number(netPrice) : null;

        const menuItemId = await addMenuItemDB(title, description, numericPrice, numericNetPrice, taxId, categoryId, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_added"), // Translate message
            menuItemId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;
        const {title, description, price, netPrice, taxId, categoryId} = req.body;

        if (!title || price === undefined || price === null || price === "" || isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_provide_required_details") // Translate message
            });
        }

        const numericPrice = Number(price);
        const numericNetPrice = (netPrice !== undefined && netPrice !== null && netPrice !== "" && !isNaN(Number(netPrice))) ? Number(netPrice) : null;

        await updateMenuItemDB(id, title, description, numericPrice, numericNetPrice, taxId, categoryId, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_updated") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.uploadMenuItemPhoto = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;

        const file = req.files.image;

        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + id;

        if(!fs.existsSync(path.join(__dirname, `../../public/${tenantId}/`))) {
            fs.mkdirSync(path.join(__dirname, `../../public/${tenantId}/`));
        }

        const imageURL = `/public/${tenantId}/${id}`;

        await file.mv(imagePath);
        await updateMenuItemImageDB(id, imageURL, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_image_uploaded"), // Translate message
            imageURL: imageURL
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.removeMenuItemPhoto = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;
        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + id;

        fs.unlinkSync(imagePath)

        await updateMenuItemImageDB(id, null, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_image_removed") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;

        await deleteMenuItemDB(id, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_deleted") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.changeMenuItemVisibility = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;
        const isEnabled = req.body.isEnabled;

        await changeMenuItemVisibilityDB(id, isEnabled, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_visibility_updated") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getAllMenuItems = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const [menuItems, addons, variants] = await Promise.all([
            getAllMenuItemsDB(tenantId, branchId),
            getAllAddonsDB(tenantId, branchId),
            getAllVariantsDB(tenantId, branchId)
        ]);

        const formattedMenuItems = menuItems.map(item => {
            const itemAddons = addons.filter(addon => addon.item_id == item.id);
            const itemVariants = variants.filter(variant => variant.item_id == item.id);

            return {
                ...item,
                addons: [...itemAddons],
                variants: [...itemVariants],
            }
        })

        return res.status(200).json(formattedMenuItems);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const id = req.params.id;

        const [menuItem, addons, variants, recipeItems, inventoryItemsResult] = await Promise.all([
            getMenuItemDB(id, tenantId, branchId),
            getMenuItemAddonsDB(id, tenantId, branchId),
            getMenuItemVariantsDB(id, tenantId, branchId),
            getRecipeItemsDB(id, tenantId, branchId), //Menu item Recipe Items
            getInventoryItemsDB('all' /**status */, tenantId, branchId)
        ]);

        const formattedMenuItem = {
            ...menuItem,
            addons: [...addons],
            variants: [...variants],
            recipeItems: [...recipeItems],
        }

        const { items: inventoryItems } = inventoryItemsResult;

        return res.status(200).json({formattedMenuItem, inventoryItems});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

/* Addons */
exports.addMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_addon_provide_required_details") // Translate message
            });
        }

        const menuItemAddonId = await addMenuItemAddonDB(itemId, title, price, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_added"), // Translate message
            addonId: menuItemAddonId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.updateMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const addonId = req.params.addonId;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_addon_provide_required_details") // Translate message
            });
        }

        await updateMenuItemAddonDB(itemId, addonId, title, price, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_updated"), // Translate message
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.deleteMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const addonId = req.params.addonId;

        await deleteMenuItemAddonDB(itemId, addonId, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_deleted"), // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getMenuItemAddons = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;

        const itemAddons = await getMenuItemAddonsDB(itemId, tenantId, branchId);

        if(itemAddons.length == 0) {
            return res.status(404).json({
                success: false,
                message: req.__("no_addons_found_for_item") // Translate message
            });
        }

        return res.status(200).json(itemAddons);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getAllAddons = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const addons = await getAllAddonsDB(tenantId, branchId);

        return res.status(200).json(addons);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
/* Addons */


/* Variants */
exports.addMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_variant_provide_required_details") // Translate message
            });
        }

        const menuItemVariantId = await addMenuItemVariantDB(itemId, title, price, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_added"), // Translate message
            variantId: menuItemVariantId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.updateMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const variantId = req.params.variantId;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_variant_provide_required_details") // Translate message
            });
        }

        await updateMenuItemVariantDB(itemId, variantId, title, price, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_updated") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.deleteMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const variantId = req.params.variantId;

        await deleteMenuItemVariantDB(itemId, variantId, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_deleted") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getMenuItemVariants = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;

        const itemVariants = await getMenuItemVariantsDB(itemId, tenantId, branchId);

        if(itemVariants.length == 0) {
            return res.status(404).json({
                success: false,
                message: req.__("no_variants_found_for_item") // Translate message
            });
        }

        return res.status(200).json(itemVariants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getAllVariants = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const allVariants = await getAllVariantsDB(tenantId, branchId);

        return res.status(200).json(allVariants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
/* Variants */


/** Recipes */
exports.addRecipeItem = async (req, res) => {
    try {
      const tenantId = req.user.tenant_id;
      const branchId = req.user.branch_id;
      const menuItemId = req.params.id;
      const { variantId, addonId, ingredientId, quantity } = req.body;

      if (!menuItemId || !variantId && !addonId && !ingredientId) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required data"
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid quantity."
        });
      }

      const recipeItemId = await addRecipeItemDB(menuItemId, variantId, addonId, ingredientId, quantity, tenantId, branchId);

      return res.status(200).json({
        success: true,
        message: "Recipe Item Added.",
        recipeItemId: recipeItemId
      });
    } catch (error) {
      console.error(error);

      if (error.errno === 1062) {
        return res.status(400).json({
          success: false,
          message: "Recipe item already exists. Please update the quantity if needed."
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong! Please try again later."
      });
    }
  };

  exports.updateRecipeItem = async (req, res) => {
    try {
      const tenantId = req.user.tenant_id;
      const branchId = req.user.branch_id;
      const menuItemId = req.params.id;
      const recipeItemId = req.params.recipeItemId;
      const { variantId, addonId, ingredientId, quantity } = req.body;

      if (!menuItemId || !recipeItemId || (!variantId && !addonId && !ingredientId)) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required data.",
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid quantity.",
        });
      }

      await updateRecipeItemDB(recipeItemId, menuItemId, variantId, addonId, ingredientId, quantity, tenantId, branchId);

      return res.status(200).json({
        success: true,
        message: "Recipe Item Updated.",
      });
    } catch (error) {
      console.error(error);

      if (error.errno === 1062) {
        return res.status(400).json({
          success: false,
          message: "Recipe item already exists. Please update the quantity if needed."
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong! Please try again later.",
      });
    }
  };


  exports.getRecipeItems = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const menuItemId = req.params.id;

        const recipeItems = await getRecipeItemsDB(menuItemId, tenantId, branchId);

        return res.status(200).json(recipeItems);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again later."
        });
    }
 };

 exports.deleteRecipeItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        const itemId = req.params.id;
        const recipeItemId = req.params.recipeItemId;

        const {variant = null, addon = null} = req.query;

        await deleteRecipeItemDB(itemId, recipeItemId, variant, addon, tenantId, branchId);

        return res.status(200).json({
            success: true,
            message: "Recipe Item Deleted.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};

/** Recipes*/

exports.bulkUploadMenuItems = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: req.__("no_files_uploaded")
            });
        }

        const file = req.files.file; // Assuming the file input name is 'file'

        const isCsvFile = (file.name && file.name.toLowerCase().endsWith('.csv')) ||
            ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'text/comma-separated-values', 'application/csv'].includes(file.mimetype);

        if (!isCsvFile) {
            return res.status(400).json({
                success: false,
                message: req.__("only_csv_files_allowed")
            });
        }

        let csvString = "";
        if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            csvString = fs.readFileSync(file.tempFilePath, 'utf8');
        } else if (file.data && file.data.length > 0) {
            csvString = file.data.toString('utf8');
        }

        csvString = csvString.replace(/^\uFEFF/, '');

        if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            try {
                fs.unlinkSync(file.tempFilePath);
            } catch (e) {
                // ignore unlink cleanup error
            }
        }

        if (!csvString.trim()) {
            return res.status(400).json({
                success: false,
                message: req.__("no_valid_menu_items_found_in_file"),
                errors: []
            });
        }

        const results = await new Promise((resolve, reject) => {
            Papa.parse(csvString, {
                header: true,
                skipEmptyLines: 'greedy',
                transformHeader: (h) => h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s\-]+/g, '_'),
                complete: (results) => resolve(results),
                error: (error) => reject(error)
            });
        });

        // Fetch existing categories for tenant
        const existingCategories = await Category.findAll({
            where: { tenant_id: tenantId }
        });

        // Map category title (lowercase) -> Category ID and Category ID -> Category ID
        const categoryMap = new Map();
        existingCategories.forEach(cat => {
            if (cat.title) {
                categoryMap.set(cat.title.trim().toLowerCase(), cat.id);
            }
            categoryMap.set(String(cat.id), cat.id);
        });

        const menuItemsToInsert = [];
        const errors = [];

        for (const [index, row] of results.data.entries()) {
            const lineNumber = index + 2; // +1 for header, +1 for 0-based index

            // Clean row keys
            const normalizedRow = {};
            for (const key of Object.keys(row)) {
                const cleanKey = key.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s\-]+/g, '_');
                normalizedRow[cleanKey] = row[key];
            }

            const title = (normalizedRow.title || normalizedRow.item_title || normalizedRow.name || "").toString().trim();
            const description = (normalizedRow.description || normalizedRow.desc) ? String(normalizedRow.description || normalizedRow.desc).trim() : null;

            const rawPrice = normalizedRow.price ?? normalizedRow.item_price;
            const price = (rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== "")
                ? parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ''))
                : NaN;

            const rawNetPrice = normalizedRow.net_price ?? normalizedRow.netprice ?? normalizedRow.item_net_price;
            const netPrice = (rawNetPrice !== undefined && rawNetPrice !== null && String(rawNetPrice).trim() !== "" && !isNaN(parseFloat(String(rawNetPrice).replace(/[^0-9.-]+/g, ''))))
                ? parseFloat(String(rawNetPrice).replace(/[^0-9.-]+/g, ''))
                : null;

            const taxId = (normalizedRow.tax_id && !isNaN(parseInt(normalizedRow.tax_id))) ? parseInt(normalizedRow.tax_id) : null;

            // Handle Category: check category title first, then category_id
            let categoryId = null;
            const categoryInput = (normalizedRow.category || normalizedRow.category_name || normalizedRow.category_title || "").toString().trim();
            const rawCategoryId = (normalizedRow.category_id && !isNaN(parseInt(normalizedRow.category_id))) ? parseInt(normalizedRow.category_id) : null;

            if (categoryInput) {
                const categoryKey = categoryInput.toLowerCase();
                if (categoryMap.has(categoryKey)) {
                    categoryId = categoryMap.get(categoryKey);
                } else {
                    // Auto-create category if it doesn't exist yet
                    try {
                        const newCategory = await Category.create({
                            title: categoryInput,
                            tenant_id: tenantId,
                            is_enabled: true
                        });
                        categoryId = newCategory.id;
                        categoryMap.set(categoryKey, newCategory.id);
                        categoryMap.set(String(newCategory.id), newCategory.id);
                    } catch (catErr) {
                        console.error("Error auto-creating category during bulk upload:", catErr);
                    }
                }
            } else if (rawCategoryId) {
                if (categoryMap.has(String(rawCategoryId))) {
                    categoryId = rawCategoryId;
                }
            }

            if (!title || isNaN(price) || price < 0) {
                errors.push({
                    line: lineNumber,
                    message: req.__("menu_item_bulk_upload_missing_required_fields")
                });
                continue;
            }

            menuItemsToInsert.push({
                title,
                description,
                price,
                netPrice,
                taxId,
                categoryId,
                tenantId
            });
        }

        if (menuItemsToInsert.length === 0) {
            return res.status(400).json({
                success: false,
                message: req.__("no_valid_menu_items_found_in_file"),
                errors: errors
            });
        }

        try {
            const insertedCount = await bulkAddMenuItemsDB(menuItemsToInsert, branchId);
            return res.status(200).json({
                success: true,
                message: req.__("menu_items_bulk_uploaded_successfully", { count: insertedCount }),
                errors: errors
            });
        } catch (dbError) {
            console.error("Database error during bulk upload:", dbError);
            errors.push({
                line: "N/A",
                message: req.__("database_error_during_bulk_upload")
            });
            return res.status(500).json({
                success: false,
                message: req.__("something_went_wrong_try_later"),
                errors: errors
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};
