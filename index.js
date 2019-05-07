let userId = 1
let userUrl = `http://localhost:3000/api/v1/users/${userId}`
let recommendationsUrl = 'http://localhost:3000/api/v1/recommendations'
let store = {}
let recContainer = document.querySelector("#recommendations")
let links = document.getElementsByTagName("a")
let locations = []
let categories = []

renderRecommendations()
renderLocationTabs()

const recForm = document.querySelector('#rec-form')
recForm.addEventListener('submit', function(event) {
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
  .then(renderRecommendations)
  .catch(error => console.error(error.message))
})

const saveEditBtn = document.querySelector('.is-success')
saveEditBtn.addEventListener('click', function(event) {
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
  .then(renderRecommendations)
  .catch(error => console.error(error.message))
})

recContainer.addEventListener('click', function(event) {
  let id = event.target.id

  if (event.target.matches('.delete-rec')) {
    fetch(`http://localhost:3000/api/v1/recommendations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id})
    })
      .then(resp => resp.json())
      .then(renderRecommendations)
      .catch(error => console.error(error.message))
  } else if (event.target.matches('.edit-rec')) {
      toggleModalOn()
      let recMatch = store.recommendations.find(rec => {
        return rec.id === parseInt(id)
      })
      renderEditRecommendation(recMatch)
  }
})

document.querySelector('.delete').addEventListener('click', toggleModalOff)


function getUserData() {
  clearRecommendations()
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

function clearRecommendations() {
  while (recContainer.firstChild) {
    recContainer.removeChild(recContainer.firstChild)
  }
}

async function renderRecommendations() {
  const user = await getUserData()
  user.recommendations.forEach(renderRecommendation)
}

function renderRecommendation(recommendation) {
  recContainer.innerHTML += `
    <div class="column is-one-quarter">
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

async function renderLocationTabs(){
  const user = await getUserData()
  locations.forEach(renderLocationTab)
}

function renderLocationTab(location) {
  let ul = document.querySelector('#location-tabs')
  ul.innerHTML +=
  `<li class="is-active">
    <a id=${location}>
      <span class="icon is-small"><i class="fas fa-image" aria-hidden="true"></i></span>
      <span>${location}</span>
    </a>
  </li>`
}

function renderEditRecommendation(rec) {
  editTitle = document.querySelector(".modal-card-title")
  editTitle.innerHTML = rec.name
  editForm = document.querySelector('#rec-edit-form')
  editForm.innerHTML =`<input type="text" name="location" id="location" value="${rec.location}"> <br>
    <input type="hidden" name="id" id="id" value=${rec.id}>
    <input type="text" name="category" id="category" value="${rec.category}"> <br>
    <input type="text" name="name" id="name" value="${rec.name}"> <br>
    <input type="text" name="recommended_by" id="recommended_by" value="${rec.recommended_by}"> <br>
    <input type="text" name="url" id="website" value="${rec.url}"> <br>
    <input type="text" name="image" id="image" value="${rec.image}"> <br>
    <textarea name="notes" id="notes" cols="30" rows="10" >${rec.notes}</textarea> <br>`
}

function toggleModalOff () {
  document.querySelector('.modal').classList.remove("is-active")
}

function toggleModalOn () {
  document.querySelector('.modal').classList.add("is-active")
}
