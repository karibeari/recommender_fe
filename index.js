
let userId =1
let userUrl = `https://safe-woodland-57896.herokuapp.com/api/v1/users/${userId}`
let recommendationsUrl = 'https://safe-woodland-57896.herokuapp.com/api/v1/recommendations'
let usersUrl = 'https://safe-woodland-57896.herokuapp.com/api/v1/users'
let introPage = document.querySelector('header')
let mainPage = document.querySelector('main')
let recContainer = document.querySelector("#recommendations")
let links = document.getElementsByTagName("a")
let locationDiv = document.querySelector('#location p')
let store = {}
let locations = []
let categories = []
let coordinates = []


toggleMainPageOn ()
refreshData()

//SIGN IN
// document.querySelector('#signin').addEventListener('click', () => {
//   event.preventDefault()
//   fetch(usersUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({name: document.querySelector('#user-name').value})
//   })
//   .then(resp => resp.json())
//   .then(user => {
//     userId = user.id
//     userUrl = `https://safe-woodland-57896.herokuapp.com/api/v1/users/${userId}`
//     toggleMainPageOn()
//     refreshData()
//     document.querySelector('#user-name').value = ''
//   })
//   .catch(error => console.error(error.message))
// })

function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
     zoom: 4,
     center: {lat: 39, lng: -98}
   });
 }

//PLOT MARKERS ON MAP
function plotMarkers() {
  let map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center: {lat:39.7, lng: -105}});
  coordinates.forEach((coord) => {
    let infowindow = new google.maps.InfoWindow({content: coord.name});
    let marker = new google.maps.Marker({position: coord.latlong, map: map, animation: google.maps.Animation.DROP});
    marker.addListener('click', function() {infowindow.open(map, marker)});
  })
}

//BACK TO SIGN IN
document.querySelector('#logo').addEventListener('click', () => {
  toggleMainPageOff()
  clearRecommendations()
  clearLocationDiv()
})

//OPEN MAP
document.querySelector('#map-btn .button').addEventListener('click', () => {
  toggleMapModalOn()
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
  .then(refreshData)
  .catch(error => console.error(error.message))
})

//UPDATE
document.querySelector('#save-edit').addEventListener('click', function(event) {
  event.preventDefault()
  let editForm = document.querySelector('#rec-edit-form')
  const formData = new FormData(editForm)
  let id = formData.get("id")
  toggleEditModalOff()

  const body ={
    id: id,
    location: formData.get("location"),
    category: formData.get("category"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    url: formData.get("url"),
    image: formData.get("image"),
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
document.querySelector('#search-by-name').addEventListener('input', event => {
    filterTerm = event.target.value
    let filteredResults = store.recommendations.filter( recommendation =>  {
      return recommendation.name.toLowerCase().includes(filterTerm.toLowerCase())
    })
    clearRecommendations()
    renderRecommendations(filteredResults)
})

//DELETE REC AND EDIT MODAL
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
      toggleEditModalOn()
      renderEditRecommendation(recMatch)
  }
  else if (event.target.matches('img')){
    toggleRecModalOn()
    renderRecommendationModal(recMatch)
  }
})

//CLOSE MODALS
document.querySelector('#edit-delete').addEventListener('click', toggleEditModalOff)
document.querySelector('#rec-delete').addEventListener('click', toggleRecModalOff)
document.querySelector('#map-delete').addEventListener('click', toggleMapModalOff)

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
    // plotMarkers()
    return user
  })
  .catch(error => console.error(error.message))
}

function refreshData() {
  getUserData().then(() => {
    renderRecommendations(store.recommendations)
    renderLocationBtns(locations)
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
          <input class="input" type="text" name="image" value="${rec.image}" placeholder="image url">
      </div>
      <div class="field">
        <div class="control">
          <textarea class="textarea" name="notes" placeholder="Add notes about this recommendation">${rec.notes}</textarea>
        </div>
      </div>
    </form>`
}


//****refactor into 1 toggleon and 1 toggleoff
function toggleRecModalOn () {
  document.querySelector('#rec-modal').classList.add("is-active")
}

function toggleRecModalOff () {
  document.querySelector('#rec-modal').classList.remove("is-active")
}

function toggleEditModalOn () {
  document.querySelector('#editmodal').classList.add("is-active")
}

function toggleEditModalOff () {
  document.querySelector('#editmodal').classList.remove("is-active")
}

function toggleMapModalOn () {
  document.querySelector('#map-modal').classList.add("is-active")
}

function toggleMapModalOff () {
  document.querySelector('#map-modal').classList.remove("is-active")
}

function toggleMainPageOn () {
  introPage.classList.add('hide')
  mainPage.classList.remove('hide')
}

function toggleMainPageOff () {
  introPage.classList.remove('hide')
  mainPage.classList.add('hide')
  // document.querySelector('#search-by-name').classList.add('hide')
}
