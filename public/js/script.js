
const tagActiveClass = document.querySelectorAll('.active')
const places = document.getElementById('places')
const home = document.getElementById('home')

window.onload = () => {
    places.onclick = () => {
        places.classList.add('active')
    }
}
