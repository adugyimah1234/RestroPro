import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBranches } from '../controllers/branch.controller';
import { getUserDetailsInLocalStorage, saveUserDetailsInLocalStorage } from '../helpers/UserDetails';
import { switchBranch } from '../controllers/auth.controller';
import { toast } from 'react-hot-toast';

export default function BranchSelector({ onBranchChange }) {
  const { t } = useTranslation();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
    // Get current selected branch from localStorage or user details
    const userDetails = getUserDetailsInLocalStorage();
    if (userDetails && userDetails.branch_id) {
      setSelectedBranchId(userDetails.branch_id);
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (branchId) => {
    try {
        toast.loading("Switching branch...");
        const response = await switchBranch(branchId);
        if (response.status === 200) {
            setSelectedBranchId(branchId);
            // Save selected branch to localStorage
            const userDetails = getUserDetailsInLocalStorage();
            if (userDetails) {
                userDetails.branch_id = branchId;
                saveUserDetailsInLocalStorage(userDetails);
            }
            toast.dismiss();
            toast.success("Branch switched successfully");
            window.location.reload();
        }
    } catch (error) {
        console.error('Error switching branch:', error);
        toast.dismiss();
        toast.error("Failed to switch branch");
    }
  };

  if (loading) {
    return <div className="text-sm">{t('branches.loading')}</div>;
  }

  if (branches.length === 0) {
    return <div className="text-sm text-gray-500">{t('branches.no_branches')}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="branch-select" className="text-sm font-medium">
        {t('branches.branch')}:
      </label>
      <select
        id="branch-select"
        value={selectedBranchId || ''}
        onChange={(e) => handleBranchChange(e.target.value)}
        className="text-sm rounded-lg px-3 py-1 border border-restro-border-green bg-restro-gray focus:outline-restro-border-green"
      >
        <option value="">{t('branches.select_branch')}</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}