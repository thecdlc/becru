const isAuthenticated = require('../../middleware/auth');
test('redirects if no user in session', () => {
  const req = { session: {} }; const res = { redirect: jest.fn() };
  isAuthenticated(req, res, () => {});
  expect(res.redirect).toHaveBeenCalledWith('/admin');
});
