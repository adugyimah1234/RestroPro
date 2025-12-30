import React, { useRef, useState } from "react";
import Page from "../components/Page";
import { iconStroke } from "../config/config";
import { IconChevronRight, IconDownload, IconFileTypeCsv, IconTableImport } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Papa from "papaparse"; // Import PapaParse

// Assuming you will create this controller
import { uploadBulkMenuItems } from "../controllers/menu_item.controller"; 

export default function MenuItemsImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fileName, setFileName] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const fileInputRef = useRef(null);

  const menuItemTableColumns = [
    "title",
    "description",
    "price",
    "net_price",
    "tax_id",
    "category_id"
  ];

  const btnDownloadTemplate = async () => {
    try {
      const { saveAs } = await import("file-saver");
      const { Parser } = await import("@json2csv/plainjs");
  
      // Define example data for the template
      const data = [
        { title: 'Burger Classic', description: 'Beef patty, lettuce, tomato, cheese', price: 12.50, net_price: 10.00, tax_id: 1, category_id: 1 },
        { title: 'Pizza Margherita', description: 'Tomato, mozzarella, basil', price: 15.00, net_price: 12.50, tax_id: 1, category_id: 2 },
      ];
  
      // Set options for the Parser
      const opt = {
        fields: menuItemTableColumns, // Set the fields explicitly
      };
  
      // Initialize the parser and parse the data
      const parser = new Parser(opt);
      const csvData = parser.parse(data);
  
      // Create a blob from the CSV data and download it
      const blob = new Blob([csvData], { type: "application/csv" });
      saveAs(blob, "menu-items-upload-template.csv");
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error(t("menu_items_import.error_downloading_file"));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName(null);
      setMenuItems([]);
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true, // Assuming the first row is headers
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data;
        const errors = results.errors;

        if (errors.length > 0) {
          console.error("PapaParse errors:", errors);
          toast.error(t("menu_items_import.parsing_error"));
          setMenuItems([]);
          return;
        }

        // Validate headers
        const uploadedHeaders = Object.keys(parsedData[0] || {});
        const missingHeaders = menuItemTableColumns.filter(col => !uploadedHeaders.includes(col));
        
        if (missingHeaders.length > 0) {
            toast.error(t("menu_items_import.column_mismatch", { missing: missingHeaders.join(', ') }));
            setMenuItems([]);
            return;
        }

        if (parsedData.length === 0) {
          toast.error(t("menu_items_import.no_data"));
          setMenuItems([]);
          return;
        }

        setMenuItems(parsedData);
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        toast.error(t("menu_items_import.parsing_error"));
        setMenuItems([]);
      }
    });
  };

  const btnProceed = async () => {
    if (menuItems.length === 0) {
      toast.error(t("menu_items_import.no_data_found"));
      return;
    }

    try {
      toast.loading(t("menu_items_import.loading_message"));

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);

      const res = await uploadBulkMenuItems(formData); // Pass FormData to the controller
      
      toast.dismiss();
      if (res.status === 200) {
        toast.success(res.data.message);
        // Optionally display errors for individual rows if the backend returns them
        if (res.data.errors && res.data.errors.length > 0) {
            res.data.errors.forEach(err => {
                toast.error(`${t("menu_items_import.row_error", { line: err.line })}: ${err.message}`);
            });
        }
        navigate(-1); // Go back to the previous page
      } else {
        const message = res.data?.message || t("menu_items_import.error_processing_request");
        toast.error(message);
        if (res.data.errors && res.data.errors.length > 0) {
            res.data.errors.forEach(err => {
                toast.error(`${t("menu_items_import.row_error", { line: err.line })}: ${err.message}`);
            });
        }
      }

    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("menu_items_import.error_processing_request");
      toast.dismiss();
      toast.error(message);
      if (error?.response?.data?.errors && error.response.data.errors.length > 0) {
        error.response.data.errors.forEach(err => {
            toast.error(`${t("menu_items_import.row_error", { line: err.line })}: ${err.message}`);
        });
    }
    }
  };

  return (
    <Page>
      <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/settings/menu-items" className="hover:underline">{t("menu_items_import.breadcrumb_menu_items")}</Link>
          <IconChevronRight stroke={iconStroke} size={18} />
          <p>{t("menu_items_import.breadcrumb_import")}</p>
        </div>

        <button onClick={btnDownloadTemplate} className="btn btn-sm dark:rounded-lg">
          <IconDownload stroke={iconStroke} size={18} /> {t("menu_items_import.download_template")}
        </button>
      </div>

      <div className="mx-auto mt-10 w-full md:w-3/4 lg:w-1/2 border border-dashed dark:border-restro-gray rounded-2xl text-gray-500 flex items-center justify-center flex-col gap-2 px-4 py-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#101010] transition">
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          <IconTableImport stroke={iconStroke} size={48} />
          <p>{t("menu_items_import.select_file")}</p>
          <p className="text-xs text-center">{t("menu_items_import.file_note")}</p>
        </label>
      </div>

      {menuItems.length > 0 && (
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center justify-center text-center gap-2">
            <IconFileTypeCsv stroke={iconStroke} size={18} /> {t("menu_items_import.file_ready", { fileName })}
          </div>
          <p className="text-sm text-center" dangerouslySetInnerHTML={{ __html: t("menu_items_import.items_count", { count: menuItems.length }) }}></p>

          <button onClick={btnProceed} className="btn btn-sm bg-restro-green hover:bg-restro-green-dark text-white w-full md:w-3/4 lg:w-1/2 mt-8">{t("menu_items_import.proceed_button")}</button>
        </div>
      )}
    </Page>
  );
}
