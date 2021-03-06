export const ALGORITHM_ID_MAP = {
  threeTimesUpAndDown: 'three-times-up-and-down',
  takuya: 'takuya',
} as const;

export const SERVICE_ID_MAP = {
  bitflyer: 'bitflyer',
} as const;

export const CONFIG_DEFAULT_SETTING = {
  port: 8080,
  algorithumId: ALGORITHM_ID_MAP.threeTimesUpAndDown,
  serviceId: SERVICE_ID_MAP.bitflyer,
  sandBoxMode: true,
  orderSizeBTC: 0.01,
  intervalSec: 120,
} as const;

export const COMPARED_PRICE_STATUS = {
  up: 'up',
  down: 'down',
  same: 'same',
} as const;

export const COMPARED_PRICE_STATUS_ICON = {
  up: '🔼',
  down: '🔻',
  same: '--',
} as const;
