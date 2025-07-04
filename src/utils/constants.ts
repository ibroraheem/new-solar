// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_DAILY_ENERGY: 0.1, // kWh
  MAX_DAILY_ENERGY: 100, // kWh
  MIN_BACKUP_HOURS: 4, // Reduced from 8 to include basic residential options
  MAX_BACKUP_HOURS: 24,
  MAX_SYSTEM_SIZE_KWP: 12.6,
  EFFICIENCY_FACTOR: 0.85, // 85% efficiency for battery calculations
} as const;

// Time slot constants
export const TIME_SLOT_CONSTANTS = {
  NIGHT_SLOT_DURATION: 8, // 22:00 to 06:00 = 8 hours
} as const;

// System constants
export const SYSTEM_CONSTANTS = {
  AC_VOLTAGE: 230, // V
  DC_SAFETY_MARGIN: 1.25, // 25% safety margin for DC current
  AC_SAFETY_MARGIN: 1.1, // 10% safety margin for AC current
  PEAK_POWER_MARGIN: 1.3, // 30% peak power margin
  SOLAR_EFFICIENCY: 0.75, // 75% efficiency factor for solar calculations
} as const; 