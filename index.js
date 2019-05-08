
let userId =1


let userUrl = `https://glacial-island-58078.herokuapp.com/api/v1/users/${userId}`
let recommendationsUrl = 'https://glacial-island-58078.herokuapp.com/api/v1/recommendations'
let usersUrl = 'https://glacial-island-58078.herokuapp.com/api/v1/users'
let introPage = document.querySelector('header')
let mainPage = document.querySelector('main')
let recContainer = document.querySelector("#recommendations")
let links = document.getElementsByTagName("a")
let locationTabs = document.querySelector('#location-tabs')
let store = {}
let locations = []
let categories = []


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
//     userUrl = `https://glacial-island-58078.herokuapp.com/api/v1/users/${userId}`
//     toggleMainPageOn()
//     refreshData()
//     document.querySelector('#user-name').value = ''
//   })
//   .catch(error => console.error(error.message))
// })

//BACK TO SIGN IN
document.querySelector('#logo').addEventListener('click', () => {
  toggleMainPageOff()
  clearRecommendations()
  clearLocationTabs()
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
  toggleModalOff()

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

  fetch(`http://localhost:3000/api/v1/recommendations/${id}`, {
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
    console.log(filteredResults);
    clearRecommendations()
    renderRecommendations(filteredResults)
})

//DELETE
recContainer.addEventListener('click', function(event) {
  let id = event.target.id

  if (event.target.matches('.delete-rec')) {
    fetch(`https://glacial-island-58078.herokuapp.com/api/v1/recommendations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id})
    })
      .then(resp => resp.json())
      .then(refreshData)
      .catch(error => console.error(error.message))
  } else if (event.target.matches('.edit-rec')) {
      toggleModalOn()
      let recMatch = store.recommendations.find(rec => {
        return rec.id === parseInt(id)
      })
      renderEditRecommendation(recMatch)
  }
})

//CLOSE MODALS
document.querySelector('.delete').addEventListener('click', toggleModalOff)

//FILTER BY LOCATION
document.querySelector('#location-tabs').addEventListener('click', () => {
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
  clearLocationTabs()
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
    return user
  })
  .catch(error => console.error(error.message))
}

function refreshData() {
  getUserData().then(() => {
    renderRecommendations(store.recommendations)
    renderLocationTabs(locations)
  })
}

function clearRecommendations() {
  while (recContainer.firstChild) {
    recContainer.removeChild(recContainer.firstChild)
  }
}

function clearLocationTabs() {
  while (locationTabs.firstChild) {
    locationTabs.removeChild(locationTabs.firstChild)
  }
}

function renderRecommendations(recommendations) {
  recommendations.forEach(renderRecommendation)
}

function renderRecommendation(recommendation) {
  recContainer.innerHTML += `
    <div class="column is-3">
      <article class="tile is-child box has-background-primary">
        <p class="subtitle is-8 ">${recommendation.location}</p>
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${recommendation.image}" onerror="this.src='https://phadvocates.org/wp-content/themes/cardinal/images/default-thumb.png'">
          </figure>
        </div>
        <p class="title">${recommendation.name}</p>
        <p class="subtitle">${recommendation.category}</p>
        <p class="subtitle is-6">${recommendation.notes}</p>
        <p class="subtitle is-6">Recommended by: ${recommendation.recommended_by}</p>
        <a target="_blank" href="${recommendation.url}">Go!</a>
        <button class="button edit-rec" id="${recommendation.id}">Edit</button>
        <button class="button delete-rec" id="${recommendation.id}">Delete</button>
      </article>
    </div>`
}

function renderLocationTabs(locations) {
  locationTabs.innerHTML +=
  `<li class="tab">
    <a>
      <span class="icon is-small"><i class="fas fa-compass" aria-hidden="true"></i></span>
      <span class="has-text-light">All Locations</span>
    </a>
  </li>`
  locations.forEach(renderLocationTab)
}

function renderLocationTab(location) {
  locationTabs.innerHTML +=
  `<li class="tab">
    <a>
      <span class="icon is-small"><i class="fas fa-compass" aria-hidden="true"></i></span>
      <span class="has-text-light">${location}</span>
    </a>
  </li>`
}

function renderEditRecommendation(rec) {
  editTitle = document.querySelector(".modal-card-title")
  editTitle.innerHTML = rec.name
  editForm = document.querySelector('#rec-edit-form')
  editForm.innerHTML =`<input type="text" name="location" id="location" value="${rec.location}"> <br>
    <input type="hidden" name="id" value=${rec.id}>
    <input class="input is-small" type="text" name="category" value="${rec.category}"> <br>
    <input class="input is-small" type="text" name="name" value="${rec.name}"> <br>
    <input class="input is-small" type="text" name="recommended_by" value="${rec.recommended_by}"> <br>
    <input class="input is-small" type="text" name="url" value="${rec.url}"> <br>
    <input class="input is-small" type="text" name="image" value="${rec.image}"> <br>
    <textarea name="notes" cols="30" rows="10" >${rec.notes}</textarea> <br>`
}

function toggleModalOff () {
  document.querySelector('.modal').classList.remove("is-active")
}

function toggleModalOn () {
  document.querySelector('.modal').classList.add("is-active")
}

function toggleMainPageOn () {
  introPage.classList.add('hide')
  mainPage.classList.remove('hide')
}
function toggleMainPageOff () {
  introPage.classList.remove('hide')
  mainPage.classList.add('hide')
}
