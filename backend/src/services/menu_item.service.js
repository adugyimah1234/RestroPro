const { MenuItem, Category, Tax, MenuItemAddon, MenuItemVariant, MenuItemRecipe, InventoryItem, sequelize, Op } = require("../models");

const getWhereClause = (baseWhere, branchId) => {
    const where = { ...baseWhere };
    if (branchId !== undefined && branchId !== null && branchId !== '') {
        where.branch_id = branchId;
    }
    return where;
};

exports.addMenuItemDB = async (title, description, price, netPrice, taxId, categoryId, tenantId, branchId) => {
    try {
        const menuItemData = {
            title: title,
            description: description,
            price: price,
            net_price: netPrice,
            tax_id: taxId,
            category: categoryId,
            tenant_id: tenantId,
        };
        if (branchId !== undefined && branchId !== null && branchId !== '') {
            menuItemData.branch_id = branchId;
        }
        const menuItem = await MenuItem.create(menuItemData);
        return menuItem.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.updateMenuItemDB = async (id, title, description, price, netPrice, taxId, categoryId, tenantId, branchId) => {
    try {
        await MenuItem.update(
            {
                title: title,
                description: description,
                price: price,
                net_price: netPrice,
                tax_id: taxId,
                category: categoryId,
            },
            {
                where: getWhereClause({ id: id, tenant_id: tenantId }, branchId)
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.updateMenuItemImageDB = async (id, image, tenantId, branchId) => {
    try {
        await MenuItem.update(
            { image: image },
            { where: getWhereClause({ id: id, tenant_id: tenantId }, branchId) }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.deleteMenuItemDB = async (id, tenantId, branchId) => {
    try {
        await MenuItem.destroy({
            where: getWhereClause({ id: id, tenant_id: tenantId }, branchId)
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.changeMenuItemVisibilityDB = async (id, isEnabled, tenantId, branchId) => {
    try {
        await MenuItem.update(
            { is_enabled: isEnabled },
            { where: getWhereClause({ id: id, tenant_id: tenantId }, branchId) }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getAllMenuItemsDB = async (tenantId, branchId) => {
    try {
        const menuItems = await MenuItem.findAll({
            where: getWhereClause({ tenant_id: tenantId }, branchId),
            include: [
                {
                    model: Tax,
                    as: 'Tax',
                    attributes: [['title', 'tax_title'], ['rate', 'tax_rate'], ['type', 'tax_type']],
                    required: false // LEFT JOIN
                },
                {
                    model: Category,
                    as: 'Category',
                    attributes: [['title', 'category_title']],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'net_price',
                'tax_id',
                ['category', 'category_id'],
                'image',
                'is_enabled'
            ],
        });
        return menuItems.map(item => item.toJSON());
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getMenuItemDB = async (id, tenantId, branchId) => {
    try {
        const menuItem = await MenuItem.findOne({
            where: getWhereClause({ id: id, tenant_id: tenantId }, branchId),
            include: [
                {
                    model: Tax,
                    as: 'Tax',
                    attributes: [['title', 'tax_title'], ['rate', 'tax_rate'], ['type', 'tax_type']],
                    required: false // LEFT JOIN
                },
                {
                    model: Category,
                    as: 'Category',
                    attributes: [['title', 'category_title']],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'net_price',
                'tax_id',
                ['category', 'category_id'],
                'image',
                'is_enabled'
            ],
        });
        return menuItem ? menuItem.get({ plain: true }) : null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * @param {number} itemId Menu Item ID to add Addon
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<number>}
 *  */
exports.addMenuItemAddonDB = async (itemId, title, price, tenantId, branchId) => {
    try {
        const addonData = {
            item_id: itemId,
            title: title,
            price: price,
            tenant_id: tenantId
        };
        if (branchId !== undefined && branchId !== null && branchId !== '') {
            addonData.branch_id = branchId;
        }
        const menuItemAddon = await MenuItemAddon.create(addonData);
        return menuItemAddon.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<void>}
 *  */
exports.updateMenuItemAddonDB = async (itemId, addonId, title, price, tenantId, branchId) => {
    try {
        await MenuItemAddon.update(
            { title: title, price: price },
            { where: getWhereClause({ id: addonId, item_id: itemId, tenant_id: tenantId }, branchId) }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @returns {Promise<void>}
 *  */
exports.deleteMenuItemAddonDB = async (itemId, addonId, tenantId, branchId) => {
    try {
        await MenuItemAddon.destroy({
            where: getWhereClause({ id: addonId, item_id: itemId, tenant_id: tenantId }, branchId)
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @returns {Promise<Array>}
 *  */
exports.getMenuItemAddonsDB = async (itemId, tenantId, branchId) => {
    try {
        const menuItemAddons = await MenuItemAddon.findAll({
            where: getWhereClause({ item_id: itemId, tenant_id: tenantId }, branchId),
            attributes: ['id', 'item_id', 'title', 'price']
        });
        return menuItemAddons.map(addon => addon.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAllAddonsDB = async (tenantId, branchId) => {
    try {
        const allAddons = await MenuItemAddon.findAll({
            where: getWhereClause({ tenant_id: tenantId }, branchId),
            attributes: ['id', 'item_id', 'title', 'price']
        });
        return allAddons.map(addon => addon.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @param {number} itemId Menu Item ID to add Variant
 * @param {string} title Title of Variant
 * @param {number} price Additonal Price for Variant, Put 0 / null to make Variant as free option
 * @returns {Promise<number>}
 *  */
exports.addMenuItemVariantDB = async (itemId, title, price, tenantId, branchId) => {
    try {
        const variantData = {
            item_id: itemId,
            title: title,
            price: price,
            tenant_id: tenantId
        };
        if (branchId !== undefined && branchId !== null && branchId !== '') {
            variantData.branch_id = branchId;
        }
        const menuItemVariant = await MenuItemVariant.create(variantData);
        return menuItemVariant.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateMenuItemVariantDB = async (itemId, variantId, title, price, tenantId, branchId) => {
    try {
        await MenuItemVariant.update(
            { title: title, price: price },
            { where: getWhereClause({ id: variantId, item_id: itemId, tenant_id: tenantId }, branchId) }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteMenuItemVariantDB = async (itemId, variantId, tenantId, branchId) => {
    try {
        await MenuItemVariant.destroy({
            where: getWhereClause({ id: variantId, item_id: itemId, tenant_id: tenantId }, branchId)
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getMenuItemVariantsDB = async (itemId, tenantId, branchId) => {
    try {
        const menuItemVariants = await MenuItemVariant.findAll({
            where: getWhereClause({ item_id: itemId, tenant_id: tenantId }, branchId),
            attributes: ['id', 'item_id', 'title', 'price']
        });
        return menuItemVariants.map(variant => variant.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAllVariantsDB = async (tenantId, branchId) => {
    try {
        const allVariants = await MenuItemVariant.findAll({
            where: getWhereClause({ tenant_id: tenantId }, branchId),
            attributes: ['id', 'item_id', 'title', 'price']
        });
        return allVariants.map(variant => variant.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addRecipeItemDB = async (menuItemId, variantId, addonId, ingredientId, quantity, tenantId, branchId) => {
    try {
        const recipeData = {
            menu_item_id: menuItemId,
            variant_id: variantId,
            addon_id: addonId,
            inventory_item_id: ingredientId,
            quantity: quantity,
            tenant_id: tenantId
        };
        if (branchId !== undefined && branchId !== null && branchId !== '') {
            recipeData.branch_id = branchId;
        }
        const recipeItem = await MenuItemRecipe.create(recipeData);
        return recipeItem.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateRecipeItemDB = async (recipeItemId, menuItemId, variantId, addonId, ingredientId, quantity, tenantId, branchId) => {
    try {
        await MenuItemRecipe.update(
            {
                menu_item_id: menuItemId,
                variant_id: variantId,
                addon_id: addonId,
                inventory_item_id: ingredientId,
                quantity: quantity,
            },
            {
                where: getWhereClause({ id: recipeItemId, tenant_id: tenantId }, branchId)
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getRecipeItemsDB = async (menuItemId, tenantId, branchId) => {
    try {
        const recipeItems = await MenuItemRecipe.findAll({
            where: getWhereClause({ menu_item_id: menuItemId, tenant_id: tenantId }, branchId),
            include: [
                {
                    model: MenuItem,
                    as: 'MenuItem',
                    attributes: [['title', 'menu_item_title']],
                    required: false
                },
                {
                    model: MenuItemVariant,
                    as: 'MenuItemVariant',
                    attributes: [['title', 'variant_title']],
                    required: false
                },
                {
                    model: MenuItemAddon,
                    as: 'MenuItemAddon',
                    attributes: [['title', 'addon_title']],
                    required: false
                },
                {
                    model: InventoryItem,
                    as: 'Ingredient',
                    attributes: [['title', 'ingredient_title'], 'unit'],
                    required: false
                }
            ],
            attributes: [
                'id',
                'menu_item_id',
                'variant_id',
                'addon_id',
                'inventory_item_id',
                'quantity'
            ],
        });
        return recipeItems.map(item => item.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAllRecipeItemsDB = async (tenantId, branchId) => {
    try {
        const allRecipeItems = await MenuItemRecipe.findAll({
            where: getWhereClause({ tenant_id: tenantId }, branchId),
            include: [
                {
                    model: MenuItem,
                    as: 'MenuItem',
                    attributes: [['title', 'menu_item_title']],
                    required: false
                },
                {
                    model: MenuItemVariant,
                    as: 'MenuItemVariant',
                    attributes: [['title', 'variant_title']],
                    required: false
                },
                {
                    model: MenuItemAddon,
                    as: 'MenuItemAddon',
                    attributes: [['title', 'addon_title']],
                    required: false
                },
                {
                    model: InventoryItem,
                    as: 'Ingredient',
                    attributes: [
                        ['title', 'ingredient_title'],
                        'unit',
                        ['quantity', 'current_quantity'],
                        'min_quantity_threshold'
                    ],
                    required: false
                }
            ],
            attributes: [
                'id',
                'menu_item_id',
                'variant_id',
                'addon_id',
                'inventory_item_id',
                ['quantity', 'recipe_quantity']
            ],
        });
        return allRecipeItems.map(item => item.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteRecipeItemDB = async (itemId, recipeItemId, variant, addon, tenantId, branchId) => {
    try {
        let whereCondition = getWhereClause({
            menu_item_id: itemId,
            id: recipeItemId,
            tenant_id: tenantId
        }, branchId);

        if (variant) {
            whereCondition.variant_id = variant;
        }

        if (addon) {
            whereCondition.addon_id = addon;
        }

        await MenuItemRecipe.destroy({
            where: whereCondition
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.bulkAddMenuItemsDB = async (menuItems, branchId) => {
    try {
        if (!menuItems || menuItems.length === 0) {
            return 0;
        }

        const createdItems = await MenuItem.bulkCreate(menuItems.map(item => {
            const row = {
                title: item.title,
                description: item.description,
                price: item.price,
                net_price: item.netPrice,
                tax_id: item.taxId,
                category: item.categoryId,
                tenant_id: item.tenantId
            };
            if (branchId !== undefined && branchId !== null && branchId !== '') {
                row.branch_id = branchId;
            }
            return row;
        }));
        return createdItems.length;
    } catch (error) {
        console.error(error);
        throw error;
    }
};