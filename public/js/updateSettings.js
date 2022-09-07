/* eslint-disable */

const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/${
        type === 'data' ? 'updateMe' : 'updateMyPassword'
      }`,
      data,
    });
    if (res.data.status === 'sucess') {
      location.reload(true);
    }
  } catch (err) {
    console.log(err);
  }
};

const formEl = document.querySelector('.form-user-data');
const inputName = document.getElementById('name');
const inputEmail = document.getElementById('email');

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  updateSettings({ name: inputName.value, email: inputEmail.value }, 'data');
});

const formResetPasswordEl = document.querySelector('.form-user-settings');

formResetPasswordEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const passwordCurrent = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  await updateSettings(
    { passwordCurrent, password, passwordConfirm },
    'password'
  );

  document.getElementById('password-current').textContent = '';
  document.getElementById('password').textContent = '';
  document.getElementById('password-confirm').textContent = '';
});
