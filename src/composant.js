import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container } from '@material-ui/core';

function App() {
  const [index, setIndex] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [body, setBody] = useState('');
  const [scrollId, setScrollId] = useState('');
  const [alias, setAlias] = useState('');
  const [results, setResults] = useState([]);

  const handleIndex = async () => {
    try {
      const response = await axios.post(`/index`, { index, type, body });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/search?index=${index}&q=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateIndex = async () => {
    try {
      const response = await axios.post(`/create-index`, { index, body });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfigureSearch = async () => {
    try {
      const response = await axios.post(`/configure-search`, { index, type, body });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScroll = async () => {
    try {
      const response = await axios.get(`/scroll?scrollId=${scrollId}`);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAlias = async () => {
    try {
      const response = await axios.post(`/create-alias`, { index, name: alias });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <TextField label="Index" value={index} onChange={e => setIndex(e.target.value)} />
      <TextField label="Type" value={type} onChange={e => setType(e.target.value)} />
      <TextField label="Query" value={query} onChange={e => setQuery(e.target.value)} />
      <TextField label="Body" value={body} onChange={e => setBody(e.target.value)} />
      <TextField label="Scroll ID" value={scrollId} onChange={e => setScrollId(e.target.value)} />
      <TextField label="Alias" value={alias} onChange={e => setAlias(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleIndex}>Index Document</Button>
      <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
      <Button variant="contained" color="primary" onClick={handleCreateIndex}>Create Index</Button>
      <Button variant="contained" color="primary" onClick={handleConfigureSearch}>Configure Search</Button>
      <Button variant="contained" color="primary" onClick={handleScroll}>Scroll</Button>
      <Button variant="contained" color="primary" onClick={handleCreateAlias}>Create Alias</Button>
      {results.map((result, i) => (
        <div key={i}>
          <h2>{result._source.Brand} - ${result._source['Price (USD)']}</h2>
          <p>{result._source.Model}</p>
        </div>
      ))}
    </Container>
  );
}

export default App;
