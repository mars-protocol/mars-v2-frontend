import { LocalStorageKeys } from 'constants/localStorageKeys'

export default function checkPythUpdateEnabled() {
  return localStorage.getItem(LocalStorageKeys.UPDATE_ORACLE) === 'true'
}
