const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();


const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));

const store = new SQLiteStore({
    db: 'realestate.db',    
    dir: './database',      
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret', 
  resave: false, 
  saveUninitialized: false, 
  store: store,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));


function sessionLogger(req, res, next) {
  console.log('--- Session State ---');
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  console.log('---------------------');
  next();
}

app.use(sessionLogger);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.set('view engine', 'ejs');


const knex = require("./db");
app.get("/", async (req, res) => {
  try {
    const rawProperties = await knex("properties")
      .whereNotNull("cover_image_id")
      .orderBy("updated_at", "desc")
      .limit(3)
      .select("*");

    const properties = await Promise.all(
      rawProperties.map(async (property) => {
        const coverImage = await knex("images")
          .where({ id: property.cover_image_id })
          .first();
        return { ...property, coverImage };
      })
    );

    res.render("landing", { properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send("Error interno del servidor");
  }
});


app.use('/contact', require('./routes/contact'))
app.use('/images', require('./routes/images'))
app.use('/propiedades', require('./routes/properties'));
app.use('/admin', require('./routes/admin'));

// CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('Invalid CSRF token:', err);
    return res.status(403).send('Invalid CSRF token.');
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
}
