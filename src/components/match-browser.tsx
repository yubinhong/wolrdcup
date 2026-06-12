"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Lang,
  formatDateOnly,
  formatDateTime,
  getAllDateKeys,
  getMatchBadge,
  getMatchesForDate,
  getPreferredDateKey,
  getScoreline,
  timezones
} from "@/lib/site";

type Props = {
  lang: Lang;
  labels: {
    timezone: string;
    date: string;
    stage: string;
    venue: string;
    noMatches: string;
    localKickoff: string;
    finished: string;
    scheduled: string;
    score: string;
  };
};

export function MatchBrowser({ lang, labels }: Props) {
  const [timeZone, setTimeZone] = useState(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
  });
  const [date, setDate] = useState(() => getPreferredDateKey(timeZone));

  const dates = getAllDateKeys(timeZone);
  const fallbackDate = getPreferredDateKey(timeZone);
  const selectedDate = dates.includes(date) ? date : fallbackDate;
  const filtered = getMatchesForDate(selectedDate, timeZone);
  const availableTimezones = timezones.includes(timeZone)
    ? timezones
    : [timeZone, ...timezones];

  return (
    <div className="stack">
      <div className="controls">
        <label className="control">
          <span>{labels.timezone}</span>
          <select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>
            {availableTimezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>
        <label className="control">
          <span>{labels.date}</span>
          <select value={selectedDate} onChange={(event) => setDate(event.target.value)}>
            {dates.map((dateKey) => (
              <option key={dateKey} value={dateKey}>
                {formatDateOnly(dateKey, timeZone, lang)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mini-card muted">{labels.noMatches}</div>
      ) : (
        <div className="timeline">
          {filtered.map((match) => (
            <Link
              key={match.id}
              href={`/${lang}/matches/${match.id}`}
              className="timeline-item match-link"
            >
              <div className="match-card__top">
                <strong>
                  {match.home} vs {match.away}
                </strong>
                <span className="badge">{getMatchBadge(match)}</span>
              </div>
              <p className="muted">
                {labels.localKickoff}: {formatDateTime(match.kickoffUtc, timeZone, lang)}
              </p>
              <p className="small">
                {match.status === "finished" ? labels.finished : labels.scheduled}
                {getScoreline(match) ? ` · ${labels.score}: ${getScoreline(match)}` : ""}
              </p>
              <p className="small">
                {labels.stage}: {match.stage}
              </p>
              <p className="small">
                {labels.venue}: {match.venue}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
