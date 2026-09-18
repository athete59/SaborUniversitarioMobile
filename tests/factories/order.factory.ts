import { faker } from '@faker-js/faker';

export const buildOrderInput = (overrides = {}) => ({
  customerName: faker.person.fullName(),
  items: [
    {
      productId: faker.string.uuid(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: faker.number.int({ min: 100, max: 5000 }),
    },
  ],
  coupon: faker.string.alphanumeric(8),
  ...overrides,
});