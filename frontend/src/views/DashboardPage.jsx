import React from 'react'
import Page from "../components/Page";
import { IconArmchair2, IconCarrot, IconChevronRight, IconFriends } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { Link } from "react-router-dom";
import { useDashboard } from '../controllers/dashboard.controller';
import { CURRENCIES } from "../config/currencies.config";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useDashboard();
  const { theme } = useTheme();

  if(isLoading) {
    return <Page>
      {t('dashboard.loading_message')}
    </Page>
  }

  if(error) {
    console.error(error);
    return <Page>
      {t('dashboard.error')}
    </Page>;
  }

  const {
    reservations, topSellingItems, ordersCount, newCustomerCount, repeatedCustomerCount, currency:currencyCode
  } = data;

  const currency = CURRENCIES.find((c)=>c.cc==currencyCode);

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-restro-green">Restaurant overview</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h3>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* reservation */}
        <div className="group h-96 overflow-y-auto rounded-3xl border border-restro-border-green bg-restro-card-bg shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className= "sticky top-0 rounded-t-3xl border-b border-restro-border-green bg-restro-card-bg/95 px-6 py-5 backdrop-blur">
            <Link to="/dashboard/reservation" className='font-semibold'>{t('dashboard.reservations')}</Link>
          </div>

          {reservations?.length == 0 && <div className='w-full px-8 2xl:px-10 pt-2'>
            <img
              src="/assets/illustrations/reservation-not-found.webp"
              alt="no-reservation"
              className='w-7/12 mx-auto'
            />
            <p className='mt-2 text-center text-gray-500 font-semibold'>Oh snap! 🍽️</p>
            <p className='text-center text-gray-500'>{t('dashboard.no_reservations')}</p>
          </div>}

          {
            reservations?.length > 0 && <div className='px-6 flex flex-col divide-y dark:divide-restro-border-green'>

            {/* item */}
            {reservations.map((reservation,i)=>{

              const {
                id,
                customer_id,
                customer_name,
                date,
                table_id,
                table_title,
                status,
                notes,
                people_count,
                unique_code,
                created_at,
                updated_at,
              } = reservation;

              const formmatedDate = new Intl.DateTimeFormat("en", {dateStyle: "medium", timeStyle: "short"}).format(new Date(date))

              return <div className='py-1' key={i}>
                <p className="text-xs text-gray-500">{formmatedDate}</p>
                <p className='text-base mt-1'>{customer_name} <span className="text-xs text-gray-500">- ({customer_id})</span></p>
                <div className='flex items-center gap-2 mt-1'>
                  <p className="flex items-center gap-2 text-xs">
                    <IconFriends stroke={iconStroke} size={14} /> {people_count} People
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <IconArmchair2 stroke={iconStroke} size={14} /> {table_title}
                  </p>
                </div>
              </div>;
            })}
            {/* item */}

          </div>
          }

          <div className="h-6"></div>
        </div>
        {/* reservation */}

        {/* popular items */}
        <div className="group h-96 overflow-y-auto rounded-3xl border border-restro-border-green bg-restro-card-bg shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="sticky top-0 rounded-t-3xl border-b border-restro-border-green bg-restro-card-bg/95 px-6 py-5 backdrop-blur">
            <h3 className='font-semibold'>{t('dashboard.top_selling_items')}</h3>
          </div>

          {topSellingItems?.length == 0 && <div className='w-full px-8 2xl:px-10'>
            <img
              src="/assets/illustrations/top-selling-not-found.webp"
              alt="no-top-selling items"
              className='w-7/12 mx-auto'
            />
            <p className='mt-2 text-center text-gray-500 font-semibold'>Uh-oh! 🚨</p>
            <p className='text-center text-gray-500'>{t('dashboard.no_top_selling_items')}</p>
          </div>}

          {
            topSellingItems?.length > 0 && <div className='px-6 pt-1 flex flex-col'>
            {/* item */}
            {topSellingItems.map((item,i)=>{
              return <div className='mb-4 flex items-center gap-2 w-full' key={i}>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-restro-bg-gray text-restro-green'>
                  <IconCarrot stroke={iconStroke} />
                </div>

                <div className='flex-1'>
                  <p>{item?.title}</p>
                  <p className="text-xs text-gray-500">{currency?.symbol}{item?.price}</p>
                </div>

                <p className='font-bold'>{item?.orders_count}</p>
              </div>;
            })}
            {/* item */}
          </div>
          }
        </div>
        {/* popular items */}


        <div className="flex flex-col gap-6">
          {/* items sold */}
        <div className="group h-28 rounded-2xl border border-restro-border-green bg-restro-card-bg px-5 py-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.orders')}</h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{ordersCount||0}</p>
        </div>
        {/* items sold */}

        {/* new customers */}
        <div className="group h-28 rounded-2xl border border-restro-border-green bg-restro-card-bg px-5 py-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.new_customers')}</h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{newCustomerCount||0}</p>
        </div>
        {/* new customers */}

        {/* repeated customers */}
        <div className="group h-28 rounded-2xl border border-restro-border-green bg-restro-card-bg px-5 py-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.repeat_customers')}</h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{repeatedCustomerCount||0}</p>
        </div>
        {/* repeated customers */}
        </div>

        {/* banner: view more in reports */}
        <Link to="/dashboard/reports" className = "block rounded-3xl border border-restro-border-green bg-restro-card-bg bg-[url(/assets/circle_illustration.svg)] bg-no-repeat bg-right-bottom px-6 py-5 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-restro-button-hover hover:shadow-md active:scale-[0.99] animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <p className="font-semibold">{t('dashboard.view_more_reports')} <IconChevronRight stroke={iconStroke} className="inline-block"/></p>
        </Link>
        {/* banner: view more in reports */}
      </div>
    </Page>
  )
}
