/* eslint-disable import/order */
/**
 * Full-grid rendering module
 *
 * Provides an Outlook-like calendar layout with time axis and day columns.
 */

import { TemplateResult, html } from 'lit';
import * as Types from '../config/types';
import { calculateGridPositions, getEntitySetting } from '../utils/events';
import * as FormatUtils from '../utils/format';
import * as Weather from '../utils/weather';
import { openEventDetail } from './event-detail';
import * as Localize from '../translations/localize';

const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__';

/**
 * Render the full-grid calendar structure
 */
export function renderFullGrid(
  days: Types.EventsByDay[],
  config: Types.Config,
  language: string,
  weather: Types.WeatherForecasts,
  activeCalendars: string[],
  toggleCalendar: (entity: string) => void,
  navigateDays: (offset: number) => void,
  resetToToday: () => void,
  hass: Types.Hass | null,
): TemplateResult {
  const dayCount = days.length;

  return html`<div class="ccp-full-grid" style="--full-grid-days:${dayCount}">
    ${renderCalendarHeader(config, activeCalendars, toggleCalendar)}
    <div class="ccp-nav-header">
      <button class="ccp-nav-btn" @click=${() => navigateDays(-config.days_to_show)}>
        &lt;&lt;
      </button>
      <button class="ccp-nav-btn" @click=${() => resetToToday()}>
        ${Localize.translate(language, 'today', 'Today')}
      </button>
      <button class="ccp-nav-btn" @click=${() => navigateDays(config.days_to_show)}>
        &gt;&gt;
      </button>
    </div>
    <div class="ccp-weekday-header">
      <div class="ccp-time-axis-spacer"></div>
      ${days.map((d) => {
        const date = new Date(d.timestamp);
        const showDateWeather =
          config.weather?.entity &&
          (config.weather.position === 'date' || config.weather.position === 'both');
        const dailyForecast =
          showDateWeather && weather?.daily
            ? Weather.findDailyForecast(date, weather.daily)
            : undefined;
        return html`<div class="ccp-weekday-cell">
          <div class="ccp-weekday-label">
            ${d.weekday} ${d.day}${config.show_month ? ` ${d.month}` : ''}
          </div>
          ${dailyForecast
            ? html`<div
                class="ccp-weekday-weather"
                style="font-size:${config.weather?.date?.font_size || '12px'};color:${config.weather
                  ?.date?.color || 'var(--primary-text-color)'};"
              >
                ${config.weather?.date?.show_conditions !== false
                  ? html`<ha-icon
                      style="width:${config.weather?.date?.icon_size || '14px'};height:${config
                        .weather?.date?.icon_size || '14px'};"
                      .icon=${dailyForecast.icon}
                    ></ha-icon>`
                  : ''}
                <div class="temps">
                  ${config.weather?.date?.show_low_temp !== false &&
                  dailyForecast.templow !== undefined
                    ? html`<span class="weather-temp-low">${dailyForecast.templow}°</span>`
                    : ''}
                  ${config.weather?.date?.show_low_temp !== false &&
                  config.weather?.date?.show_high_temp !== false &&
                  dailyForecast.templow !== undefined
                    ? html`<span>/</span>`
                    : ''}
                  ${config.weather?.date?.show_high_temp !== false
                    ? html`<span class="weather-temp-high">${dailyForecast.temperature}°</span>`
                    : ''}
                </div>
              </div>`
            : ''}
        </div>`;
      })}
    </div>
    <div class="ccp-all-day-row">
      <div class="ccp-time-axis-spacer"></div>
      ${days.map((d) => renderAllDayCell(d, config, language, weather, hass))}
    </div>
    <div class="ccp-main-grid">
      ${renderTimeAxis()}
      <div class="ccp-day-columns">
        ${days.map((d) => renderDayBackground(d, config))}
        ${days.map((d, idx) => renderTimedEvents(d, idx, config, language, weather, hass))}
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
      const bg = isActive ? entity.color : `color-mix(in srgb, ${entity.color} 20%, transparent)`;
      const textColor = isActive ? 'var(--primary-text-color)' : entity.color;
      return html`<button
        class="ccp-filter-btn ${isActive ? 'is-active' : ''}"
        style="background-color:${bg};color:${textColor}"
        @click=${() => toggleCalendar(entity.entity)}
      >
        ${entity.label || entity.entity}
      </button>`;
    })}
    <span class="ccp-build-tag">Build: ${BUILD_TIMESTAMP}</span>
  </div>`;
}

/**
 * Render left-hand time axis (00:00 - 23:00)
 */
