
let userId
let userUrl = `https://mendo-be.herokuapp.com/api/v1/users/${userId}`
let recommendationsUrl = 'https://mendo-be.herokuapp.com/api/v1/recommendations'
let usersUrl = 'https://mendo-be.herokuapp.com/api/v1/users'
let introPage = document.querySelector('header')
let mainPage = document.querySelector('main')
let recContainer = document.querySelector("#recommendations")
let links = document.getElementsByTagName("a")
let locationDiv = document.querySelector('#location p')
let dropdown = document.querySelector('.dropdown')
let dropdownContent = document.querySelector('.dropdown-content')
let navbarItems = document.querySelectorAll('.navbar-item')
let store = {}
let locations = []
let categories = []
let coordinates = []

// SIGN IN
document.querySelector('#signin').addEventListener('click', () => {
  event.preventDefault()
  fetch(usersUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: document.querySelector('#user-name').value})
  })
  .then(resp => resp.json())
  .then(user => {
    userId = user.id
    userUrl = `https://safe-woodland-57896.herokuapp.com/api/v1/users/${userId}`
    toggleMainPage()
    refreshData()
    document.querySelector('#user-name').value = ''
  })
  .catch(error => console.error(error.message))
})

//BACK TO SIGN IN
document.querySelector('#logo').addEventListener('click', () => {
  toggleMainPage()
  clearRecommendations()
  clearLocationDiv()
})

//OPEN MAP
document.querySelector('#map-btn .button').addEventListener('click', () => {
  toggleMapModal()
  plotMarkers()
})

