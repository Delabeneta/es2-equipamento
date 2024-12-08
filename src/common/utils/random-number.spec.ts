import { generateRandomNumber } from './random-number';

describe('generateRandomNumber', () => {
  it('should return a 6-digit number', () => {
    const randomNumber = generateRandomNumber();
    expect(randomNumber).toBeGreaterThanOrEqual(100000);
    expect(randomNumber).toBeLessThanOrEqual(999999);
  });

  it('should generate a different number each time', () => {
    const randomNumber1 = generateRandomNumber();
    const randomNumber2 = generateRandomNumber();
    expect(randomNumber1).not.toBe(randomNumber2);
  });
});
