const { Feedback, Customer, sequelize, Op } = require("../models");

exports.getOverallFeedbackSummaryDB = async (tenantId, branchId) => {
    try {
        const summary = await Feedback.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN average_rating BETWEEN 4.5 AND 5 THEN 1 END')), 'loved'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN average_rating BETWEEN 3.5 AND 4.4 THEN 1 END')), 'good'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN average_rating BETWEEN 2.5 AND 3.4 THEN 1 END')), 'average'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN average_rating BETWEEN 1.5 AND 2.4 THEN 1 END')), 'bad'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN average_rating BETWEEN 1 AND 1.4 THEN 1 END')), 'worst']
            ],
            where: { tenant_id: tenantId, branch_id: branchId },
            raw: true,
        });
        return summary;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getOverallFeedbackSummaryByQuestionDB = async (tenantId, branchId) => {
    try {
        const summary = await Feedback.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('food_quality_rating')), 'food_quality_rating'],
                [sequelize.fn('AVG', sequelize.col('service_rating')), 'service_rating'],
                [sequelize.fn('AVG', sequelize.col('staff_behavior_rating')), 'staff_behavior_rating'],
                [sequelize.fn('AVG', sequelize.col('ambiance_rating')), 'ambiance_rating'],
                [sequelize.fn('AVG', sequelize.col('recommend_rating')), 'recommend_rating'],
                [sequelize.fn('AVG', sequelize.col('average_rating')), 'average_rating']
            ],
            where: { tenant_id: tenantId, branch_id: branchId },
            raw: true,
        });
        return summary;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getFeedbacksDB = async (type, from, to, tenantId, branchId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const feedbacks = await Feedback.findAll({
            where: { tenant_id: tenantId, branch_id: branchId, ...filterCondition },
            include: [
                {
                    model: Customer,
                    as: 'Customer', // Assuming Feedback belongsTo Customer
                    attributes: [['name', 'customer_name']],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'invoice_id',
                ['phone', 'phone'], // Keep phone as is
                [sequelize.col('Customer.name'), 'customer_name'],
                'average_rating',
                'food_quality_rating',
                'service_rating',
                'staff_behavior_rating',
                'ambiance_rating',
                'recommend_rating',
                'remarks',
                'created_at'
            ],
            order: [['created_at', 'DESC']],
        });
        return feedbacks;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getFeedbackDB = async (id, tenantId, branchId) => {
    try {
        const feedback = await Feedback.findOne({
            where: { id: id, tenant_id: tenantId, branch_id: branchId },
            include: [
                {
                    model: Customer,
                    as: 'Customer', // Assuming Feedback belongsTo Customer
                    attributes: [['name', 'customer_name']],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'invoice_id',
                ['phone', 'phone'], // Keep phone as is
                [sequelize.col('Customer.name'), 'customer_name'],
                'average_rating',
                'food_quality_rating',
                'service_rating',
                'staff_behavior_rating',
                'ambiance_rating',
                'recommend_rating',
                'remarks',
                'created_at'
            ],
        });
        return feedback;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.searchFeedbacksDB = async (search, tenantId, branchId) => {
    try {
        const feedbacks = await Feedback.findAll({
            where: {
                tenant_id: tenantId,
                branch_id: branchId,
                [Op.or]: [
                    { invoice_id: search },
                    { phone: { [Op.like]: `${search}%` } },
                    { '$Customer.name$': { [Op.like]: `%${search}%` } }
                ]
            },
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: [],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'invoice_id',
                ['created_at', 'date'], // Assuming 'date' in original query refers to created_at
                ['phone', 'phone'],
                [sequelize.col('Customer.name'), 'name'],
                'average_rating',
                'food_quality_rating',
                'service_rating',
                'staff_behavior_rating',
                'ambiance_rating',
                'recommend_rating',
                'remarks'
            ],
            order: [['created_at', 'DESC']],
        });
        return feedbacks;
    } catch (error) {
        console.error(error);
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
