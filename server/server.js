

// ⭐️ IMPORTS ⭐️ //
import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';


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
      title: 'home'
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading homepage');
  }
});


// ⭐ About me page
app.get('/about-me', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/about-me.liquid', {
      title: 'about me',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('about me page kon niet laden');
  }
});

// ⭐ my work page
app.get('/my-work', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/my-work.liquid', {
      title: 'my work',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('my work page kon niet laden');
  }
});

// ⭐ Contact page
app.get('/contact', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/contact.liquid', {
      title: 'contact',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('contact page kon niet laden');
  }
});

app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/assets', sirv('assets'))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
  // .listen(PORT, () => console.log(`Listening on ${PORT}`));
