const data = {
  prenom: "Test",
  nom: "User",
  email: "testuser3@example.com",
  password: "Password123!",
  confirmPassword: "Password123!"
};

fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(res => res.text().then(text => ({ status: res.status, text })))
  .then(console.log)
  .catch(console.error);
