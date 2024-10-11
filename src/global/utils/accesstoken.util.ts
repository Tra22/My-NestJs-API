export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smh])$/);
  if (!match) {
    throw new Error('Invalid duration format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const finalValue = value * 1000;
  switch (unit) {
    case 's': // Seconds
      return finalValue;
    case 'm': // Minutes
      return finalValue * 60;
    case 'h': // Hours
      return finalValue * 3600;
    default:
      throw new Error('Unknown duration unit');
  }
}