//CREATE
document.querySelector('#rec-form').addEventListener('submit', function(event) {
  event.preventDefault()
  const formData = new FormData(event.target)
  const body ={
    location: formData.get("location"),
    category: formData.get("category"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    url: formData.get("url"),
    image: formData.get("image"),
    recommended_by: formData.get("recommended_by"),
    user_id: userId
  }

  fetch(recommendationsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(resp => resp.json())
  .then(() => {
    refreshData()
    document.querySelector('#rec-form').reset()
  })
  .catch(error => console.error(error.message))
})

//UPDATE
document.querySelector('#save-edit').addEventListener('click', function(event) {
  event.preventDefault()
  let editForm = document.querySelector('#rec-edit-form')
  const formData = new FormData(editForm)
  let id = formData.get("id")
  toggleEditModal()

  let lat = formData.get("latitude")
  let long = formData.get("longitude")
  console.log(lat, long);

  const body ={
    id: id,
    location: formData.get("location"),
    category: formData.get("category"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    url: formData.get("url"),
    image: formData.get("image"),
    latitude: lat,
    longitude: long,
    recommended_by: formData.get("recommended_by"),
    user_id: userId
  }

  fetch(`https://safe-woodland-57896.herokuapp.com/api/v1/recommendations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(resp => resp.json())
  .then(refreshData)
  .catch(error => console.error(error.message))
})

//SEARCH BY NAME
//****hide search on sign on
document.querySelector('#search-by-name').addEventListener('input', event => {
    filterTerm = event.target.value
    let filteredResults = store.recommendations.filter( recommendation =>  {
      return recommendation.name.toLowerCase().includes(filterTerm.toLowerCase())
    })
    clearRecommendations()
    renderRecommendations(filteredResults)
})

//DELETE REC AND EDIT MODAL
//****alert before deleting
recContainer.addEventListener('click', function(event) {
  let id = event.target.id
  let recMatch = store.recommendations.find(rec => {
    return rec.id === parseInt(id)
  })
  if (event.target.matches('.delete-rec')) {
    fetch(`https://safe-woodland-57896.herokuapp.com/api/v1/recommendations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id})
    })
      .then(resp => resp.json())
      .then(refreshData)
      .catch(error => console.error(error.message))
  }
  else if (event.target.matches('.edit-rec')) {
      toggleEditModal()
      renderEditRecommendation(recMatch)
  }
  else if (event.target.matches('img')){
    toggleRecModal()
    renderRecommendationModal(recMatch)
  }
})

//TOGGLE DROPDOWN
//****filter dropdown categories by location
//****hide dropdown on sign on
dropdown.addEventListener('click', toggleDropDown)
document.querySelector('.dropdown-content').addEventListener('click', event => {
    let filteredResults = store.recommendations.filter((rec) => { return rec.category === event.target.innerText })
    clearRecommendations()
    renderRecommendations(filteredResults)
})

//CLOSE MODALS
document.querySelector('#edit-delete').addEventListener('click', toggleEditModal)
document.querySelector('#rec-delete').addEventListener('click', toggleRecModal)
document.querySelector('#map-delete').addEventListener('click', toggleMapModal)

//FILTER BY LOCATION
locationDiv.addEventListener('click', () => {
  const tab = event.target.innerText
  if (tab === 'All Locations') {
    clearRecommendations()
    renderRecommendations(store.recommendations)
  } else {
    let filteredResults = store.recommendations.filter((rec) => { return rec.location === event.target.innerText })
    clearRecommendations()
    renderRecommendations(filteredResults)
  }
})

function getUserData() {
  clearRecommendations()
  clearLocationDiv()
  clearDropDown()
  locations = []
  categories = []
  coordinates = []
  return fetch(userUrl)
  .then(resp => resp.json())
  .then(user => {
    store = user
    store.recommendations.forEach(rec => {
      if (!locations.includes(rec.location)) {
        locations.push(rec.location)
      }
    })
    store.recommendations.forEach(rec => {
      if (!categories.includes(rec.category)) {
        categories.push(rec.category)
      }
    })
    store.recommendations.forEach(rec => {
      coordinates.push({
        name: rec.name,
        latlong: {
          lat: Number(rec.latitude),
          lng: Number(rec.longitude)
        }
      })
    })
    return user
  })
  .catch(error => console.error(error.message))
}

function refreshData() {
  getUserData().then(() => {
    renderRecommendations(store.recommendations)
    renderLocationBtns(locations)
    renderDropDownMenu(categories)
  })
}

function clearRecommendations() {
  while (recContainer.firstChild) {
    recContainer.removeChild(recContainer.firstChild)
  }
}

function clearLocationDiv() {
  while (locationDiv.firstChild) {
    locationDiv.removeChild(locationDiv.firstChild)
  }
}

function clearDropDown() {
  while (dropdownContent.firstChild) {
    dropdownContent.removeChild(dropdownContent.firstChild)
  }
}

function renderRecommendations(recommendations) {
  recommendations.forEach(renderRecommendation)
}

function renderRecommendation(recommendation) {
  recContainer.innerHTML += `
    <div class="column is-3 hvr-grow" id="${recommendation.id}">
      <article class="tile is-child box has-background-primary" >
        <p class="subtitle is-8 ">${recommendation.location}</p>
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${recommendation.image}" onerror="this.src='https://phadvocates.org/wp-content/themes/cardinal/images/default-thumb.png'" id="${recommendation.id}" >
          </figure>
        </div>
        <p class="title">${recommendation.name}</p>
        <p class="subtitle">${recommendation.category}</p>
          <button class="button edit-rec hvr-glow" id="${recommendation.id}">Edit</button>
          <button class="button delete-rec hvr-glow" id="${recommendation.id}">Delete</button>
      </article>
    </div>`
}

function renderRecommendationModal(recommendation) {
  document.querySelector('#rec-modal .modal-card-body').innerHTML = `
      <article class=" has-background-light">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${recommendation.image}" onerror="this.src='https://phadvocates.org/wp-content/themes/cardinal/images/default-thumb.png'">
          </figure>
        </div>
        <p class="subtitle ">${recommendation.notes}</p>
        <p class="subtitle">Recommended by: ${recommendation.recommended_by}</p>
      </article>
    `
    document.querySelector('#rec-modal .modal-card-foot').innerHTML = `<a target="_blank" class="button hvr-glow is-primary" href="${recommendation.url}">Visit Website</a>`

    document.querySelector('#rec-modal p').innerHTML = recommendation.name
}

function renderDropDownMenu(categories) {
  categories.forEach(renderDropDownMenuItem)
}

function renderDropDownMenuItem(category) {
  dropdownContent.innerHTML +=
  `<a class="dropdown-item">
    ${category}
  </a>`
}

function renderLocationBtns(locations) {
  locationDiv.innerHTML +=
  `<a class="button is-primary is-rounded hvr-grow" >
      <span class="icon is-small"><i class="fas fa-compass"></i></span>
      <span class="has-text-light">All Locations</span>
  </a>`
  locations.forEach(renderLocationBtn)
}

function renderLocationBtn(location) {
  locationDiv.innerHTML +=
  `<a class="button is-primary is-rounded hvr-grow" >
      <span class="icon is-small"><i class="fas fa-compass"></i></span>
      <span class="has-text-light">${location}</span>
  </a>`
}

function renderEditRecommendation(rec) {
  editTitle = document.querySelector(".modal-card-title")
  editTitle.innerHTML = rec.name
  editForm = document.querySelector('#rec-edit-form')
  editForm.innerHTML =`
    <form id="rec-edit-form">
      <input type="hidden" name="id" value=${rec.id}>
      <div class="field">
        <input class="input" type="text" name="location" value="${rec.location}" placeholder="location">
      </div>
      <div class="field">
        <input class="input" type="text" name="category" value="${rec.category}" placeholder="category">
      </div>
      <div class="field">
        <input class="input" type="text" name="name" value="${rec.name}" placeholder="name">
      </div>
      <div class="field">
        <input class="input" type="text" name="recommended_by" value="${rec.recommended_by}" placeholder="recommended by">
      </div>
      <div class="field">
        <input class="input" type="text" name="url" value="${rec.url}" placeholder="website address">
      </div>
      <div class="field">
        <input class="input" type="number" name="latitude" value=${rec.latitude} placeholder="latitude">
      </div>
      <div class="field">
        <input class="input" type="number" name="longitude" value=${rec.longitude} placeholder="longitude">
      </div>
      <div class="field">
          <input class="input" type="text" name="image" value="${rec.image}" placeholder="image url">
      </div>
      <div class="field">
        <div class="control">
          <textarea class="textarea" name="notes" placeholder="Add notes about this recommendation">${rec.notes}</textarea>
        </div>
      </div>
    </form>`
}

function toggleRecModal () {
  document.querySelector('#rec-modal').classList.toggle("is-active")
}

function toggleEditModal () {
  document.querySelector('#editmodal').classList.toggle("is-active")
}

function toggleMapModal () {
  document.querySelector('#map-modal').classList.toggle("is-active")
}

function toggleMainPage () {
  introPage.classList.toggle('hide')
  mainPage.classList.toggle('hide')
  navbarItems.forEach(item => item.classList.toggle('hide'))
}

function toggleDropDown () {
  dropdown.classList.toggle('is-active')
}

function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
     zoom: 4,
     center: {lat: 39, lng: -98}
   });
 }

function plotMarkers() {
  let map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center: {lat:39.7, lng: -105}});
  coordinates.forEach((coord) => {
    let infowindow = new google.maps.InfoWindow({content: coord.name});
    let marker = new google.maps.Marker({position: coord.latlong, map: map, animation: google.maps.Animation.DROP});
    marker.addListener('click', function() {infowindow.open(map, marker)});
    console.log(coord)
  })
}
