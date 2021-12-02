const nav = document.querySelector('.nav')

const nav__button = nav.querySelector('.nav__links-button-container')
const list = nav.querySelector('.nav__links')
const body = document.body


nav__button.addEventListener('click', ()=>{
   list.classList.toggle('active')
   nav__button.classList.toggle('active')
   body.classList.toggle('lock')
})