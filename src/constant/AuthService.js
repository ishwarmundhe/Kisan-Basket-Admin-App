let _logout = null;
let _setToken = null;

export const setLogout = (fn) => {
  _logout = fn;
};

export const setTokenUpdater = (fn) => {
  _setToken = fn;
};

export const callLogout = async () => {
  if (_logout) await _logout();
};

export const updateContextToken = (token) => {
  if (_setToken) _setToken(token);
};
