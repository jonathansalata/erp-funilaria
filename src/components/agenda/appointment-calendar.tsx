"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENT_TYPE_META, type Appointment } from "@/lib/mock-data/appointments";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day";

type AppointmentCalendarProps = {
  appointments: Appointment[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
};

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function AppointmentCalendar({
  appointments,
  selectedDate,
  onSelectDate,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const selected = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const list = map.get(appointment.date) ?? [];
      list.push(appointment);
      map.set(appointment.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [appointments]);

  function goToToday() {
    onSelectDate(toIsoDate(new Date()));
  }

  function navigate(direction: 1 | -1) {
    if (view === "month") {
      onSelectDate(toIsoDate(direction === 1 ? addMonths(selected, 1) : subMonths(selected, 1)));
    } else if (view === "week") {
      onSelectDate(toIsoDate(direction === 1 ? addWeeks(selected, 1) : subWeeks(selected, 1)));
    } else {
      onSelectDate(toIsoDate(addDays(selected, direction)));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
            <ChevronRight />
          </Button>
          <span className="font-heading text-sm font-semibold capitalize">
            {view === "day"
              ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
              : format(selected, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        <Tabs value={view} onValueChange={(value) => value && setView(value as CalendarView)}>
          <TabsList>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="day">Dia</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "month" && (
        <MonthView
          selected={selected}
          appointmentsByDate={appointmentsByDate}
          onSelectDate={onSelectDate}
        />
      )}
      {view === "week" && (
        <WeekView
          selected={selected}
          appointmentsByDate={appointmentsByDate}
          onSelectDate={onSelectDate}
          onAppointmentClick={onAppointmentClick}
        />
      )}
      {view === "day" && (
        <DayView
          selected={selected}
          appointments={appointmentsByDate.get(selectedDate) ?? []}
          onAppointmentClick={onAppointmentClick}
        />
      )}
    </div>
  );
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function MonthView({
  selected,
  appointmentsByDate,
  onSelectDate,
}: {
  selected: Date;
  appointmentsByDate: Map<string, Appointment[]>;
  onSelectDate: (date: string) => void;
}) {
  const monthStart = startOfMonth(selected);
  const monthEnd = endOfMonth(selected);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    days.push(day);
  }

  const today = toIsoDate(new Date());

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-muted-foreground border-r px-2 py-2 text-center text-xs font-medium last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = toIsoDate(day);
          const dayAppointments = appointmentsByDate.get(iso) ?? [];
          const isCurrentMonth = isSameMonth(day, selected);
          const isSelected = isSameDay(day, selected);
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={cn(
                "hover:bg-muted/50 flex min-h-24 flex-col gap-1 border-r border-b p-1.5 text-left last:border-r-0",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isSelected && "bg-primary/5 ring-primary ring-1 ring-inset",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-1">
                {dayAppointments.slice(0, 2).map((appointment) => (
                  <span
                    key={appointment.id}
                    className="bg-muted truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
                  >
                    {appointment.time} {appointment.title}
                  </span>
                ))}
                {dayAppointments.length > 2 && (
                  <span className="text-muted-foreground text-[11px]">
                    +{dayAppointments.length - 2} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  selected,
  appointmentsByDate,
  onSelectDate,
  onAppointmentClick,
}: {
  selected: Date;
  appointmentsByDate: Map<string, Appointment[]>;
  onSelectDate: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const weekStart = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const today = toIsoDate(new Date());

  return (
    <div className="grid gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const iso = toIsoDate(day);
        const dayAppointments = appointmentsByDate.get(iso) ?? [];
        const isSelected = isSameDay(day, selected);
        const isToday = iso === today;

        return (
          <div
            key={iso}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-2",
              isSelected && "ring-primary ring-1 ring-inset",
            )}
          >
            <button
              type="button"
              onClick={() => onSelectDate(iso)}
              className="flex items-center justify-between text-left"
            >
              <span className="text-muted-foreground text-xs font-medium capitalize">
                {format(day, "EEE", { locale: ptBR })}
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </button>
            <div className="flex flex-col gap-1.5">
              {dayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-xs">Sem compromissos</p>
              ) : (
                dayAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => onAppointmentClick(appointment)}
                    className="hover:bg-muted/50 flex flex-col gap-1 rounded-lg border p-1.5 text-left text-xs"
                  >
                    <span className="font-medium">
                      {appointment.time} · {appointment.title}
                    </span>
                    <StatusBadge variant={APPOINTMENT_TYPE_META[appointment.type].variant}>
                      {APPOINTMENT_TYPE_META[appointment.type].label}
                    </StatusBadge>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  selected,
  appointments,
  onAppointmentClick,
}: {
  selected: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        Nenhum compromisso em {format(selected, "d 'de' MMMM", { locale: ptBR })}.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {appointments.map((appointment) => (
        <button
          key={appointment.id}
          type="button"
          onClick={() => onAppointmentClick(appointment)}
          className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-xl border p-3 text-left"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{appointment.title}</span>
            {appointment.notes && (
              <span className="text-muted-foreground text-xs">{appointment.notes}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-heading text-sm font-semibold">{appointment.time}</span>
            <StatusBadge variant={APPOINTMENT_TYPE_META[appointment.type].variant}>
              {APPOINTMENT_TYPE_META[appointment.type].label}
            </StatusBadge>
          </div>
        </button>
      ))}
    </div>
  );
}
