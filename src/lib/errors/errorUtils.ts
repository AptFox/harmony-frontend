import { ErrorCode } from '@/lib/errors/HarmonyErrors';

const shrugEmote = '¯\\_(ツ)_/¯';

const errorCodeToMsgMap = new Map<ErrorCode, string>([
  ['400', "The server didn't understand that request."],
  ['401', "That didn't quite work. Maybe try logging in again?"],
  ['403', 'What uh, what cha doin?'],
  ['404', `Page not found. ${shrugEmote}`],
  ['500', `Something went wrong, ${shrugEmote}`],
  ['503', 'The server is probably asleep. Come back later.'],
  ['default', `Something went wrong, ${shrugEmote}`],
]);

const RANDOM_SUBTITLES = [
  "People don't think it be like it is, but it do.",
  'It be like that someimes',
  'It really do be like that someimes.',
  'WHAT DID YOU DO???',
  'Honestly, it might be easier to ban you.',
  "I'm not sure why, but it feels right to blame you.",
  'Have you tried blaming yourself?',
  'Percussive maintenance required.',
  "There's like hella errors in here, big dawg.",
  "I'm tired, Boss.",
  "It's not you, it's... well, maybe it's you.",
];

export const getRandomErrorSubtitle = (): string => {
  return RANDOM_SUBTITLES[Math.floor(Math.random() * RANDOM_SUBTITLES.length)];
};

export const getErrorMessage = (code: string | undefined): string => {
  return (
    errorCodeToMsgMap.get(code as ErrorCode) ||
    errorCodeToMsgMap.get('default')!
  );
};
