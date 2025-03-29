import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useAPI from "../../hooks/useAPI";
import Calendar from "../PanelComponents/Calendar";
import CalendarGrid from "../PanelComponents/CalendarGrid";
import Modal from "../Modal";
import ScheduleSponsorForm from "./ScheduleSponsorForm";
import SponsorScheduleCards from "./SponsorScheduleCards";
import { Sponsor } from "../../types";

export interface SponsorScheduleEntry {
  date: string;
  sponsorId: string;
  sponsorName: string;
  logo?: string;
  region: string;
  placement: "popup" | "footer";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
}

const ScheduleSponsor: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleMap, setScheduleMap] = useState<Record<string, SponsorScheduleEntry[]>>({});
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [viewMode, setViewMode] = useState<"calendar" | "card">("calendar");

  const scheduleApi = useAPI<{ sponsors: Sponsor[]; schedule: any[] }>();
  const submitApi = useAPI();

  const sponsors = scheduleApi.data?.sponsors || [];
  const rawSchedules = scheduleApi.data?.schedule || [];

  useEffect(() => {
    if (!scheduleApi.called && !scheduleApi.loading) {
      scheduleApi.callApi(`getSponsorSchedule?month=${currentMonth}`, "GET");
    }
  }, [currentMonth, scheduleApi]);

  const expandedSchedules: SponsorScheduleEntry[] = useMemo(() => {
    return rawSchedules.flatMap((entry) => {
      const start = new Date(entry.start_date?.value || entry.start_date);
      const end = new Date(entry.end_date?.value || entry.end_date);
      const result: SponsorScheduleEntry[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = new Date(d).toISOString().split("T")[0];
        result.push({
          date,
          sponsorId: entry.sponsor_id,
          sponsorName: entry.sponsor_name,
          logo: entry.logo || "",
          region: entry.region,
          placement: entry.placement || "popup",
          startDate: entry.start_date?.value || entry.start_date,
          endDate: entry.end_date?.value || entry.end_date,
          startTime: entry.start_time?.value || entry.start_time,
          endTime: entry.end_time?.value || entry.end_time,
          location: entry.location,
        });
      }

      return result;
    });
  }, [rawSchedules]);

  const uniqueSchedules = useMemo(() => {
    const seen = new Set<string>();
    return rawSchedules.map((entry) => {
      const key = `${entry.sponsor_id}-${entry.start_date?.value || entry.start_date}-${entry.end_date?.value || entry.end_date}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return {
        date: entry.start_date?.value || entry.start_date,
        sponsorId: entry.sponsor_id,
        sponsorName: entry.sponsor_name,
        logo: entry.logo || "",
        region: entry.region,
        placement: entry.placement || "popup",
        startDate: entry.start_date?.value || entry.start_date,
        endDate: entry.end_date?.value || entry.end_date,
        startTime: entry.start_time?.value || entry.start_time,
        endTime: entry.end_time?.value || entry.end_time,
        location: entry.location,
      };
    }).filter(Boolean) as SponsorScheduleEntry[];
  }, [rawSchedules]);

  const filteredSchedules = useMemo(() => {
    const base = viewMode === "calendar" ? expandedSchedules : uniqueSchedules;
    return base.filter((entry) => {
      const matchesSponsor = !selectedSponsorId || entry.sponsorId === selectedSponsorId;
      const matchesRegion = !selectedRegion || entry.region === selectedRegion;
      const matchesDate = (!filterStartDate || entry.date >= filterStartDate) &&
                          (!filterEndDate || entry.date <= filterEndDate);
      return matchesSponsor && matchesRegion && matchesDate;
    });
  }, [expandedSchedules, uniqueSchedules, selectedSponsorId, selectedRegion, filterStartDate, filterEndDate, viewMode]);

  useEffect(() => {
    const newMap = filteredSchedules.reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, SponsorScheduleEntry[]>);

    const current = JSON.stringify(scheduleMap);
    const next = JSON.stringify(newMap);

    if (current !== next) {
      setScheduleMap(newMap);
    }
  }, [filteredSchedules]);

  const selectedSponsor = useMemo(
    () => sponsors.find((s) => s.id === selectedSponsorId) || null,
    [sponsors, selectedSponsorId]
  );

  const handleDateClick = (date: Date) => {
    if (!selectedSponsorId) {
      toast.error("Please select a sponsor first.");
      return;
    }
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleEntryClick = (entry: SponsorScheduleEntry) => {
    if (entry.sponsorId !== selectedSponsorId) {
      toast.warn("This date is already scheduled by another sponsor.");
      return;
    }
    setSelectedDate(new Date(entry.date));
    setModalOpen(true);
  };

  const handleSchedule = async (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location?: string;
    placement: "popup" | "footer";
  }) => {
    if (!selectedSponsor) return;

    const payload = {
      sponsorId: selectedSponsor.id!,
      sponsorName: selectedSponsor.name,
      logo: selectedSponsor.logo,
      region: selectedSponsor.region,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      placement: data.placement,
    };

    const res = await submitApi.callApi("addSponsorSchedule", "POST", payload);

    if (res.success) {
      toast.success(`✅ ${selectedSponsor.name} scheduled!`);
      scheduleApi.callApi(`getSponsorSchedule?month=${currentMonth}`, "GET");
    } else {
      toast.error(`❌ ${res.error || "Failed to schedule sponsor"}`);
    }

    setModalOpen(false);
  };

  const regions = Array.from(new Set(expandedSchedules.map((s) => s.region)));

  return (
    <div className="schedule-container">
      <h3>📅 Schedule Sponsorships</h3>

      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="view-mode-toggle">View Mode:</label>
        <select
          id="view-mode-toggle"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "calendar" | "card")}
        >
          <option value="calendar">📅 Calendar View</option>
          <option value="card">🧾 Card View</option>
        </select>
      </div>

      <div className="filters">
        <div>
          <label htmlFor="sponsor-select">Select Sponsor:</label>
          <select id="sponsor-select" value={selectedSponsorId} onChange={(e) => setSelectedSponsorId(e.target.value)}>
            <option value="">All Sponsors</option>
            {sponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.name} ({sponsor.region})
              </option>
            ))}
          </select>
        </div>

        {viewMode === "card" && (
          <>
            <div>
              <label htmlFor="region-select">Region:</label>
              <select id="region-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-start-date">Start Date:</label>
              <input id="filter-start-date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>

            <div>
              <label htmlFor="filter-end-date">End Date:</label>
              <input id="filter-end-date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
          </>
        )}
      </div>

      {viewMode === "calendar" ? (
        <Calendar
          scheduleMap={scheduleMap}
          selectedEntityId={selectedSponsorId}
          onDateClick={handleDateClick}
          onEntryClick={handleEntryClick}
          CalendarGridComponent={(props) => (
            <CalendarGrid
              {...props}
              getEntityId={(entry) => entry.sponsorId}
              renderEntry={(entry) => (
                <>
                  📢 {entry.sponsorName}
                  <br />
                  ({entry.startTime} - {entry.endTime})
                </>
              )}
            />
          )}
        />
      ) : (
        <SponsorScheduleCards entries={filteredSchedules} />
      )}

      {modalOpen && selectedSponsor && selectedDate && (
        <Modal onClose={() => setModalOpen(false)}>
          <ScheduleSponsorForm
            selectedDate={selectedDate}
            sponsor={selectedSponsor}
            onSubmit={handleSchedule}
          />
        </Modal>
      )}
    </div>
  );
};

export default ScheduleSponsor;
