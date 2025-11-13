import React, { useState, useMemo } from 'react';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../../config/theme'; // 1. Import colors from your central theme file

// --- Theme object to style the calendar ---
// We manually translate your tailwind colors into the format the library needs.
const getCalendarTheme = () => {
  return {
    backgroundColor: colors.background,
    calendarBackground: colors.background,
    textSectionTitleColor: colors.foreground,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors['primary-foreground'],
    todayTextColor: colors.primary,
    dayTextColor: colors.foreground,
    textDisabledColor: colors['muted-foreground'],
    dotColor: colors.primary,
    selectedDotColor: colors['primary-foreground'],
    arrowColor: colors.primary,
    monthTextColor: colors.foreground,
    indicatorColor: colors.primary,
    textDayFontWeight: '400',
    textMonthFontWeight: '600',
    textDayHeaderFontWeight: '400',
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  };
};

const Calendar = ({
  mode = 'single', // 'single' or 'range'
  onSelect,
  initialDate,
  className,
  ...props
}) => {
  const [selected, setSelected] = useState(initialDate);
  const [range, setRange] = useState({});

  const theme = getCalendarTheme();

  const handleDayPress = day => {
    if (mode === 'single') {
      const newSelectedDate = day.dateString;
      setSelected(newSelectedDate);
      if (onSelect) {
        onSelect(newSelectedDate);
      }
    } else if (mode === 'range') {
      if (!range.start || range.end) {
        const newRange = { start: day, end: null };
        setRange(newRange);
        if (onSelect) onSelect(newRange);
      } else {
        const newRange = { ...range, end: day };
        setRange(newRange);
        if (onSelect) onSelect(newRange);
      }
    }
  };

  const markedDates = useMemo(() => {
    const marks = {};

    if (mode === 'single' && selected) {
      marks[selected] = { selected: true, disableTouchEvent: true };
    } else if (mode === 'range' && range.start) {
      let current = new Date(range.start.timestamp);
      const end = range.end ? new Date(range.end.timestamp) : current;

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        marks[dateString] = {
          startingDay: current.getTime() === range.start.timestamp,
          endingDay: range.end
            ? current.getTime() === range.end.timestamp
            : false,
          color: theme.selectedDayBackgroundColor,
          textColor: theme.selectedDayTextColor,
        };
        current.setDate(current.getDate() + 1);
      }
    }
    return marks;
  }, [selected, range, mode, theme]);

  return (
    // 2. Use RNCalendar directly
    <RNCalendar
      current={initialDate}
      onDayPress={handleDayPress}
      markedDates={markedDates}
      markingType={mode === 'range' ? 'period' : 'custom'}
      theme={theme}
      renderArrow={direction =>
        direction === 'left' ? (
          <ChevronLeft size={20} color={theme.arrowColor} />
        ) : (
          <ChevronRight size={20} color={theme.arrowColor} />
        )
      }
      style={props.style} // Pass style prop for layout
      {...props}
    />
  );
};

export { Calendar };
