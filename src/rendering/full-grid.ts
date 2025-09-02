/* eslint-disable import/order */
/**
 * Full-grid rendering module
 *
 * Provides an Outlook-like calendar layout with time axis and day columns.
 */

import { TemplateResult, html } from 'lit';
import * as Types from '../config/types';
import * as EventUtils from '../utils/events';
import * as Localize from '../translations/localize';
import { calculateGridPositions } from '../utils/events';

/**
 * Render the full-grid calendar structure
 */
export function renderFullGrid(
  days: Types.EventsByDay[],
  config: Types.Config,
  language: string,
  _weather: Types.WeatherForecasts,
  activeCalendars: string[],
  toggleCalendar: (entity: string) => void,
  hass: Types.Hass | null,
): TemplateResult {
  const dayCount = days.length;
  const today = new Date();

  return html`<div class="ccp-full-grid" style="--full-grid-days:${dayCount}">
    ${renderCalendarHeader(config, activeCalendars, toggleCalendar)}
    <div class="ccp-weekday-header">
      ${days.map((d) => {
        const dateObj = new Date(d.timestamp);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const isToday = dateObj.toDateString() === today.toDateString();
        const weekdayColor =
          (isToday && (config.today_weekday_color || config.weekend_weekday_color)) ||
          (isWeekend && config.weekend_weekday_color) ||
          config.weekday_color;
        const dayColor =
          (isToday && (config.today_day_color || config.weekend_day_color)) ||
          (isWeekend && config.weekend_day_color) ||
          config.day_color;
        const monthColor =
          (isToday && (config.today_month_color || config.weekend_month_color)) ||
          (isWeekend && config.weekend_month_color) ||
          config.month_color;
        return html`<div class="ccp-weekday-header-item">
          <span class="weekday" style="color:${weekdayColor}">${d.weekday}</span>
          <span class="day" style="color:${dayColor}">${d.day}</span>
          ${config.show_month
            ? html`<span class="month" style="color:${monthColor}">${d.month}</span>`
            : ''}
        </div>`;
      })}
    </div>
    <div class="ccp-grid-body">
      ${renderTimeAxis(config)}
      <div class="ccp-day-columns">
        ${days.map((d) => renderDayColumn(d, config, language, hass, today))}
      </div>
    </div>
  </div>`;
}

/**
 * Header with per-calendar filter buttons
 */
function renderCalendarHeader(
  config: Types.Config,
  activeCalendars: string[],
  toggleCalendar: (entity: string) => void,
): TemplateResult {
  return html`<div class="ccp-calendar-header">
    ${config.entities.map((e) => {
      const entity = typeof e === 'string' ? { entity: e, color: 'var(--primary-text-color)' } : e;
      const isActive = activeCalendars.includes(entity.entity);
      return html`<button
        class="ccp-filter-btn"
        style="color:${entity.color};opacity:${isActive ? '1' : '0.4'}"
        @click=${() => toggleCalendar(entity.entity)}
      >
        ${entity.label || entity.entity}
      </button>`;
    })}
  </div>`;
}

/**
 * Render left-hand time axis (00:00 - 23:00)
 */
function renderTimeAxis(_config: Types.Config): TemplateResult {
  return html`<div class="ccp-time-axis">
    ${Array.from({ length: 24 }, (_, i) => html`<div>${i.toString().padStart(2, '0')}:00</div>`)}
  </div>`;
}

/**
 * Render a single day column with all-day and timed events
 */
function renderDayColumn(
  day: Types.EventsByDay,
  config: Types.Config,
  language: string,
  hass: Types.Hass | null,
  today: Date,
): TemplateResult {
  const allDayEvents = day.events.filter((e) => !e.start.dateTime);
  const timedEvents = day.events.filter((e) => e.start.dateTime);
  const timedPositions = calculateGridPositions(timedEvents);

  const dateObj = new Date(day.timestamp);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const isToday = dateObj.toDateString() === today.toDateString();
  const backgroundColor =
    (isToday && config.today_background_color) ||
    (isWeekend && config.weekend_background_color) ||
    undefined;

  const hourLines: TemplateResult[] = [];
  if (config.show_hour_lines) {
    for (let i = 0; i < 24; i++) {
      hourLines.push(
        html`<div
          class="ccp-hour-line"
          style="top:${i *
          60}px;border-top:${config.hour_line_thickness} solid ${config.hour_line_color}"
        ></div>`,
      );
    }
  }
  if (config.show_half_hour_lines) {
    for (let i = 0; i < 24; i++) {
      hourLines.push(
        html`<div
          class="ccp-half-hour-line"
          style="top:${i * 60 +
          30}px;border-top:${config.half_hour_line_thickness} solid ${config.half_hour_line_color}"
        ></div>`,
      );
    }
  }

  return html`<div
    class="ccp-day-column"
    style="${backgroundColor ? `background:${backgroundColor};` : ''}"
  >
    <div class="ccp-all-day-area">
      ${allDayEvents.map((ev) => renderEventBlock(ev, config, language, hass))}
    </div>
    <div class="ccp-events">
      ${hourLines}
      ${timedPositions.map((p) =>
        renderEventBlock(
          p.event,
          config,
          language,
          hass,
          `top:${p.startMinute}px;height:${p.endMinute - p.startMinute}px;left:${
            (p.lane / p.laneCount) * 100
          }%;width:${(1 / p.laneCount) * 100}%`,
        ),
      )}
    </div>
  </div>`;
}

function renderEventBlock(
  event: Types.CalendarEventData,
  config: Types.Config,
  language: string,
  hass: Types.Hass | null,
  extraStyle = '',
): TemplateResult {
  const translations = Localize.getTranslations(language);
  const entityColor =
    EventUtils.getEntityColor(event._entityId, config, event) || config.event_color;
  const backgroundColor = EventUtils.getEntityAccentColorWithOpacity(
    event._entityId,
    config,
    config.event_background_opacity,
    event,
  );
  const showTime =
    EventUtils.getEntitySetting(event._entityId, 'show_time', config, event) ?? config.show_time;
  const showLocation =
    EventUtils.getEntitySetting(event._entityId, 'show_location', config, event) ??
    config.show_location;
  const isAllDayEvent = !event.start.dateTime;
  const isMultiDayAllDayEvent =
    isAllDayEvent &&
    event.time &&
    (event.time.includes(translations.multiDay) ||
      event.time.includes(translations.endsTomorrow) ||
      event.time.includes(translations.endsToday));
  const shouldShowTime =
    showTime &&
    !(isAllDayEvent && !isMultiDayAllDayEvent && !config.show_single_allday_time) &&
    !event._isEmptyDay;
  const timePart = shouldShowTime ? html`<div class="ccp-event-time">${event.time}</div>` : '';
  const locationPart =
    event.location && showLocation && !event._isEmptyDay
      ? html`<div class="ccp-event-location">${event.location}</div>`
      : '';

  return html`<div
    class="ccp-event-block"
    style="${extraStyle};color:${entityColor};background-color:${backgroundColor}"
  >
    ${timePart}
    <div class="ccp-event-summary">${event.summary}</div>
    ${locationPart}
  </div>`;
}
