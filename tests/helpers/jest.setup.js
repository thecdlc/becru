jest.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: jest.fn() }) }));
jest.mock('axios');            
jest.mock('sharp', () => () => ({ resize: () => ({ jpeg: () => ({ toFile: jest.fn() }) }) }));
