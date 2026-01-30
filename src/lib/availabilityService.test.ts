import { parseScheduleSlot } from '@/lib/availabilityService';
import { daysOfWeek } from '@/lib/availabilityUtils';
import { ParsedScheduleSlot, ScheduleSlot } from '@/types/ScheduleTypes';

const localeStringFormat: Intl.LocalesArgument = 'en-US';
const getLocaleStringOptions = (
  timeZoneId: string
): Intl.DateTimeFormatOptions => {
  return {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: timeZoneId,
  };
};

const convertDateToLocaleString = (date: Date, timeZoneId: string) => {
  return date.toLocaleString(
    localeStringFormat,
    getLocaleStringOptions(timeZoneId)
  );
};

const compareParsedScheduleSlots = (
  expected: ParsedScheduleSlot,
  actual: ParsedScheduleSlot
) => {
  expect(actual).toEqual(expected);

  // compare times converted to local time of machine running the tests
  expect(actual.startTimeInTargetTz.toLocaleTimeString()).toEqual(
    expected.startTimeInTargetTz.toLocaleTimeString()
  );
  expect(actual.endTimeInTargetTz.toLocaleTimeString()).toEqual(
    expected.endTimeInTargetTz.toLocaleTimeString()
  );

  // compare date converted to local date of machine running the tests
  expect(actual.startTimeInTargetTz.toLocaleDateString()).toEqual(
    expected.startTimeInTargetTz.toLocaleDateString()
  );
  expect(actual.endTimeInTargetTz.toLocaleDateString()).toEqual(
    expected.endTimeInTargetTz.toLocaleDateString()
  );

  // compare ISO strings
  expect(actual.startTimeInTargetTz.toISOString()).toEqual(
    expected.startTimeInTargetTz.toISOString()
  );
  expect(actual.endTimeInTargetTz.toISOString()).toEqual(
    expected.endTimeInTargetTz.toISOString()
  );
};

const compareDateToExpectedLocaleTime = (
  date: Date,
  targetTimeZoneId: string,
  expectedLocaleTime: string
) => {
  const startDateTimeConvertedToLocale = convertDateToLocaleString(
    date,
    targetTimeZoneId
  );
  expect(startDateTimeConvertedToLocale).toEqual(expectedLocaleTime);
};

