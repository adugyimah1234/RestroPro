import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Staff Tour Guide helper using driver.js
 */

export const TOUR_TYPES = {
  SETTINGS: "settings",
  POS: "pos",
  KITCHEN: "kitchen",
  NAVIGATION: "navigation",
};

export function hasSeenTour(userId) {
  if (!userId) return false;
  return localStorage.getItem(`restropro_tour_seen_${userId}`) === "true";
}

export function markTourAsSeen(userId) {
  if (!userId) return;
  localStorage.setItem(`restropro_tour_seen_${userId}`, "true");
}

export function startStaffTour(tourType = TOUR_TYPES.SETTINGS, navigate = null) {
  if (tourType === TOUR_TYPES.SETTINGS) {
    if (navigate && !window.location.pathname.startsWith("/dashboard/settings")) {
      navigate("/dashboard/settings");
      setTimeout(() => runSettingsTour(), 500);
      return;
    }
    runSettingsTour();
  } else if (tourType === TOUR_TYPES.POS) {
    if (navigate && !window.location.pathname.startsWith("/dashboard/pos")) {
      navigate("/dashboard/pos");
      setTimeout(() => runPOSTour(), 500);
      return;
    }
    runPOSTour();
  } else if (tourType === TOUR_TYPES.KITCHEN) {
    if (navigate && !window.location.pathname.startsWith("/dashboard/kitchen")) {
      navigate("/dashboard/kitchen");
      setTimeout(() => runKitchenTour(), 500);
      return;
    }
    runKitchenTour();
  } else if (tourType === TOUR_TYPES.NAVIGATION) {
    runNavigationTour();
  }
}

function createDriverObj(steps) {
  const validSteps = steps.filter((step) => {
    if (!step.element) return true;
    const el = typeof step.element === "string" ? document.querySelector(step.element) : step.element;
    return !!el;
  });

  return driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: "Done",
    nextBtnText: "Next",
    prevBtnText: "Back",
    steps: validSteps,
  });
}

function runSettingsTour() {
  const steps = [
    {
      element: "#tour-settings-nav",
      popover: {
        title: "Settings Navigation",
        description: "Welcome to Settings Setup! Use this sidebar to configure Store Details, Print Settings, Tables, Menu Items, Taxes, and Payment Types.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-store-details",
      popover: {
        title: "Store Details",
        description: "Configure your restaurant name, contact phone, business email, physical address, store logo, and default currency.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-qr-settings",
      popover: {
        title: "QR Menu & Web Orders",
        description: "Enable digital QR menus and web ordering for your customers. Download QR codes to place on dining tables!",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-settings-menu-link",
      popover: {
        title: "Menu Items Setup",
        description: "Click here to add food categories, menu items, set prices, add variants (e.g., Small/Large), and extra addons.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-settings-tables-link",
      popover: {
        title: "Store Tables",
        description: "Create dining tables, specify floors/areas (Patio, Main Hall), seating capacities, and generate table QR codes.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-settings-tax-link",
      popover: {
        title: "Tax & Service Charges",
        description: "Configure inclusive or exclusive sales tax rates and automatic service charges added to bills.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-settings-print-link",
      popover: {
        title: "Receipt & Token Printing",
        description: "Customize receipt header/footer messages, page sizes (80mm / 58mm), and enable kitchen order tokens.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-settings-payment-link",
      popover: {
        title: "Payment Types",
        description: "Set up accepted payment methods for staff POS (Cash, Credit Card, Mobile Money, Bank Transfer).",
        side: "right",
        align: "start",
      },
    },
  ];

  const driverObj = createDriverObj(steps);
  driverObj.drive();
}

function runPOSTour() {
  const steps = [
    {
      element: "#tour-pos-header",
      popover: {
        title: "Point of Sale (POS)",
        description: "This is the primary workspace for staff to take customer orders, manage draft carts, and process payments.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pos-categories",
      popover: {
        title: "Categories & Search",
        description: "Filter menu items by category or quickly search for specific food items by name.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pos-view-toggle",
      popover: {
        title: "Layout Toggle",
        description: "Switch between Detailed view (with descriptions) and Compact view for fast touch grid tapping.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#tour-pos-items-grid",
      popover: {
        title: "Menu Items & Prices",
        description: "Tap any item card to add it to the cart. Item prices and low-stock warnings are clearly visible.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-pos-customer-select",
      popover: {
        title: "Customer Lookup",
        description: "Attach a registered customer by phone number or keep as Walk-in Customer.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pos-dining-select",
      popover: {
        title: "Dining Option & Table",
        description: "Select Dine-In, Delivery, or Takeaway, and choose the assigned dining table.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pos-cart",
      popover: {
        title: "Order Cart",
        description: "Review cart items, adjust quantities, or add special chef preparation notes.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#tour-pos-actions",
      popover: {
        title: "Order Actions",
        description: "Save cart as Draft, Send Order to Kitchen for cooking, or Create Receipt & Pay immediately.",
        side: "top",
        align: "center",
      },
    },
  ];

  const driverObj = createDriverObj(steps);
  driverObj.drive();
}

function runKitchenTour() {
  const steps = [
    {
      element: "#tour-kitchen-header",
      popover: {
        title: "Kitchen Display System",
        description: "Kitchen staff track live incoming orders, table numbers, variants, and preparation notes here.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-kitchen-orders",
      popover: {
        title: "Live Order Cards",
        description: "Update order status from 'Preparing' to 'Complete' as food is cooked and ready to serve.",
        side: "bottom",
        align: "start",
      },
    },
  ];

  const driverObj = createDriverObj(steps);
  driverObj.drive();
}

function runNavigationTour() {
  const steps = [
    {
      element: "#tour-sidebar",
      popover: {
        title: "Main Navigation Sidebar",
        description: "Easily navigate between POS, Orders, Kitchen, Reservations, Customers, Invoices, Inventory, Reports, and Settings.",
        side: "right",
        align: "start",
      },
    },
  ];

  const driverObj = createDriverObj(steps);
  driverObj.drive();
}
