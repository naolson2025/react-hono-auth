export const signupReq = (
  email = 'test@test.com',
  password = 'password123'
) => {
  return new Request('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};
