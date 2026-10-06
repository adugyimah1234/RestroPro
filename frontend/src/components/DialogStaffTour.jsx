import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
import { iconStroke } from '../config/config';
import { startStaffTour, TOUR_TYPES, hasSeenTour, markTourAsSeen } from '../helpers/tourGuide';
import { getUserDetailsInLocalStorage } from '../helpers/UserDetails';

export default function DialogStaffTour() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserDetailsInLocalStorage();
    const userId = user?.id || user?.email;
    if (userId && !hasSeenTour(userId)) {
      const timer = setTimeout(() => {
        document.getElementById('modal-staff-tour')?.showModal();
        markTourAsSeen(userId);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = (tourType) => {
    document.getElementById('modal-staff-tour')?.close();
    startStaffTour(tourType, navigate);
  };

  return (
    <dialog id="modal-staff-tour" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box border border-restro-border-green dark:rounded-2xl max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-restro-text">{t('tour.title', 'Staff Tour Guide')}</h3>
            <p className="text-xs text-gray-500">{t('tour.subtitle', 'Select a guided tour to explore features')}</p>
          </div>
          <button
            className="text-gray-500 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            onClick={() => document.getElementById('modal-staff-tour')?.close()}
          >
            <IconX size={18} stroke={iconStroke} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 my-3">
          {/* Settings Setup Tour */}
          <button
            onClick={() => handleStartTour(TOUR_TYPES.SETTINGS)}
            className="p-3.5 rounded-xl border border-restro-border-green bg-restro-gray hover:bg-restro-button-hover text-left transition active:scale-[0.98]"
          >
            <h4 className="font-semibold text-sm text-restro-text">{t('tour.settings_tour', 'Settings & Store Setup')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('tour.settings_tour_desc', 'Learn how to configure store details, tax, print, and menu items.')}
            </p>
          </button>

          {/* POS Tour */}
          <button
            onClick={() => handleStartTour(TOUR_TYPES.POS)}
            className="p-3.5 rounded-xl border border-restro-border-green bg-restro-gray hover:bg-restro-button-hover text-left transition active:scale-[0.98]"
          >
            <h4 className="font-semibold text-sm text-restro-text">{t('tour.pos_tour', 'Point of Sale (POS)')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('tour.pos_tour_desc', 'Explore taking orders, managing cart items, and checking out.')}
            </p>
          </button>

          {/* Kitchen Display Tour */}
          <button
            onClick={() => handleStartTour(TOUR_TYPES.KITCHEN)}
            className="p-3.5 rounded-xl border border-restro-border-green bg-restro-gray hover:bg-restro-button-hover text-left transition active:scale-[0.98]"
          >
            <h4 className="font-semibold text-sm text-restro-text">{t('tour.kitchen_tour', 'Kitchen Display')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('tour.kitchen_tour_desc', 'Track incoming live orders and update order preparation statuses.')}
            </p>
          </button>

          {/* System Overview Tour */}
          <button
            onClick={() => handleStartTour(TOUR_TYPES.NAVIGATION)}
            className="p-3.5 rounded-xl border border-restro-border-green bg-restro-gray hover:bg-restro-button-hover text-left transition active:scale-[0.98]"
          >
            <h4 className="font-semibold text-sm text-restro-text">{t('tour.nav_tour', 'System Navigation')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('tour.nav_tour_desc', 'Overview of main sidebar navigation and sections.')}
            </p>
          </button>
        </div>

        <div className="modal-action">
          <button
            onClick={() => document.getElementById('modal-staff-tour')?.close()}
            className="btn btn-sm rounded-xl w-full bg-restro-gray hover:bg-restro-button-hover text-restro-text"
          >
            {t('tour.close', 'Close')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
