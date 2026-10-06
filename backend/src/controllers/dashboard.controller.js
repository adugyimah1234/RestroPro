const { getTodaysTopSellingItemsDB, getTodaysOrdersCountDB, getTodaysNewCustomerCountDB, getTodaysRepeatCustomerCountDB } = require("../services/dashboard.service");
const { getReservationsDB } = require("../services/reservation.service");
const { getCurrencyDB } = require("../services/settings.service");

exports.getDashboardData = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const branchId = req.user.branch_id;
        
        const [ reservations, topSellingItems, ordersCount, newCustomerCount, repeatedCustomerCount, currency ] = await Promise.all([
            getReservationsDB("today", null, null, tenantId, branchId),
            getTodaysTopSellingItemsDB(tenantId, branchId),
            getTodaysOrdersCountDB(tenantId, branchId),
            getTodaysNewCustomerCountDB(tenantId, branchId),
            getTodaysRepeatCustomerCountDB(tenantId, branchId),
            getCurrencyDB(tenantId, branchId)
        ]);

        return res.status(200).json({
            reservations, topSellingItems, ordersCount, newCustomerCount, repeatedCustomerCount, currency
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