describe('availabilityService', () => {
  describe('convertScheduleSlotToTimeZone', () => {
    describe('when given a schedule slot in matching timezone', () => {
      it('parses a schedule slot to EST time zone', () => {
        const targetTimeZoneId = 'America/New_York';
        const targetDate = new Date('2026-01-30T00:00:00.000Z');
        const dayOfWeek = daysOfWeek[targetDate.getDay()];
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          playerId: '201',
          dayOfWeek: dayOfWeek,
          startTime: '00:00:00',
          endTime: '02:00:00',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          playerId: '201',
          dayOfWeek: dayOfWeek,
          startTimeInTargetTz: new Date('2026-01-30T05:00:00.000Z'), // UTC time stamp for 12am EST (should be 5am UTC)
          endTimeInTargetTz: new Date('2026-01-30T07:00:00.000Z'), // UTC time stamp for 2am EST (should be 7am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          targetTimeZoneId,
          '01/30/26, 12:00:00 AM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          targetTimeZoneId,
          '01/30/26, 02:00:00 AM'
        );
      });
      it('parses a schedule slot to CST time zone', () => {
        const targetTimeZoneId = 'America/Chicago';
        const targetDate = new Date('2026-01-30T00:00:00.000Z');
        const dayOfWeek = daysOfWeek[targetDate.getDay()];
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          playerId: '201',
          dayOfWeek: dayOfWeek,
          startTime: '00:00:00',
          endTime: '02:00:00',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          playerId: '201',
          dayOfWeek: dayOfWeek,
          startTimeInTargetTz: new Date('2026-01-30T06:00:00.000Z'), // UTC time stamp for 12am CST (should be 6am UTC)
          endTimeInTargetTz: new Date('2026-01-30T08:00:00.000Z'), // UTC time stamp for 2am CST (should be 8am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          targetTimeZoneId,
          '01/30/26, 12:00:00 AM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          targetTimeZoneId,
          '01/30/26, 02:00:00 AM'
        );
      });
      it('when endTime is 11:59:59 PM, parses endTime as 12AM next day', () => {
        const targetTimeZoneId = 'America/New_York';
        const targetDate = new Date('2026-01-30T00:00:00.000Z');
        const dayOfWeek = daysOfWeek[targetDate.getDay()];
        const scheduleSlot: ScheduleSlot = {
          id: '101',
          userId: 'someUuid',
          playerId: '201',
          dayOfWeek: dayOfWeek,
          startTime: '22:00:00',
          endTime: '23:59:59',
          timeZoneId: targetTimeZoneId,
        };
        const expected: ParsedScheduleSlot = {
          playerId: '201',
          dayOfWeek: 'Sat',
          startTimeInTargetTz: new Date('2026-01-31T03:00:00.000Z'), // UTC time stamp for 10pm EST (should be 3am UTC)
          endTimeInTargetTz: new Date('2026-01-31T05:00:00.000Z'), // UTC time stamp for 12am EST (should be 7am UTC)
        };
        const actual = parseScheduleSlot(
          scheduleSlot,
          targetDate,
          targetTimeZoneId
        );
        compareParsedScheduleSlots(expected, actual);
        compareDateToExpectedLocaleTime(
          actual.startTimeInTargetTz,
          targetTimeZoneId,
          '01/30/26, 10:00:00 PM'
        );
        compareDateToExpectedLocaleTime(
          actual.endTimeInTargetTz,
          targetTimeZoneId,
          '01/31/26, 12:00:00 AM'
        );
      });
    });
    describe('when given a schedule slot in a different timezone', () => {
      describe('converts schedule slot from', () => {
        it('EST to CST', () => {
          const targetTimeZoneId = 'America/Chicago';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-30T05:00:00.000Z'), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: new Date('2026-01-30T07:00:00.000Z'), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/29/26, 11:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 01:00:00 AM'
          );
        });
        it('CST to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/Chicago',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-30T06:00:00.000Z'), // UTC time stamp for 12am CST (should be 6am UTC)
            endTimeInTargetTz: new Date('2026-01-30T08:00:00.000Z'), // UTC time stamp for 2am CST (should be 8am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 01:00:00 AM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 03:00:00 AM'
          );
        });
        it('EST to GMT+7', () => {
          const targetTimeZoneId = 'Asia/Bangkok';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-30T05:00:00.000Z'), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: new Date('2026-01-30T07:00:00.000Z'), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 12:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 02:00:00 PM'
          );
        });
        it('GMT+7 to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'Asia/Bangkok',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-29T17:00:00.000Z'), // UTC time stamp for 12am GMT+7 (should be 5pm UTC)
            endTimeInTargetTz: new Date('2026-01-29T19:00:00.000Z'), // UTC time stamp for 2am GMT+7 (should be 7pm UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/29/26, 12:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/29/26, 02:00:00 PM'
          );
        });
        it('PST to EST', () => {
          const targetTimeZoneId = 'America/New_York';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/Los_Angeles',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-30T08:00:00.000Z'), // UTC time stamp for 12am PST (should be 8am UTC)
            endTimeInTargetTz: new Date('2026-01-30T10:00:00.000Z'), // UTC time stamp for 2am PST (should be 10am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 03:00:00 AM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/30/26, 05:00:00 AM'
          );
        });
        it('EST to PST', () => {
          const targetTimeZoneId = 'America/Los_Angeles';
          const targetDate = new Date('2026-01-30T00:00:00.000Z');
          const dayOfWeek = daysOfWeek[targetDate.getDay()];
          const scheduleSlot: ScheduleSlot = {
            id: '101',
            userId: 'someUuid',
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTime: '00:00:00',
            endTime: '02:00:00',
            timeZoneId: 'America/New_York',
          };
          const expected: ParsedScheduleSlot = {
            playerId: '201',
            dayOfWeek: dayOfWeek,
            startTimeInTargetTz: new Date('2026-01-30T05:00:00.000Z'), // UTC time stamp for 12am EST (should be 5am UTC)
            endTimeInTargetTz: new Date('2026-01-30T07:00:00.000Z'), // UTC time stamp for 2am EST (should be 7am UTC)
          };
          const actual = parseScheduleSlot(
            scheduleSlot,
            targetDate,
            targetTimeZoneId
          );
          compareParsedScheduleSlots(expected, actual);
          compareDateToExpectedLocaleTime(
            actual.startTimeInTargetTz,
            targetTimeZoneId,
            '01/29/26, 09:00:00 PM'
          );
          compareDateToExpectedLocaleTime(
            actual.endTimeInTargetTz,
            targetTimeZoneId,
            '01/29/26, 11:00:00 PM'
          );
        });
      });
    });
  });
});
