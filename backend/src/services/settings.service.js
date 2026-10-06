
const { CONFIG } = require("../config");
const { StoreDetails, PrintSetting, Tax, PaymentType, StoreTable, Category, QrOrder, QrOrderItem, Customer, Feedback, sequelize, Op } = require("../models");


exports.getTenantIdFromQRCode = async (qrcode) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: { unique_qr_code: qrcode },
            attributes: ['tenant_id']
        });
        return storeDetail?.tenant_id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantIdFromIdentifier = async (identifier) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: {
                [Op.or]: [
                    { unique_qr_code: identifier },
                    { tenant_slug: identifier }
                ]
            },
            attributes: ['tenant_id']
        });
        return storeDetail?.tenant_id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.setTenantSlugDB = async (tenantId, tenantSlug) => {
    try {
        await StoreDetails.update(
            { tenant_slug: tenantSlug },
            { where: { tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getCurrencyDB = async (tenantId) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: { tenant_id: tenantId },
            attributes: ['currency']
        });
        return storeDetail?.currency;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getStoreSettingDB = async (tenantId) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: { tenant_id: tenantId },
            attributes: [
                'tenant_id',
                'store_image',
                'store_name',
                'address',
                'phone',
                'email',
                'currency',
                'is_qr_menu_enabled',
                'unique_qr_code',
                'is_qr_order_enabled',
                'is_feedback_enabled',
                'unique_id',
                'tenant_slug'
            ]
        });
        return storeDetail;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.setStoreSettingDB = async (storeName, address, phone, email, currency, isQRMenuEnabled, isQROrderEnabled , uniqueQRCode, isFeedbackEnabled, tenantId) => {
    try {
        await StoreDetails.upsert({
            tenant_id: tenantId,
            store_name: storeName,
            address: address,
            phone: phone,
            email: email,
            currency: currency,
            is_qr_menu_enabled: isQRMenuEnabled,
            is_qr_order_enabled: isQROrderEnabled,
            unique_qr_code: uniqueQRCode,
            is_feedback_enabled: isFeedbackEnabled,
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.uploadStoreImageDB = async (image, uniqueId, tenantId) => {
    try {
        await StoreDetails.upsert({
            tenant_id: tenantId,
            store_image: image,
            unique_id: uniqueId,
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteStoreImageDB = async (image, uniqueId, tenantId) => {
    try {
        await StoreDetails.update(
            { store_image: image },
            { where: { unique_id: uniqueId, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateServiceChargeDB = async (serviceCharge, tenantId) => {
    try {
        await StoreDetails.upsert({
            tenant_id: tenantId,
            service_charge: serviceCharge,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getServiceChargeDB = async (tenantId) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: { tenant_id: tenantId },
            attributes: ['service_charge']
        });
        return storeDetail?.service_charge || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getQRMenuCodeDB = async (tenantId) => {
    try {
        const storeDetail = await StoreDetails.findOne({
            where: { tenant_id: tenantId },
            attributes: ['unique_qr_code']
        });
        return storeDetail?.unique_qr_code || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateQRMenuCodeDB = async (uniqueQRCode, tenantId) => {
    try {
        await StoreDetails.update(
            { unique_qr_code: uniqueQRCode },
            { where: { tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getPrintSettingDB = async (tenantId) => {
    try {
        const printSetting = await PrintSetting.findOne({
            where: { tenant_id: tenantId },
            attributes: [
                'page_format',
                'header',
                'footer',
                'show_notes',
                'is_enable_print',
                'show_store_details',
                'show_customer_details',
                'print_token'
            ]
        });
        return printSetting;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.setPrintSettingDB = async (pageFormat, header, footer, showNotes, isEnablePrint, showStoreDetails, showCustomerDetails, printToken, tenantId) => {
    try {
        await PrintSetting.upsert({
            tenant_id: tenantId,
            page_format: pageFormat,
            header: header,
            footer: footer,
            show_notes: showNotes,
            is_enable_print: isEnablePrint,
            show_store_details: showStoreDetails,
            show_customer_details: showCustomerDetails,
            print_token: printToken,
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addTaxDB = async (title, rate, type, tenantId) => {
    try {
        const tax = await Tax.create({
            title: title,
            rate: rate,
            type: type,
            tenant_id: tenantId,
        });
        return tax.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTaxesDB = async (tenantId) => {
    try {
        const taxes = await Tax.findAll({
            where: { tenant_id: tenantId },
            attributes: ['id', 'title', 'rate', 'type']
        });
        return taxes;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTaxDB = async (taxId, tenantId) => {
    try {
        const tax = await Tax.findOne({
            where: { id: taxId, tenant_id: tenantId },
            attributes: ['id', 'title', 'rate', 'type']
        });
        return tax;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteTaxDB = async (id, tenantId) => {
    try {
        await Tax.destroy({
            where: { id: id, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateTaxDB = async (id, title, rate, type, tenantId) => {
    try {
        await Tax.update(
            { title: title, rate: rate, type: type },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


exports.addPaymentTypeDB = async (title, isActive, tenantId, icon) => {
    try {
        const paymentType = await PaymentType.create({
            title: title,
            is_active: isActive,
            tenant_id: tenantId,
            icon: icon,
        });
        return paymentType.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getPaymentTypesDB = async (activeOnly=false, tenantId) => {
    try {
        const whereCondition = { tenant_id: tenantId };
        if (activeOnly) {
            whereCondition.is_active = true;
        }

        const paymentTypes = await PaymentType.findAll({
            where: whereCondition,
            attributes: ['id', 'title', 'is_active', 'icon']
        });
        return paymentTypes;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updatePaymentTypeDB = async (id, title, isActive, tenantId, icon) => {
    try {
        await PaymentType.update(
            { title: title, is_active: isActive, icon: icon },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.togglePaymentTypeDB = async (id, isActive, tenantId) => {
    try {
        await PaymentType.update(
            { is_active: isActive },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deletePaymentTypeDB = async (id, tenantId) => {
    try {
        await PaymentType.destroy({
            where: { id: id, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addStoreTableDB = async (title, floor, seatingCapacity, tenantId) => {
    try {
        const storeTable = await StoreTable.create({
            table_title: title,
            floor: floor,
            seating_capacity: seatingCapacity,
            tenant_id: tenantId,
        });
        return storeTable.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getStoreTablesDB = async (tenantId) => {
    try {
        const storeTables = await StoreTable.findAll({
            where: { tenant_id: tenantId },
            attributes: [
                'id',
                'table_title',
                'floor',
                'seating_capacity',
                [sequelize.literal(`HEX(AES_ENCRYPT(HEX(id), '${CONFIG.ENCRYPTION_KEY}'))`), 'encrypted_id']
            ]
        });
        return storeTables;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getStoreTableByEncryptedIdDB = async (tenantId, encryptedTableId) => {
    try {
        const storeTable = await StoreTable.findOne({
            where: {
                tenant_id: tenantId,
                id: sequelize.literal(`AES_DECRYPT(UNHEX('${encryptedTableId}'), '${CONFIG.ENCRYPTION_KEY}')`)
            },
            attributes: [
                'id',
                'table_title',
                'floor',
                'seating_capacity'
            ]
        });

        return storeTable || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateStoreTableDB = async (id, title, floor, seatingCapacity, tenantId) => {
    try {
        await StoreTable.update(
            { table_title: title, floor: floor, seating_capacity: seatingCapacity },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteStoreTableDB = async (id, tenantId) => {
    try {
        await StoreTable.destroy({
            where: { id: id, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addCategoryDB = async (title, tenantId) => {
    try {
        const category = await Category.create({
            title: title,
            tenant_id: tenantId,
        });
        return category.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getCategoriesDB = async (tenantId) => {
    try {
        const categories = await Category.findAll({
            where: { tenant_id: tenantId },
            attributes: ['id', 'title', 'is_enabled']
        });
        return categories;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateCategoryDB = async (id, title, tenantId) => {
    try {
        await Category.update(
            { title: title },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteCategoryDB = async (id, tenantId) => {
    try {
        await Category.destroy({
            where: { id: id, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.changeCategoryVisibiltyDB = async (id, isEnabled, tenantId) => {
    try {
        await Category.update(
            { is_enabled: isEnabled },
            { where: { id: id, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.bulkAddCategoriesDB = async (categoryTitles, tenantId) => {
    try {
        if (!categoryTitles || categoryTitles.length === 0) {
            return 0;
        }

        const existing = await Category.findAll({
            where: { tenant_id: tenantId },
            attributes: ['title']
        });

        const existingSet = new Set(existing.map(c => c.title.trim().toLowerCase()));

        const toInsert = [];
        const addedTitles = new Set();

        for (const title of categoryTitles) {
            const cleanTitle = title.trim();
            if (!cleanTitle) continue;

            const lower = cleanTitle.toLowerCase();
            if (!existingSet.has(lower) && !addedTitles.has(lower)) {
                toInsert.push({
                    title: cleanTitle,
                    tenant_id: tenantId,
                    is_enabled: true
                });
                addedTitles.add(lower);
            }
        }

        if (toInsert.length === 0) {
            return 0;
        }

        const created = await Category.bulkCreate(toInsert);
        return created.length;
    } catch (error) {
        console.error("Error bulk adding categories:", error);
        throw error;
    }
}

exports.placeOrderViaQrMenuDB = async (tenantId, deliveryType , cartItems, customerType, customerId, tableId, customerName ,paymentStatus = 'pending') => {
    const t = await sequelize.transaction();

    try {
      // step 1: save data to orders table
      const qrOrder = await QrOrder.create({
        delivery_type: deliveryType,
        customer_type: customerType,
        customer_id: customerId,
        table_id: tableId,
        payment_status: paymentStatus || 'pending',
        tenant_id: tenantId
      }, { transaction: t });

      const orderId = qrOrder.id;

      // step 2: save data to order_items
      const orderItems = cartItems.map((item) => ({
        order_id: orderId,
        item_id: item.id,
        variant_id: item.variant_id,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes,
        addons: item?.addons_ids?.length > 0 ? JSON.stringify(item.addons_ids) : null,
        tenant_id: tenantId
      }));
      await QrOrderItem.bulkCreate(orderItems, { transaction: t });


			// Step 3 : Search customer by phone in customer table - if not existing - create one
			if(customerId){
				const existingCustomer = await Customer.findOne({
                    where: { phone: customerId, tenant_id: tenantId },
                    transaction: t
                });


				if (!existingCustomer) {
					await Customer.create({
                        phone: customerId,
                        name: customerName,
                        tenant_id: tenantId
                    }, { transaction: t });
				}
			}


      await t.commit();

      return {
        orderId
      }
    } catch (error) {
      console.error(error);
      await t.rollback();
      throw error;
    }
  };

exports.saveFeedbackDB = async (tenantId, invoiceId, customerId, phone, name, email, birthdate, averageRating, food_quality, service, ambiance, staff_behavior, recommend, remarks) => {
    const t = await sequelize.transaction();

    try {
        const existingCustomer = await Customer.findOne({
            where: { phone: customerId || phone, tenant_id: tenantId },
            transaction: t
        });

        if (!existingCustomer) {
            await Customer.create({
                phone: phone,
                name: name,
                email: email || null,
                birth_date: birthdate || null,
                tenant_id: tenantId
            }, { transaction: t });
        }

        const uniqueCustomerId = customerId || phone || null;

        await Feedback.create({
            invoice_id: invoiceId,
            phone: uniqueCustomerId,
            created_by: null, // Assuming created_by is always null based on the original query
            average_rating: averageRating,
            food_quality_rating: food_quality,
            service_rating: service,
            staff_behavior_rating: staff_behavior,
            ambiance_rating: ambiance,
            recommend_rating: recommend,
            remarks: remarks || null,
            tenant_id: tenantId
        }, { transaction: t });

        await t.commit();

        return;
    } catch (error) {
        console.error(error);
        await t.rollback();
        throw error;
    }
};