function renderTimeAxis(): TemplateResult {
  return html`<div class="ccp-time-axis">
    ${Array.from({ length: 24 }, (_, i) => html`<div>${i.toString().padStart(2, '0')}:00</div>`)}
  </div>`;
}

/**
 * Render day background placeholder
 */
function renderDayBackground(day: Types.EventsByDay, config: Types.Config): TemplateResult {
  const date = new Date(day.timestamp);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isToday = new Date().toDateString() === date.toDateString();

  let columnStyle = '';
  if (isWeekend && config.weekend_day_color) {
    columnStyle = `background-color:${config.weekend_day_color};background-image:repeating-linear-gradient(to bottom, transparent, transparent calc(var(--hour-height) - 1px), var(--line-color) calc(var(--hour-height) - 1px), var(--line-color) var(--hour-height));`;
  }
  if (isToday && config.today_day_color) {
    columnStyle = `background-color:${config.today_day_color};background-image:repeating-linear-gradient(to bottom, transparent, transparent calc(var(--hour-height) - 1px), var(--line-color) calc(var(--hour-height) - 1px), var(--line-color) var(--hour-height));`;
  }

  return html`<div class="ccp-day-column" style=${columnStyle}></div>`;
}

/**
 * Render timed events for a given day as absolute blocks
 */
function renderTimedEvents(
  day: Types.EventsByDay,
  col: number,
  config: Types.Config,
  language: string,
  weather: Types.WeatherForecasts,
  hass: Types.Hass | null,
): TemplateResult[] {
  const timedPositions = calculateGridPositions(day.events.filter((e) => e.start.dateTime));
  return timedPositions.map((p) => {
    const ev = p.event;
    const eventColor = ev._matchedConfig?.color || config.event_color;
    const showTime = getEntitySetting(ev._entityId, 'show_time', config, ev) ?? config.show_time;
    const showLocation =
      getEntitySetting(ev._entityId, 'show_location', config, ev) ?? config.show_location;
    const eventTime = showTime ? FormatUtils.formatEventTime(ev, config, language, hass) : '';
    const location =
      ev.location && showLocation
        ? FormatUtils.formatLocation(ev.location, config.remove_location_country)
        : '';
    return html`<div
      class="ccp-event-block"
      style="--col:${col};--start:${p.startMinute / 60};--end:${p.endMinute /
      60};--lane:${p.lane};--lanes:${p.laneCount};background-color:${eventColor}"
      @click=${() =>
        config.tap_action?.action === 'expand' &&
        openEventDetail(ev, config, language, weather, hass)}
    >
      ${showTime ? html`<div class="time">${eventTime}</div>` : ''}
      <div class="summary">${ev.summary}</div>
      ${location ? html`<div class="location">${location}</div>` : ''}
    </div>`;
  });
}

/**
 * Render a cell in the all-day events row
 */
function renderAllDayCell(
  day: Types.EventsByDay,
  config: Types.Config,
  language: string,
  weather: Types.WeatherForecasts,
  hass: Types.Hass | null,
): TemplateResult {
  const allDayEvents = day.events.filter((e) => !e.start.dateTime && !e._isEmptyDay);
  return html`<div class="ccp-all-day-cell">
    ${allDayEvents.map((ev) => {
      const eventColor = ev._matchedConfig?.color || config.event_color;
      const showTime = getEntitySetting(ev._entityId, 'show_time', config, ev) ?? config.show_time;
      const showLocation =
        getEntitySetting(ev._entityId, 'show_location', config, ev) ?? config.show_location;

      // Determine if this is a multi-day all-day event
      const startDate = FormatUtils.parseAllDayDate(ev.start.date || '');
      const endDate = FormatUtils.parseAllDayDate(ev.end.date || '');
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setDate(adjustedEnd.getDate() - 1);
      const isMultiDay = startDate.toDateString() !== adjustedEnd.toDateString();

      const shouldShowTime = showTime && (isMultiDay || config.show_single_allday_time);
      const eventTime = shouldShowTime
        ? FormatUtils.formatEventTime(ev, config, language, hass)
        : '';
      const location =
        ev.location && showLocation
          ? FormatUtils.formatLocation(ev.location, config.remove_location_country)
          : '';

      return html`<div
        class="ccp-event-block"
        style="background-color:${eventColor}"
        @click=${() =>
          config.tap_action?.action === 'expand' &&
          openEventDetail(ev, config, language, weather, hass)}
      >
        ${shouldShowTime ? html`<div class="time">${eventTime}</div>` : ''}
        <div class="summary">${ev.summary}</div>
        ${location ? html`<div class="location">${location}</div>` : ''}
      </div>`;
    })}
  </div>`;
}
