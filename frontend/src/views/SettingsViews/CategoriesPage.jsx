import { useRef, useState } from "react";
import Page from "../../components/Page";
import { IconDownload, IconEye, IconEyeOff, IconFileTypeCsv, IconPencil, IconPlus, IconTableImport, IconTrash } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { addCategory, deleteCategory, updateCategory, useCategories, changeCategoryVisibilty, bulkUploadCategories } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";
import Papa from "papaparse";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const categoryTitleRef = useRef();

  const categoryIdRef = useRef();
  const categoryTitleUpdateRef = useRef();

  const [bulkFileName, setBulkFileName] = useState(null);
  const [parsedCategoryCount, setParsedCategoryCount] = useState(0);
  const fileInputRef = useRef(null);

  const { APIURL, data: categories, error, isLoading } = useCategories();

  if (isLoading) {
    return <Page className="px-8 py-6">{t("categories.please_wait")}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page className="px-8 py-6">{t("categories.error_loading_data")}</Page>;
  }

  async function btnAdd() {
    const title = categoryTitleRef.current.value;

    if(!title) {
      toast.error(t("categories.please_provide_category_title"));
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await addCategory(title);

      if(res.status == 200) {
        categoryTitleRef.current.value = "";
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnShowUpdate = async (id, title) => {
    categoryIdRef.current.value = id;
    categoryTitleUpdateRef.current.value = title;
    document.getElementById('modal-update').showModal();
  };

  const btnUpdate = async () => {
    const id = categoryIdRef.current.value;
    const title = categoryTitleUpdateRef.current.value;

    if(!title) {
      toast.error(t("categories.please_provide_category_title"));
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await updateCategory(id, title);

      if(res.status == 200) {
        categoryIdRef.current.value = null;
        categoryTitleUpdateRef.current.value = null;

        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDelete = async (id) => {
    const isConfirm = window.confirm(t("categories.are_you_sure"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await deleteCategory(id);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnChangeCategoryVisibilty = async (id, isEnabled) => {
    try {
      toast.loading(t("categories.please_wait"));
      const res = await changeCategoryVisibilty(id, isEnabled);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDownloadTemplate = async () => {
    try {
      const { saveAs } = await import("file-saver");
      const { Parser } = await import("@json2csv/plainjs");

      const data = [
        { title: 'Appetizers' },
        { title: 'Main Course' },
        { title: 'Desserts' },
        { title: 'Beverages' },
        { title: 'Seafood' },
        { title: 'Specials' },
      ];

      const opt = {
        fields: ["title"],
      };

      const parser = new Parser(opt);
      const csvData = parser.parse(data);

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "categories-upload-template.csv");
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(t("categories.something_went_wrong"));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBulkFileName(null);
      setParsedCategoryCount(0);
      return;
    }

    setBulkFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s\-]+/g, '_'),
      complete: (results) => {
        const parsedData = results.data;
        if (!parsedData || parsedData.length === 0) {
          toast.error(t("categories.no_data_found"));
          setParsedCategoryCount(0);
          return;
        }

        const validCount = parsedData.filter(row => {
          const tName = (row.title || row.category || row.category_title || row.category_name || row.name || "").toString().trim();
          return tName.length > 0;
        }).length;

        setParsedCategoryCount(validCount);
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        toast.error(t("categories.parsing_error"));
        setParsedCategoryCount(0);
      }
    });
  };

  const handleBulkUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error(t("categories.no_file_selected"));
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));

      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);

      const res = await bulkUploadCategories(formData);

      toast.dismiss();
      if (res.status === 200) {
        toast.success(res.data.message);
        setBulkFileName(null);
        setParsedCategoryCount(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
        document.getElementById("modal-bulk-add-category").close();
        await mutate(APIURL);
      } else {
        toast.error(res.data?.message || t("categories.something_went_wrong"));
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-8 py-6">
      <div className="flex items-center gap-4">
        <h3 className="text-3xl font-light">{t("categories.title")}</h3>
        <button
          onClick={() => document.getElementById("modal-add").showModal()}
          className="text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-3 py-1.5 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover"
        >
          <IconPlus size={20} stroke={iconStroke} /> {t("categories.new")}
        </button>
        <button
          onClick={() => document.getElementById("modal-bulk-add-category").showModal()}
          className="text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-3 py-1.5 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover"
        >
          <IconTableImport size={20} stroke={iconStroke} /> {t("categories.bulk_upload")}
        </button>
      </div>

      <div className="mt-8 w-full">
        <table className='w-full border overflow-x-auto border-restro-border-green'>
          <thead>
            <tr>
              <th className='px-3 py-2 font-medium md:w-20 text-start text-gray-500 bg-restro-card-bg'>
                #
              </th>
              <th className='px-3 py-2 font-medium md:w-96 text-start text-gray-500 bg-restro-card-bg'>
                {t("categories.category_title")}
              </th>

              <th className='px-3 py-2 font-medium md:w-28 text-start text-gray-500 bg-restro-card-bg'>
                {t("categories.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const { id, title, is_enabled } = category;

              return (
                <tr key={index} className={`${!is_enabled ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2 text-start">{index+1}</td>
                  <td className="px-3 py-2 text-start">{title}</td>
                  <td className="px-3 py-2 text-start flex gap-2 items-center">
                  <button
                    onClick={() => {
                      btnChangeCategoryVisibilty(id, !is_enabled);
                    }}
                    className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 hover:bg-restro-button-hover text-restro-text'
                  >
                    {is_enabled ? <IconEye stroke={iconStroke} /> : <IconEyeOff stroke={iconStroke} />}
                  </button>
                    <button
                      onClick={() => {
                        btnShowUpdate(id, title);
                      }}
                     className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'>
                      <IconPencil stroke={iconStroke} />
                    </button>
                    <button
                      onClick={()=>{
                        btnDelete(id);
                      }}
                     className='w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95 hover:bg-restro-button-hover'
                    >
                      <IconTrash stroke={iconStroke} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("categories.add_new_category")}</h3>

          <div className="my-4">
            <label htmlFor="title" className='mb-1 block text-gray-500 text-sm'>{t("categories.category_title")}</label>
            <input ref={categoryTitleRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t("categories.enter_category_title")} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("categories.close")}</button>
              <button onClick={()=>{btnAdd();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("categories.save")}</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("categories.update_category")}</h3>

          <div className="my-4">
            <input type="hidden" ref={categoryIdRef} />
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t("categories.category_title")}</label>
            <input ref={categoryTitleUpdateRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t("categories.enter_category_title")} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className ='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("categories.close")}</button>
              <button onClick={()=>{btnUpdate();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("categories.save")}</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="modal-bulk-add-category" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl max-w-lg'>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("categories.modal_bulk_add_title")}</h3>
            <button onClick={btnDownloadTemplate} type="button" className="btn btn-sm btn-ghost flex items-center gap-1 text-xs">
              <IconDownload stroke={iconStroke} size={16} /> {t("categories.download_template")}
            </button>
          </div>

          <p className="text-xs text-gray-500 my-2">{t("categories.modal_bulk_add_description")}</p>

          <div className="my-4 border border-dashed dark:border-restro-gray rounded-xl text-gray-500 flex items-center justify-center flex-col gap-2 p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#101010] transition">
            <label htmlFor="category-file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <input
                id="category-file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <IconTableImport stroke={iconStroke} size={36} />
              <p className="text-sm font-medium mt-1">{t("categories.select_file")}</p>
              <p className="text-xs text-center mt-1">{t("categories.file_note")}</p>
            </label>
          </div>

          {bulkFileName && (
            <div className="my-3 text-center bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border dark:border-zinc-800">
              <div className="flex items-center justify-center gap-1 text-sm font-medium">
                <IconFileTypeCsv stroke={iconStroke} size={18} />
                {t("categories.file_ready", { fileName: bulkFileName })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("categories.count_info", { count: parsedCategoryCount })}
              </p>
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 px-4 py-2 text-sm rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t("categories.close")}
              </button>
            </form>
            <button
              type="button"
              onClick={handleBulkUpload}
              className='rounded-xl transition active:scale-95 px-4 py-2 text-sm text-white ml-2 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
            >
              {t("categories.upload_button")}
            </button>
          </div>
        </div>
      </dialog>

    </Page>
  );
}
