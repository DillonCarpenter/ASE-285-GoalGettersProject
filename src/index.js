import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import { getDB } from './util/db.js';
import path from 'path'
import { fileURLToPath } from 'url'

// routes
import { createApiRouter } from './routes/api.js';
import { createRouter } from './routes/router.js';

const db = await getDB();

const app = express();

// recreate __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use('/public', express.static('public'));

// added styles folder to serve static CSS files
app.use('/styles', express.static(path.join(__dirname, 'views/styles')));

app.use(methodOverride('_method'))

// static files: We might need this
//app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', createApiRouter(db));
app.use('/', createRouter(db));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.listen(5500, function () {
  console.log('listening on 5500')
});
