const login = (email, password) => {
  alert(`Email: ${email}\nPassword: ${password}`);
};

document.querySelector('.form').addEventListener('submit', (e) => {
  //   console.log('hello');
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
