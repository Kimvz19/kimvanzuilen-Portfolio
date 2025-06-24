

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
    res.send(renderTemplate('server/views/projects/weekly-nerd.liquid', {
      title: 'weekly-nerd',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load weekly-nerd');
  }
});


// Weekly nerds routes
const speakerRoute = (path, file, title) => {
  app.get(path, async (req, res) => {
    try {
      res.send(renderTemplate(`server/views/weeklynerds/${file}.liquid`, {
        title: title
      }, req));

    } catch (err) {
      console.error(err);
      res.status(500).send(`${title} kon niet laden`);
    }
  });
};

// Routes voor alle sprekers
speakerRoute('/speaker-kilian', 'speaker-kilian', 'Kilian');
speakerRoute('/speaker-peter-paul-koch', 'speaker-peter-paul-koch', 'Peter Paul Koch');
speakerRoute('/speaker-nils', 'speaker-nils', 'Nils Binder');
speakerRoute('/speaker-nienke', 'speaker-nienke', 'Nienke de Keijzer');
speakerRoute('/speaker-roel', 'speaker-roel', 'Roel Nieskens');
speakerRoute('/speaker-cassie', 'speaker-cassie', 'Cassie Evans');
speakerRoute('/speaker-krijn', 'speaker-krijn', 'Krijn');
speakerRoute('/speaker-jeremy', 'speaker-jeremy', 'Jeremy Keith');
speakerRoute('/speaker-julia', 'speaker-julia', 'Julia Miocene');
speakerRoute('/speaker-declan', 'speaker-declan', 'Declan');
speakerRoute('/speaker-cyd', 'speaker-cyd', 'Cyd');
speakerRoute('/speaker-rosa', 'speaker-rosa', 'Rosa');
speakerRoute('/speaker-niels', 'speaker-niels', 'Niels Leenheer');
speakerRoute('/speaker-iq', 'speaker-iq', 'Io Digital');
speakerRoute('/speaker-q42', 'speaker-q42', 'Q42');
speakerRoute('/speaker-marieke', 'speaker-marieke', 'Marieke');
speakerRoute('/speaker-miriam', 'speaker-miriam', 'Miriam');


// projects 
app.get('/light-pollution', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projects/light-pollution', {
      title: 'Light Pollution',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load project light pollution');
  }
});

// projects 
app.get('/information-design', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projects/information-design', {
      title: 'Information design',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load project information design');
  }
});

// projects 
app.get('/emerging-technologies', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projects/emerging-technologies', {
      title: 'Emerging technologies',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load project emerging technologies');
  }
});

// projects 
app.get('/society-and-interaction', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projects/society-and-interaction', {
      title: 'Society and interaction',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load project society and interaction');
  }
});

// projects 
app.get('/responsable-sneakers', async (req, res) => {
  try {
    res.send(renderTemplate('server/views/projects/responsable-sneakers', {
      title: 'Responsable sneakers',
    }, req));
  } catch (err) {
    console.error(err);
    res.status(500).send('unable to load project Responsable sneakers');
  }
});


app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .use('/assets', sirv('assets'))
  .use('/assets', sirv(path.resolve(__dirname, '../assets')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
  // .listen(PORT, () => console.log(`Listening on ${PORT}`));
