/* eslint-disable import/order */
/**
 * Styles for the full-grid view
 */
import { css } from 'lit';

export const fullGridStyles = css`
  .ccp-full-grid {
    display: flex;
    flex-direction: column;
    --time-axis-width: 50px;
    --hour-height: 60px;
    --line-color: var(--calendar-card-line-color-vertical);
  }

  .ccp-calendar-header {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    align-items: center;
  }

  .ccp-filter-btn {
    padding: 4px 8px;
    border: 1px solid var(--line-color);
    border-radius: 16px;
    background: none;
    cursor: pointer;
    font: inherit;
    opacity: 0.4;
  }

  .ccp-filter-btn.is-active {
    background-color: var(--line-color);
    color: var(--primary-text-color);
    opacity: 1;
  }

  .ccp-build-tag {
    margin-left: auto;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .ccp-weekday-header {
    display: grid;
    grid-template-columns: var(--time-axis-width) repeat(var(--full-grid-days, 7), 1fr);
    text-align: center;
    font-weight: bold;
  }

  .ccp-weekday-label {
    padding: 4px 0;
  }

  .ccp-all-day-row {
    display: grid;
    grid-template-columns: var(--time-axis-width) repeat(var(--full-grid-days, 7), 1fr);
    min-height: 24px;
  }

  .ccp-time-axis-spacer {
    border-right: 1px solid var(--line-color);
  }

  .ccp-all-day-cell {
    height: 100%;
    border-bottom: 1px solid var(--line-color);
  }

  .ccp-main-grid {
    display: grid;
    grid-template-columns: var(--time-axis-width) 1fr;
  }

  .ccp-time-axis {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    border-right: 1px solid var(--line-color);
  }

  .ccp-time-axis > div {
    height: var(--hour-height);
    border-top: 1px solid var(--line-color);
    box-sizing: border-box;
  }

  .ccp-day-columns {
    display: grid;
    grid-template-columns: repeat(var(--full-grid-days, 7), 1fr);
    position: relative;
    min-height: calc(24 * var(--hour-height));
    background-image: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent calc(var(--hour-height) - 1px),
      var(--line-color) calc(var(--hour-height) - 1px),
      var(--line-color) var(--hour-height)
    );
  }

  .ccp-day-column {
    border-left: 1px solid var(--line-color);
    height: 100%;
  }

  .ccp-day-column:first-child {
    border-left: none;
  }

  .ccp-event-block {
    position: absolute;
    --lanes: 1;
    left: calc(
      (100% / var(--full-grid-days, 7)) * var(--col) + (100% / var(--full-grid-days, 7)) *
        (var(--lane, 0) / var(--lanes)) + (100% / var(--full-grid-days, 7)) * (1 / var(--lanes)) *
        0.01
    );
    width: calc((100% / var(--full-grid-days, 7)) * (1 / var(--lanes)) * 0.98);
    top: calc(var(--start) * var(--hour-height) + var(--hour-height) * 0.01);
    height: calc((var(--end) - var(--start)) * var(--hour-height) * 0.98);
    background-color: var(--line-color);
    color: var(--primary-text-color);
    border-radius: 4px;
    padding: 2px;
    box-sizing: border-box;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    flex-direction: column;
  }

  .ccp-event-block .time {
    font-weight: bold;
  }

  .ccp-event-block .location {
    font-size: 10px;
    opacity: 0.8;
  }
`;
