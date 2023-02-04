export default {
  getDayOfWeek: (dateString) => {
    const date = new Date(dateString)
    return daysOfWeek[date.getDay()]
  },
  addIsHidden: (dom) => {
    const target = document.querySelector(dom)
    target.classList.add('is-hidden')
  },
  removeIsHidden: (dom) => {
    const target = document.querySelector(dom)
    target.classList.remove('is-hidden')
  },
  preventScroll: () => {
    document.documentElement.classList.add('is-clipped')
  },
  allowScroll: () => {
    document.documentElement.classList.remove('is-clipped')
  },
  // 呼び出し方:         // .post(url, formData, utils.getCsrfHeader())
  getCsrfHeader: () => {
    const csrfToken = getCookie('csrftoken')
    const csrfHeader = { headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken } }
    return csrfHeader
  }
}
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const getCookie = (name) => {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}
