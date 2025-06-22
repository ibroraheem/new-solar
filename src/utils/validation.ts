import { Appliance, TimeSlot } from '../types';
import { TIME_SLOT_CONSTANTS } from './constants';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateAppliance = (appliance: Appliance): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic validation
  if (!appliance.name.trim()) {
    errors.push({ field: 'name', message: 'Appliance name is required' });
  }

  if (appliance.watts <= 0) {
    errors.push({ field: 'watts', message: 'Power rating must be greater than 0' });
  }

  if (appliance.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be at least 1' });
  }

  // Time slot validation
  const selectedSlots = appliance.timeSlots.filter(slot => slot.selected);
  
  if (selectedSlots.length === 0) {
    errors.push({ field: 'timeSlots', message: 'At least one time slot must be selected' });
  }

  // Check for overlapping time slots
  const hasOverlap = checkTimeSlotOverlap(selectedSlots);
  if (hasOverlap) {
    errors.push({ field: 'timeSlots', message: 'Time slots cannot overlap' });
  }

  // Check total hours per day
  const totalHours = calculateTotalHours(selectedSlots);
  if (totalHours > 24) {
    errors.push({ field: 'timeSlots', message: 'Total usage cannot exceed 24 hours per day' });
  }

  return errors;
};

export const checkTimeSlotOverlap = (slots: TimeSlot[]): boolean => {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];
      
      if (doSlotsOverlap(slot1, slot2)) {
        return true;
      }
    }
  }
  return false;
};

const doSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  // Handle night slot (spans midnight: 22:00 to 06:00)
  const isNightSlot1 = slot1.name === 'night';
  const isNightSlot2 = slot2.name === 'night';
  
  // If both are night slots, they overlap
  if (isNightSlot1 && isNightSlot2) {
    return true;
  }
  
  // If one is night slot, check if the other overlaps with night hours
  if (isNightSlot1) {
    // slot1 is night (22:00-06:00), check if slot2 overlaps
    const nightStart = 22;
    const nightEnd = 6;
    const slot2Start = slot2.start;
    const slot2End = slot2.end;
    
    // Check if slot2 overlaps with night hours
    // slot2 overlaps if it starts before night ends OR ends after night starts
    if (slot2Start < nightEnd || slot2End > nightStart) {
      return true;
    }
    return false;
  }
  
  if (isNightSlot2) {
    // slot2 is night (22:00-06:00), check if slot1 overlaps
    const nightStart = 22;
    const nightEnd = 6;
    const slot1Start = slot1.start;
    const slot1End = slot1.end;
    
    // Check if slot1 overlaps with night hours
    // slot1 overlaps if it starts before night ends OR ends after night starts
    if (slot1Start < nightEnd || slot1End > nightStart) {
      return true;
    }
    return false;
  }

  // Regular time slot overlap check (both slots are within same day)
  const start1 = slot1.start;
  const end1 = slot1.end;
  const start2 = slot2.start;
  const end2 = slot2.end;

  // Check if slots overlap (they overlap if one starts before the other ends)
  // Note: slots that meet exactly (like 17-22 and 22-6) do NOT overlap
  return start1 < end2 && start2 < end1;
};

export const calculateTotalHours = (slots: TimeSlot[]): number => {
  return slots.reduce((total, slot) => {
    if (!slot.selected) return total;
    
    if (slot.durationMinutes) {
      return total + (slot.durationMinutes / 60);
    }
    
    // Use centralized duration calculation
    return total + getTimeSlotDuration(slot);
  }, 0);
};

export const validateAllAppliances = (appliances: Appliance[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  appliances.forEach((appliance, index) => {
    // Only validate selected appliances
    if (appliance.isSelected) {
      const applianceErrors = validateAppliance(appliance);
      applianceErrors.forEach(error => {
        errors.push({
          field: `appliance-${index}-${error.field}`,
          message: `${appliance.name}: ${error.message}`
        });
      });
    }
  });
  
  return errors;
};

// Centralized time slot duration calculation
export const getTimeSlotDuration = (slot: TimeSlot): number => {
  if (slot.name === 'night') {
    return TIME_SLOT_CONSTANTS.NIGHT_SLOT_DURATION;
  }
  return slot.end > slot.start 
    ? slot.end - slot.start 
    : (24 - slot.start) + slot.end;
};

// Centralized time slot duration display string
export const getTimeSlotDurationString = (slot: TimeSlot): string => {
  const hours = getTimeSlotDuration(slot);
  return `${slot.start.toString().padStart(2, '0')}:00-${slot.end.toString().padStart(2, '0')}:00 (${hours}h max)`;
}; 