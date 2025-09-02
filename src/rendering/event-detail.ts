import { html, render } from 'lit';
import * as Types from '../config/types';
import * as FormatUtils from '../utils/format';

/**
 * Open a basic modal dialog with event details
 */
export function openEventDetail(
  event: Types.CalendarEventData,
  config: Types.Config,
  language: string,
  hass?: Types.Hass | null,
): void {
  const overlay = document.createElement('div');
  overlay.className = 'ccp-event-detail-overlay';
  overlay.addEventListener('click', () => overlay.remove());

  const time = FormatUtils.formatEventTime(event, config, language, hass);
  const location = event.location
    ? FormatUtils.formatLocation(event.location, config.remove_location_country)
    : '';

  render(
    html`<div class="ccp-event-detail-dialog">
      <div class="detail-time">${time}</div>
      <div class="detail-title">${event.summary}</div>
      ${location ? html`<div class="detail-location">${location}</div>` : ''}
      ${event.description
        ? html`<div class="detail-description">${event.description}</div>`
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
        background: var(--card-background-color, white);
        color: var(--primary-text-color);
        padding: 16px;
        border-radius: 8px;
        max-width: 90%;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }
      .detail-title {
        font-size: 1.1rem;
        font-weight: bold;
        margin-top: 8px;
      }
      .detail-time,
      .detail-location,
      .detail-description {
        margin-top: 8px;
      }
    </style>`,
    overlay,
  );

  document.body.appendChild(overlay);
}
