import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Page from '../../components/Page';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../controllers/branch.controller';
import { toast } from 'react-hot-toast';
import { IconPlus, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { iconStroke } from '../../config/config';

export default function BranchesPage() {
  const { t } = useTranslation();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await getBranches();
      setBranches(res.data);
    } catch (error) {
      console.error(error);
      toast.error(t('branches.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, formData);
        toast.success(t('branches.updated_successfully'));
      } else {
        await createBranch(formData);
        toast.success(t('branches.created_successfully'));
      }
      fetchBranches();
      document.getElementById("modal-add-edit").close();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(t('branches.error_saving'));
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      is_active: branch.is_active
    });
    document.getElementById("modal-add-edit").showModal();
  };

  const handleDelete = async (id) => {
    if (!confirm(t('branches.confirm_delete'))) return;
    try {
      await deleteBranch(id);
      toast.success(t('branches.deleted_successfully'));
      fetchBranches();
    } catch (error) {
      console.error(error);
      toast.error(t('branches.error_deleting'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      is_active: true
    });
    setEditingBranch(null);
  };

  if (loading) {
    return <Page className="px-8 py-6">{t('branches.loading')}</Page>;
  }

  return (
    <Page className="px-8 py-6">
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t('branches.title')}</h3>
        <button
          onClick={() => document.getElementById("modal-add-edit").showModal()}
          className="text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover"
        >
          <IconPlus size={22} stroke={iconStroke} /> {t('branches.add_branch')}
        </button>
      </div>

      <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`px-4 py-3 rounded-2xl flex flex-wrap items-center gap-2 text-sm border border-restro-border-green ${!branch.is_active ? 'bg-gray-200 dark:bg-gray-900 opacity-50' : ''}`}
          >
            <div className="flex-1">
              <p className="font-medium">{branch.name}</p>
              <p className="text-gray-400 text-xs">{branch.address}</p>
              <p className="text-gray-400 text-xs">{branch.phone} | {branch.email}</p>
              <span className={`text-xs px-2 py-1 rounded ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {branch.is_active ? t('branches.active') : t('branches.inactive')}
              </span>
            </div>
            <div className="flex gap-0">
              <button
                onClick={() => handleEdit(branch)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover"
              >
                <IconEdit stroke={iconStroke} />
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95 hover:bg-restro-button-hover"
              >
                <IconTrash stroke={iconStroke} />
              </button>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('branches.no_branches')}</p>
          </div>
        )}
      </div>

      <dialog id="modal-add-edit" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box border border-restro-border-green dark:rounded-2xl">
          <h3 className="font-bold text-lg">
            {editingBranch ? t('branches.edit_branch') : t('branches.add_branch')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="py-4 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-gray-500 text-sm">{t('branches.name')}</label>
                <input
                  id="name"
                  type="text"
                  className="text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="mb-1 block text-gray-500 text-sm">{t('branches.address')}</label>
                <textarea
                  id="address"
                  className="text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-gray-500 text-sm">{t('branches.phone')}</label>
                <input
                  id="phone"
                  type="tel"
                  className="text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-gray-500 text-sm">{t('branches.email')}</label>
                <input
                  id="email"
                  type="email"
                  className="text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="text-sm text-gray-500">{t('branches.active')}</label>
              </div>
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text"
                onClick={() => {
                  document.getElementById("modal-add-edit").close();
                  resetForm();
                }}
              >
                {t('branches.cancel')}
              </button>
              <button
                type="submit"
                className="rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover"
              >
                {editingBranch ? t('branches.update') : t('branches.create')}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Page>
  );
}