let store = Immutable.fromJS({
    user: Immutable.Map({
        name: 'Space Enthusiast'
    }),
    roverSelected: '',
    images: '',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
})


// add our markup to the page
const root = document.getElementById('root')
const roverNavBar = document.getElementById('roverNavBar')
const roverContainer = document.getElementById('images')

const updateStore = (store, newState) => {

    store = store.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    const rovers = state.get("rovers").toJS();
    const newApod = state.toJS();
    //console.log("state->", state.toJS());

    if (state.hasIn(["images", "roverImages"])) {
        renderRovers(state)
    } else if (state.toJS().roverSelected === '') {
        return `
            <header></header>
            <main>
                <p class="fs-1"> ${Greeting(state.get("user").get("name"))}</p>
                <section>
                    <h3>Put things on the page!</h3>
                    <p class="fs-2">Here is an example section.</p>
                    <p class="fs-3">
                        One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                        the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                        This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                        applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                        explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                        but generally help with discoverability of relevant imagery.
                    </p>
                    ${ImageOfTheDay(state.get("apod"))}
                </section>
            </main>
            <footer></footer> `
    }

}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    //render(root, store)
    getImageOfTheDay(store)
    renderRoverMenu(store.get("rovers"))
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    //If image does not already exist, or it is not from today -- request it again
    const today = new Date()

    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store)
    }

    //check if the photo of the day is actually type video!
    if (apod.get("data").get("media_type") === "video") {
        return (`
            <p>See today's featured video <a href="${apod.get("data").get("url")}">here</a></p>
            <p>${apod.get("data").get("title")}</p>
            <p>${apod.get("data").get("explanation")}</p>
        `)
    } else {
        return (`
            <div class="col-sm-4 center">
                <img class="img-responsive" id="apod" src="${apod.get("data").get("url")}" height="50%" width="50%">
            </div>
            <div class="col">
            <p class="fs-3">${apod.get("data").get("explanation")}</p>
            </div>
        `)
    }
}

function loadRover() {
    store = store.merge({roverSelected: this.innerText})
    let rover = store.get('roverSelected')
    // //getRoverInfo(rover)
    loadRoverImage(rover)

}

function loadRoverImage(rover) {
    getRoverPhotos(rover)
}

function loadHome() {
    root.style.display = "block";
    roverContainer.style.display = "none";
    let newStore = Immutable.fromJS({
        user: Immutable.Map({
            name: 'Space Enthusiast'
        }),
        roverSelected: '',
        images: '',
        apod: '',
        rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    })
    getImageOfTheDay(newStore)
}

function renderRovers(store) {

    let name = store.toJS().images.roverImages.latest_photos[0].rover.name;
    let launch_date = store.toJS().images.roverImages.latest_photos[0].rover.launch_date;
    let landing_date = store.toJS().images.roverImages.latest_photos[0].rover.landing_date;
    let status = store.toJS().images.roverImages.latest_photos[0].rover.status;
    let earth_date = store.toJS().images.roverImages.latest_photos[0].earth_date;
    let totalPhotos = store.toJS().images.roverImages.latest_photos.length;

    let roverImages = store.toJS().images.roverImages.latest_photos.map(url => url.img_src);
    let arrayLen = roverImages.length > 6? 6: roverImages.length; // only shows max of 6 photos

    root.style.display = "none";
    if(roverContainer.style.display === "none"){
        roverContainer.style.display = "block";
    }
    roverContainer.innerHTML = `<div class="container-fluid">
                    <h1 class="text-center font-weight-bold">Name: ${name}</h1>
                    <h4 class="text-center font-weight-normal">Launch date: ${launch_date}</h4>
                    <h4 class="text-center font-weight-normal">Landing date: ${landing_date}</h4>
                    <h4 class="text-center font-weight-normal">Mission status: ${status}</h4>
                    <h4 class="text-center font-weight-normal">Date of Most Recent Photos: ${earth_date}</h4>
                    <h4 class="text-center font-weight-normal">Number of Most Recent Photos: ${totalPhotos}</h4>
                    `

    for(let x = 0; x < arrayLen; x++){

        roverContainer.innerHTML += `<div class="responsive">
        <div class="gallery">
          <a target="_blank" href="${roverImages[x]}">
            <img src="${roverImages[x]}" alt="Photo number ${x} from ${name}" width="auto" height="400">
          </a>
        </div>
      </div>`;
    }

    roverContainer.innerHTML += `</div>`

}

function renderRoverMenu(rovers) {
    roverButtons = '';
    roverButtons += rovers.map(rover =>
            `<div><button type="button" class="rovers">${rover}</button></div>`)
        .join('');
    const arrayBTNs = document.getElementsByClassName('rovers')

    roverNavBar.innerHTML += `
    ` +
        roverButtons +
        `
    <div><button id="homeButton" type="button">Home</button></div>
    `

    document.getElementById('homeButton').addEventListener('click', loadHome)

    for (let i = 0; i < arrayBTNs.length; i++) {
        arrayBTNs[i].addEventListener('click', loadRover);
    }

}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (store) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, {
            apod
        }))

}

// const getRoverInfo = (rover) => {
//     fetch(`http://localhost:3000/rover-info/${rover}`)
//         .then(res => res.json())
//         .then(rover => updateStore(store, { rover }))
// }

const getRoverPhotos = (rover) => {
    fetch(`http://localhost:3000/latest-photos/${rover}`)
        .then(res => res.json())
        .then(images => updateStore(store, {
            images
        }))
}