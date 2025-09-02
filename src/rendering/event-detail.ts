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

  render(
    html`<div class="ccp-event-detail-dialog" @click=${(e: Event) => e.stopPropagation()}>
        ${forecast
          ? html`<div class="detail-weather">
              <ha-icon .icon=${forecast.icon}></ha-icon>
              <span class="temp">${forecast.temperature}°</span>
              ${forecast.precipitation_probability !== undefined
                ? html`<span class="rain">${forecast.precipitation_probability}%</span>`
                : ''}
            </div>`
          : ''}
        <div class="detail-title">${event.summary}</div>
        <div class="detail-time">${time}</div>
        ${location ? html`<div class="detail-location">${location}</div>` : ''}
        ${event.description
          ? html`<div class="detail-description">${event.description}</div>
              <button class="detail-expand">Expand</button>`
          : ''}
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
          width: 50%;
          height: 50%;
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
          display: -webkit-box;
          -webkit-line-clamp: 20;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .detail-description.expanded {
          display: block;
          -webkit-line-clamp: unset;
        }
        .detail-expand {
          margin-top: 8px;
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 0;
          font: inherit;
        }
        .detail-weather {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .detail-weather .rain {
          color: blue;
        }
      </style>`,
    overlay,
  );

  document.body.appendChild(overlay);

  const description = overlay.querySelector('.detail-description') as HTMLElement | null;
  const expandBtn = overlay.querySelector('.detail-expand') as HTMLButtonElement | null;

  if (description && expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      description.classList.toggle('expanded');
      expandBtn.textContent = description.classList.contains('expanded') ? 'Collapse' : 'Expand';
    });
  }
}
