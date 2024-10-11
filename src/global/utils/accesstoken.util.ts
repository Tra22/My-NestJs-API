export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smh])$/);
  if (!match) {
    throw new Error('Invalid duration format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': // Seconds
      return value;
    case 'm': // Minutes
      return value * 60;
    case 'h': // Hours
      return value * 3600;
    default:
      throw new Error('Unknown duration unit');
  }
}
