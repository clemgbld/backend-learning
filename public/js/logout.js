/* eslint-disable */

const hideAlert2 = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert2 = (type, msg) => {
  hideAlert2();
  const markup = `<div class="alert alert--${type}>${msg}</div>"`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert2, 5000);
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'sucess') {
      location.reload(true);
    }
  } catch (err) {
    console.log(err);
    showAlert2('error', err.response.data.message);
  }
};

const logoutBtnEl = document.querySelector('.nav__el--logout');

if (logoutBtnEl) {
  logoutBtnEl.addEventListener('click', () => logout());
}
