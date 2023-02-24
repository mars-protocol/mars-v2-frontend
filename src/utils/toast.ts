import { toast } from 'react-toastify'

export default function showToast(message: string, success?: boolean) {
  if (success === false) {
    toast.error(message)
  } else {
    toast.success(message)
  }

  // TODO: REFRESH THE ROUTER SOMEHOW
  //router.refresh()
}
