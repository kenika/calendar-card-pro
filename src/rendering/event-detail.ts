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
  const location = event.location
    ? FormatUtils.formatLocation(event.location, config.remove_location_country)
    : '';
  const forecast = weather
    ? Weather.findForecastForEvent(event, weather.hourly, weather.daily)
    : undefined;
  const eventWeatherStyle = `font-size:${config.weather?.event?.font_size || '12px'};color:${config.weather?.event?.color || 'var(--primary-text-color)'};`;
  const eventIconSize = config.weather?.event?.icon_size || '14px';

  render(
    html`<div class="ccp-event-detail-dialog" @click=${(e: Event) => e.stopPropagation()}>
        ${forecast
          ? html`<div class="detail-weather" style=${eventWeatherStyle}>
              <ha-icon
                style="width:${eventIconSize};height:${eventIconSize};"
                .icon=${forecast.icon}
              ></ha-icon>
              <span class="temp">${forecast.temperature}°</span>
              ${forecast.precipitation_probability !== undefined
                ? html`<span class="rain">${forecast.precipitation_probability}%</span>`
                : ''}
            </div>`
          : ''}
        <div class="detail-title">${event.summary}</div>
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
        .detail-weather {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }
        .detail-weather .rain {
          color: blue;
        }
      </style>`,
    overlay,
  );

  document.body.appendChild(overlay);
}
