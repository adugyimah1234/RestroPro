const { Branch, Tenant } = require('../models');
const sequelize = require('../config/sequelize');
const { assertTenantCanCreate, PlanLimitReachedError } = require('../services/planLimits.service');

exports.getBranches = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branches = await Branch.findAll({
      where: { tenant_id: tenantId },
      order: [['createdAt', 'DESC']]
    });
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Error fetching branches' });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { name, address, phone, email, is_active } = req.body;

    const branch = await sequelize.transaction(async (transaction) => {
      await assertTenantCanCreate(tenantId, 'branches', transaction);
      return Branch.create({
        tenant_id: tenantId,
        name,
        address,
        phone,
        email,
        is_active: is_active !== undefined ? is_active : true
      }, { transaction });
    });

    res.status(201).json(branch);
  } catch (error) {
    if (error instanceof PlanLimitReachedError) {
      return res.status(403).json({
        code: error.code,
        resource: error.resource,
        limit: error.limit,
        current: error.current,
        message: error.message,
      });
    }
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Error creating branch' });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, is_active } = req.body;
    const tenantId = req.user.tenant_id;

    const branch = await Branch.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.update({
      name,
      address,
      phone,
      email,
      is_active
    });

    res.json(branch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Error updating branch' });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;

    const branch = await Branch.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.destroy();
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ message: 'Error deleting branch' });
  }
};