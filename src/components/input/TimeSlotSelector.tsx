import React from 'react';
import { Sun, Sunrise, Sunset, Moon, Clock } from 'lucide-react';
import { TimeSlot } from '../../types';
import { motion } from 'framer-motion';

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  onTimeSlotToggle: (slotId: string) => void;
  onDurationChange: (slotId: string, minutes: number) => void;
  disabled?: boolean;
}

const TimeSlotIcon = ({ name }: { name: TimeSlot['name'] }) => {
  switch (name) {
    case 'morning':
      return <Sunrise className="h-4 w-4" />;
    case 'afternoon':
      return <Sun className="h-4 w-4" />;
    case 'evening':
      return <Sunset className="h-4 w-4" />;
    case 'night':
      return <Moon className="h-4 w-4" />;
  }
};

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  onTimeSlotToggle,
  onDurationChange,
  disabled = false,
}) => {
  const getTimeSlotDuration = (slot: TimeSlot): string => {
    let hours;
    if (slot.name === 'night') {
      hours = 8; // 22:00 to 06:00 = 8 hours
    } else {
      hours = slot.end > slot.start 
        ? slot.end - slot.start 
        : (24 - slot.start) + slot.end;
    }
    return `${slot.start.toString().padStart(2, '0')}:00-${slot.end.toString().padStart(2, '0')}:00 (${hours}h max)`;
  };

  const getMaxHours = (slot: TimeSlot): number => {
    if (slot.name === 'night') {
      return 8;
    }
    return slot.end > slot.start 
      ? slot.end - slot.start 
      : (24 - slot.start) + slot.end;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Usage Times</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {timeSlots.map((slot) => (
          <motion.div
            key={slot.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <button
              onClick={() => onTimeSlotToggle(slot.id)}
              disabled={disabled}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                slot.selected
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={getTimeSlotDuration(slot)}
            >
              <div className="flex flex-col items-center gap-1">
                <TimeSlotIcon name={slot.name} />
                <span className="text-xs font-medium capitalize">{slot.name}</span>
                <span className="text-xs opacity-75">
                  {slot.start.toString().padStart(2, '0')}:00-{slot.end.toString().padStart(2, '0')}:00
                </span>
              </div>
            </button>
            
            {slot.selected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-600">Duration:</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max={getMaxHours(slot)}
                    className="w-12 border border-gray-300 rounded-md shadow-sm p-1 text-center text-xs"
                    placeholder="hrs"
                    value={slot.durationMinutes ? Math.floor(slot.durationMinutes / 60) : ''}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = hours * 60;
                      onDurationChange(slot.id, minutes);
                    }}
                    disabled={disabled}
                  />
                  <span className="text-xs text-gray-500">h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-12 border border-gray-300 rounded-md shadow-sm p-1 text-center text-xs"
                    placeholder="min"
                    value={slot.durationMinutes ? slot.durationMinutes % 60 : ''}
                    onChange={(e) => {
                      const currentHours = slot.durationMinutes ? Math.floor(slot.durationMinutes / 60) : 0;
                      const minutes = parseInt(e.target.value) || 0;
                      const totalMinutes = (currentHours * 60) + minutes;
                      onDurationChange(slot.id, totalMinutes);
                    }}
                    disabled={disabled}
                  />
                  <span className="text-xs text-gray-500">m</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Max: {getMaxHours(slot)}h
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector; 