

// ⭐️ IMPORTS ⭐️ //
import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

// Imports for data opslaan & vewerken
import bodyParser from 'body-parser';
import { LocalStorage } from 'node-localstorage';

// ⭐️ LIQUID SETUP ⭐️ //
const engine = new Liquid({ extname: '.liquid' });
const app = new App();

//mapje wordt aangemaakt in de root van het project
// hierin wordt de favoriten data opgeslagen
const localStorage = new LocalStorage('./scratch');

//  verwerkt post requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// ⭐️ variables ⭐️//
// uit .env bestand
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const baseUrl = process.env.BASE_URL;
const geoApiKey = process.env.GEODB_API_KEY;


// ⭐️ LIQUID TEMPLATE RENDERING ⭐️ //
const renderTemplate = (template, data) => {
  // favorites ophalen uit localStorage
  const favoritesFromStorage = JSON.parse(localStorage.getItem('favorites') || '[]')
    .map(id => String(id));

  // renderdata samenstellen
  return engine.renderFileSync(template, {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
    favorites: favoritesFromStorage
  });
};



// ⭐️ HOME PAGE ⭐️ //
app.get('/', async (req, res) => {
  try {
    // Pagina ophalen uit de query, standaard is 1
    const page = req.query.page || 1;

    // 🐶 OAuth2-authenticatie petfinder api 🐶
    const tokenResponse = await fetch('https://api.petfinder.com/v2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Dieren ophalen, 35 per pagina
    const petfinderResponse = await fetch(`${baseUrl}animals?page=${page}&limit=38`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const petfinderData = await petfinderResponse.json();

    // Filter dieren met geen foto
    const filteredAnimals = petfinderData.animals.filter(animal => {
      return animal.primary_photo_cropped || (animal.photos && animal.photos.length > 0);
    });

    // nieuwe data met gefilterde dieren
    const filteredPetfinderData = {
      ...petfinderData,
      animals: filteredAnimals
    };

    // rederen naar index.liquid
    res.send(renderTemplate('server/views/index.liquid', {
      title: 'Newhome',
      petfinderData: filteredPetfinderData,
      currentPage: Number(page)
    }));

    //fout melding 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading homepage');
  }
});


// 🐶 DETAIL PAGE 🐶//
app.get('/detail/:id', async (req, res) => {
  try {
    // 🐶 OAuth2-authenticatie petfinder api 🐶
    const tokenResponse = await fetch('https://api.petfinder.com/v2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const response = await fetch(`${baseUrl}animals/${req.params.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    //  ⭐️ variabelen  ⭐️ //
    const data = await response.json();
    const animalID = data.animal;

    let cityInfo = null;
    let regionInfo = null;

    // Gegevens ophalen van de GeoDB API
    const city = animalID.contact.address.city;
    const country = animalID.contact.address.country;

    if (city && country) {
      try {
        const geoResponse = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${city}&countryIds=${country}&limit=1`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': geoApiKey,
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
          }
        });

        // als gegevens beschikbaar zijn, deze ophalen
        const geoData = await geoResponse.json();
        cityInfo = geoData.data[0] || null;

        if (cityInfo?.regionCode) {
          const regionResponse = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/adminDivisions/${cityInfo.regionCode}`, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': geoApiKey,
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
          });

          const regionData = await regionResponse.json();
          regionInfo = regionData.data;
        }

        //fout melding 
      } catch (err) {
        console.error('GeoDB API error:', err);
      }
    }

     // data + geo gegevens renderen
    res.send(renderTemplate('server/views/detail.liquid', {
      title: animalID.name || 'Dier detail',
      animalID,
      cityInfo,
      regionInfo
    }));

    //fout melding 
  } catch (err) {
    console.error(err);
    res.status(500).send('Detailpagina kon niet laden');
  }
});


// ⭐ Favorite POST ⭐ //
app.post('/favorite', (req, res) => {
  // controleer of er een animalId is meegegeven,
  // anders error melding
  const animalId = req.body.animalId;
  if (!animalId) return res.status(400).send('Geen dier ID');

  // key met json array van dier id's
  // default state is leeg
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  // toevoegen of verwijderen
  if (favorites.includes(animalId)) {
    favorites = favorites.filter(id => id !== animalId);

  } else {
    favorites.push(animalId);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  res.redirect(req.headers.referer || '/');
});




// ⭐ FAVORIETEN OVERZICHT
app.get('/favorites', async (req, res) => {
  const favoritesFromStorage = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (favoritesFromStorage.length === 0) {
    return res.send(renderTemplate('server/views/favorites.liquid', {
      title: 'Favorieten',
      animals: []
    }));
  }

  const tokenResponse = await fetch('https://api.petfinder.com/v2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret
    })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const requests = favoritesFromStorage.map(id =>
    fetch(`${baseUrl}animals/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => res.json())
  );

  const results = await Promise.all(requests);
  const animals = results.map(r => r.animal).filter(Boolean);

  res.send(renderTemplate('server/views/favorites.liquid', {
    title: 'Mijn Favorieten',
    animals
  }));
});

// const PORT = process.env.PORT || 3000;
// // 🔊 SERVER START

app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/assets', sirv('assets'))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
  // .listen(PORT, () => console.log(`Listening on ${PORT}`));
