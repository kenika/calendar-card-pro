/* eslint-disable import/order */
import { html, render } from 'lit';

import * as Types from '../config/types';
import * as FormatUtils from '../utils/format';
import * as Weather from '../utils/weather';

/**
 * Open a basic modal dialog with event details
 */
export function openEventDetail(
  event: Types.CalendarEventData,
  config: Types.Config,
  language: string,
  weather?: Types.WeatherForecasts,
  hass?: Types.Hass | null,
): void {
  const overlay = document.createElement('div');
  overlay.className = 'ccp-event-detail-overlay';
  overlay.addEventListener('click', () => overlay.remove());

  const time = FormatUtils.formatEventTime(event, config, language, hass);
  const location = event.rawLocation
    ? FormatUtils.formatLocation(event.rawLocation, config.remove_location_country)
    : '';
  const forecast = weather
    ? Weather.findForecastForEvent(event, weather.hourly, weather.daily)
    : undefined;
  const eventWeatherConfig = config.weather?.event || {};
  const eventWeatherStyle = `font-size:${eventWeatherConfig.font_size || '12px'};color:${eventWeatherConfig.color || 'var(--primary-text-color)'};`;
  const eventIconSize = eventWeatherConfig.icon_size || '14px';
  const showTemp = eventWeatherConfig.show_temp !== false;
  const showCondition = eventWeatherConfig.show_conditions === true;
  const showHigh = eventWeatherConfig.show_high_temp === true;
  const showLow = eventWeatherConfig.show_low_temp === true;
  const labels =
    event._entityLabels && event._entityLabels.length
      ? event._entityLabels
      : event._entityLabel
        ? [event._entityLabel]
        : [];
  const colors =
    event._entityColors && event._entityColors.length
      ? event._entityColors
      : event._matchedConfig?.color
        ? [event._matchedConfig.color]
        : [];

  render(
    html`<div class="ccp-event-detail-dialog" @click=${(e: Event) => e.stopPropagation()}>
        ${forecast
          ? html`<div class="detail-weather" style=${eventWeatherStyle}>
              <ha-icon
                style="width:${eventIconSize};height:${eventIconSize};"
                .icon=${forecast.icon}
              ></ha-icon>
              ${showTemp && forecast.temperature !== undefined
                ? html`<span class="temp">${forecast.temperature}°</span>`
                : ''}
              ${showHigh && forecast.temperature !== undefined
                ? html`<span class="high">${forecast.temperature}°</span>`
                : ''}
              ${showLow && forecast.templow !== undefined
                ? html`<span class="low">${forecast.templow}°</span>`
                : ''}
              ${showCondition ? html`<span class="cond">${forecast.condition}</span>` : ''}
              ${forecast.precipitation_probability !== undefined
                ? html`<span class="rain">${forecast.precipitation_probability}%</span>`
                : ''}
            </div>`
          : ''}
        <div class="detail-title">${event.summary}</div>
        ${labels.length
          ? html`<div class="detail-calendars">
              ${labels.map(
                (l, idx) =>
                  html`<button
                    class="ccp-filter-btn"
                    style="color:${colors[idx] || 'var(--primary-text-color)'}"
                  >
                    ${l}
                  </button>`,
              )}
            </div>`
          : ''}
        <div class="detail-time">${time}</div>
        ${location ? html`<div class="detail-location">${location}</div>` : ''}
        ${event.description ? html`<div class="detail-description">${event.description}</div>` : ''}
      </div>
      <style>
        .ccp-event-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .ccp-event-detail-dialog {
          position: relative;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
          padding: 16px;
          border-radius: 8px;
          width: 25%;
          height: 25%;
          overflow: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        .detail-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .detail-time,
        .detail-location,
        .detail-description {
          margin-top: 8px;
        }
        .detail-description {
          white-space: pre-wrap;
        }
        .detail-calendars {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }
        .ccp-filter-btn {
          padding: 4px 8px;
          border: 1px solid var(--line-color);
          border-radius: 16px;
          background: none;
          font: inherit;
          cursor: default;
        }
        .detail-weather {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .detail-weather .rain {
          color: blue;
        }
      </style>`,
    overlay,
  );

  document.body.appendChild(overlay);
}
