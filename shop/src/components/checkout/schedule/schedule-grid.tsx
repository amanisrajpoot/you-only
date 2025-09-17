import { RadioGroup } from "@headlessui/react";
import { useAtom } from "jotai";
import ScheduleCard from "./schedule-card";
import { deliveryTimeAtom } from "@store/checkout";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useSettings } from "@contexts/settings.context";

interface ScheduleProps {
  label: string;
  className?: string;
  count?: number;
}

export const ScheduleGrid: React.FC<ScheduleProps> = ({
  label,
  className,
  count,
}) => {
  const { t } = useTranslation("common");
  const { deliveryTime: schedules } = useSettings();

  const [selectedSchedule, setSchedule] = useAtom(deliveryTimeAtom);
  
  // Default delivery times if not provided by settings
  const defaultSchedules = [
    {
      id: 1,
      title: 'Same Day Delivery',
      slug: 'same-day-delivery',
      description: 'Get your order delivered on the same day',
      minimum_duration: 1,
      maximum_duration: 1,
      duration_unit: 'day',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Next Day Delivery',
      slug: 'next-day-delivery',
      description: 'Get your order delivered the next day',
      minimum_duration: 1,
      maximum_duration: 2,
      duration_unit: 'day',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Standard Delivery',
      slug: 'standard-delivery',
      description: 'Standard delivery within 3-5 business days',
      minimum_duration: 3,
      maximum_duration: 5,
      duration_unit: 'day',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const availableSchedules = schedules && schedules.length > 0 ? schedules : defaultSchedules;

  useEffect(() => {
    if (availableSchedules && availableSchedules.length > 0) {
      setSchedule(availableSchedules[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <div className="flex items-center gap-3 md:gap-4 text-lg lg:text-xl text-heading capitalize font-medium">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-heading text-base text-white lg:text-xl">
              {count}
            </span>
          )}
          {label}
        </div>
      </div>

      {availableSchedules && availableSchedules?.length ? (
        <RadioGroup value={selectedSchedule} onChange={setSchedule}>
          <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {availableSchedules?.map((schedule: any, idx: number) => (
              <RadioGroup.Option
                value={schedule}
                key={idx}
                className="focus-visible:outline-none"
              >
                {({ checked }) => (
                  <ScheduleCard checked={checked} schedule={schedule} />
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <span className="relative px-5 py-6 text-base text-center bg-gray-100 rounded border border-border-200">
            {t("text-no-delivery-time-found")}
          </span>
        </div>
      )}
    </div>
  );
};
export default ScheduleGrid;
