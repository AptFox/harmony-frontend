import { parseScheduleSlot } from '@/lib/availabilityService';
import { convertDateToDayOfWeek } from '@/lib/availabilityUtils';
import { ParsedScheduleSlot, ScheduleSlot } from '@/types/ScheduleTypes';
import { Temporal } from '@js-temporal/polyfill';

const localeStringFormat: Intl.LocalesArgument = 'en-US';
const getLocaleStringOptions = (): Intl.DateTimeFormatOptions => {
  return {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
};

const convertDateToLocaleString = (date: Temporal.ZonedDateTime): string => {
  return date.toLocaleString(localeStringFormat, getLocaleStringOptions());
};

const compareParsedScheduleSlots = (
  expected: ParsedScheduleSlot,
  actual: ParsedScheduleSlot
) => {
  expect(actual.startTimeInTargetTz.toString()).toBe(
    expected.startTimeInTargetTz.toString()
  );
  expect(actual.endTimeInTargetTz.toString()).toBe(
    expected.endTimeInTargetTz.toString()
  );
};

const compareDateToExpectedLocaleTime = (
  date: Temporal.ZonedDateTime,
  expectedLocaleTime: string
) => {
  const dateConvertedToLocale = convertDateToLocaleString(date);
  expect(dateConvertedToLocale).toBe(expectedLocaleTime);
};

const instantToDate = (
  instant: string,
  targetTimeZoneId: string
): Temporal.ZonedDateTime => {
  return Temporal.Instant.from(instant).toZonedDateTimeISO(targetTimeZoneId);
};

// For calendar days
const calendarDayInZone = (
  tz: string,
  year: number,
  month: number,
  day: number
): Temporal.ZonedDateTime =>
  Temporal.ZonedDateTime.from({ timeZone: tz, year, month, day });

describe('availabilityService', () => {
  describe('convertScheduleSlotToTimeZone', () => {
    describe('when given a schedule slot in matching timezone', () => {
      it('parses a schedule slot to EST time zone', () => {
        const targetTimeZoneId = 'America/New_York';
        const targetDate = calendarDayInZone(
          targetTimeZoneId,
          2026,
          1,
          30
        ).startOfDay();
        const dayOfWeek = convertDateToDayOfWeek(targetDate);
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          dayOfWeek: dayOfWeek,
          startTime: '00:00:00',
          endTime: '02:00:00',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          dayOfWeek: dayOfWeek,
          startTimeInTargetTz: instantToDate(
            '2026-01-30T05:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 12am EST (should be 5am UTC)
          endTimeInTargetTz: instantToDate(
            '2026-01-30T07:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 2am EST (should be 7am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          '01/30/26, 12:00:00 AM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          '01/30/26, 02:00:00 AM'
        );
      });
      it('parses a schedule slot to CST time zone', () => {
        const targetTimeZoneId = 'America/Chicago';
        const targetDate = calendarDayInZone(
          targetTimeZoneId,
          2026,
          1,
          30
        ).startOfDay();
        const dayOfWeek = convertDateToDayOfWeek(targetDate);
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          dayOfWeek: dayOfWeek,
          startTime: '00:00:00',
          endTime: '02:00:00',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          dayOfWeek: dayOfWeek,
          startTimeInTargetTz: instantToDate(
            '2026-01-30T06:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 12am CST (should be 6am UTC)
          endTimeInTargetTz: instantToDate(
            '2026-01-30T08:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 2am CST (should be 8am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          '01/30/26, 12:00:00 AM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          '01/30/26, 02:00:00 AM'
        );
      });
      it('when endTime is 11:59:59 PM, parses endTime as 12AM next day', () => {
        const targetTimeZoneId = 'America/New_York';
        const targetDate = calendarDayInZone(
          targetTimeZoneId,
          2026,
          1,
          30
        ).startOfDay();
        const dayOfWeek = convertDateToDayOfWeek(targetDate);
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          dayOfWeek: dayOfWeek,
          startTime: '22:00:00',
          endTime: '23:59:59',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          dayOfWeek: 'Fri',
          startTimeInTargetTz: instantToDate(
            '2026-01-31T03:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 10pm EST (should be 3am UTC)
          endTimeInTargetTz: instantToDate(
            '2026-01-31T05:00:00.000Z',
            targetTimeZoneId
          ), // UTC time stamp for 12am EST (should be 7am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          '01/30/26, 10:00:00 PM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          '01/31/26, 12:00:00 AM'
        );
      });
    });
    describe('when given a schedule slot in a different timezone', () => {
      describe('converts schedule slot from', () => {
        it('EST to CST', () => {
          const targetTimeZoneId = 'America/Chicago';
          const targetDate = calendarDayInZone(
            targetTimeZoneId,
            2026,
            1,
            30
          ).startOfDay();
          const dayOfWeek = 'Thu';
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-30T05:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-30T07:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/29/26, 11:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/30/26, 01:00:00 AM'
          );
        });
        it('CST to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = calendarDayInZone(
            targetTimeZoneId,
            2026,
            1,
            30
          ).startOfDay();
          const dayOfWeek = convertDateToDayOfWeek(targetDate);
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/Chicago',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-30T06:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am CST (should be 6am UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-30T08:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am CST (should be 8am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/30/26, 01:00:00 AM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/30/26, 03:00:00 AM'
          );
        });
        it('EST to GMT+7', () => {
          const targetTimeZoneId = 'Asia/Bangkok';
          const targetDate = instantToDate(
            '2026-01-30T00:00:00.000Z',
            targetTimeZoneId
          );
          const dayOfWeek = convertDateToDayOfWeek(targetDate);
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-30T05:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-30T07:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/30/26, 12:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/30/26, 02:00:00 PM'
          );
        });
        it('GMT+7 to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = calendarDayInZone(
            targetTimeZoneId,
            2026,
            1,
            30
          ).startOfDay();
          const dayOfWeek = 'Thu';
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'Asia/Bangkok',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-29T17:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am GMT+7 (should be 5pm UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-29T19:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am GMT+7 (should be 7pm UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/29/26, 12:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/29/26, 02:00:00 PM'
          );
        });
        it('PST to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = calendarDayInZone(
            targetTimeZoneId,
            2026,
            1,
            30
          ).startOfDay();
          const dayOfWeek = convertDateToDayOfWeek(targetDate);
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/Los_Angeles',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-30T08:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am PST (should be 8am UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-30T10:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am PST (should be 10am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/30/26, 03:00:00 AM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/30/26, 05:00:00 AM'
          );
        });
        it('EST to PST', () => {
          const targetTimeZoneId = 'America/Los_Angeles';
          const targetDate = calendarDayInZone(
            targetTimeZoneId,
            2026,
            1,
            30
          ).startOfDay();
          const dayOfWeek = 'Thu';
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: instantToDate(
              '2026-01-30T05:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: instantToDate(
              '2026-01-30T07:00:00.000Z',
              targetTimeZoneId
            ), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            '01/29/26, 09:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            '01/29/26, 11:00:00 PM'
          );
        });
      });
    });
  });
});
