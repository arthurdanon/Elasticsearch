process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const elasticsearch = require('elasticsearch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new elasticsearch.Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '_VySJT0hOp7AnrUv9XKm'
  }
});

// TP1: Indexation des documents
app.post('/index', async (req, res) => {
  const { index, type, body } = req.body;
  const response = await client.index({ index, type, body });
  res.json(response);
});

// TP1: Recherche dans les documents
app.get('/search', async (req, res) => {
  const { index, q } = req.query;
  const response = await client.search({ index, q });
  res.json(response.hits.hits);
});

// TP2: Création d'un index avec un mapping spécifique
app.post('/create-index', async (req, res) => {
  const { index, body } = req.body;
  const response = await client.indices.create({ index, body });
  res.json(response);
});

// TP2: Recherche
app.post('/configure-search', async (req, res) => {
  const { index, type, body } = req.body;
  const response = await client.indices.putMapping({ index, type, body });
  res.json(response);
});

// TP3: Scroll 
app.get('/scroll', async (req, res) => {
  const { scrollId } = req.query;
  const response = await client.scroll({ scrollId });
  res.json(response.hits.hits);
});

// TP3: Création d'un alias d'index
app.post('/create-alias', async (req, res) => {
  const { index, name } = req.body;
  const response = await client.indices.putAlias({ index, name });
  res.json(response);
});

app.listen(5000, () => console.log('Server running on port 5000'));
