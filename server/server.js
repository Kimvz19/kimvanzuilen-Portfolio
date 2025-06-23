

// ⭐️ IMPORTS ⭐️ //
import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ⭐️ LIQUID SETUP ⭐️ //
const engine = new Liquid({ extname: '.liquid' });
const app = new App();

// ⭐️ Middleware om path door te geven aan templates
app.use((req, _, next) => {
  req.templateData = {
    path: req.path
  };
  next();
});

// ⭐️ LIQUID TEMPLATE RENDERING ⭐️ //
const renderTemplate = (template, data = {}, req = {}) => {
  return engine.renderFileSync(template, {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...req.templateData,
    ...data
  });
};

// ⭐ ROUTES ⭐ //
// ⭐ Home page
app.get('/', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/index.liquid', {
      title: 'Home'
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load home page');
  }
});


// ⭐ About me page
app.get('/about-me', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/about-me.liquid', {
      title: 'About me',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load about me page');
  }
});

// ⭐ my work page
app.get('/project-overview', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/project-overview.liquid', {
      title: 'project overview',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load projects overview');
  }
});

// ⭐ Contact page
app.get('/experiences', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/experiences.liquid', {
      title: 'Experiences',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load experiences');
  }
});

// projects 
app.get('/weekly-nerd', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projcets/weekly-nerd.liquid', {
      title: 'weekly-nerd',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load weekly-nerd');
  }
});



app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/assets', sirv('assets'))
  .use('/assets', sirv(path.resolve(__dirname, '../assets')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
  // .listen(PORT, () => console.log(`Listening on ${PORT}`));
