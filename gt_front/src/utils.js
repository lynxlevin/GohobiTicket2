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
  }
}
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
