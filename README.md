# TP-1

## Installation de Elasticsearch

**1. Installation de docker Destop**
```
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module
```

**2. Update du WSL 2**
```	
$wsl –update
```
**3. Téléchargement image elasticsearch**
```
$docker pull docker.elastic.co/elasticsearch/elasticsearch:8.7.1
```
**4. Créeation d'un nouveau réseau Docker nommé "elastic"**
```	
$docker network create elastic
```
**5. Création et démarage d'un container nommé es01**
```
$docker run --name es01 --net elastic -e discovery.type=single-node -p 9200:9200 -it docker.elastic.co/elasticsearch/elasticsearch:8.7.1
```
**6. Récupération des information des configuration**

>✅ Elasticsearch security features have been automatically configured!
>✅ Authentication is enabled and cluster connections are encrypted.

>ℹ️  Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
>_VySJT0hOp7AnrUv9XKm

>ℹ️  HTTP CA certificate SHA-256 fingerprint:
>ca8bded5754c783acb70992afdc4047f3ba3c73fb2d03d595da46e1e7e410dea

>ℹ️  Configure Kibana to use this cluster:
>• Run Kibana and click the configuration link in the terminal when Kibana starts.
>• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
>eyJ2ZXIiOiI4LjcuMSIsImFkciI6WyIxNzIuMTguMC4yOjkyMDAiXSwiZmdyIjoiY2E4YmRlZDU3NTRjNzgzYWNiNzA5OTJhZmRjNDA0N2YzYmEzYzczZmIyZDAzZDU5NWRhNDZlMWU3ZTQxMGRlYSIsImtleSI6IldDUGdRNGdCbHlrWVBKY3ltWFNMOmhIRWdtLUlPVFpPRDZkUDdndTk3amcifQ==

>ℹ️ Configure other nodes to join this cluster:
>• Copy the following enrollment token and start new Elasticsearch nodes with `bin/elasticsearch --enrollment-token ><token>` (valid for the next 30 minutes):
>eyJ2ZXIiOiI4LjcuMSIsImFkciI6WyIxNzIuMTguMC4yOjkyMDAiXSwiZmdyIjoiY2E4YmRlZDU3NTRjNzgzYWNiNzA5OTJhZmRjNDA0N2YzYmEzYzczZmIyZDAzZDU5NWRhNDZlMWU3ZTQxMGRlYSIsImtleSI6ImFLZWhSNGdCMFdSZjhOSnhUZXVOOnJRelNOckhHVHRpemFTeTJPZU5PaGcifQ==
		
>If you're running in Docker, copy the enrollment token and run:
```
docker run -e "ENROLLMENT_TOKEN=<token>" docker.elastic.co/elasticsearch/elasticsearch:8.7.1
```


**7. Copie du certificat du container**	
```
$docker cp es01:/usr/share/elasticsearch/config/certs/http_ca.crt
```

**8. Vérification que l'on peut se connecter au container**
```
$curl --cacert http_ca.crt -u elastic https://localhost:9200
	user : elastic
	mdp  : RbnHzY51ZeuD1BNa*VaG
```

## Installation de Kibana
**1. Téléchargement de l'image Kibana** 		
```	
$docker pull docker.elastic.co/kibana/kibana:8.7.1
```
**2. Création et démarage d'un nouveau container nommé kib-01**
```	
$docker run --name kib-01 --net elastic -p 5601:5601 docker.elastic.co/kibana/kibana:8.7.1
```
>Commande si la key est expiré 
```
$docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana
```

## Créer des index via une APi express
```
app.post('/index', async (req, res) => {
  try {
    const { indexName } = req.body;

    const body = {
      mappings: {
        properties: {
          _id: { type: 'keyword' },
          brand: { type: 'text' },
          Model: { type: 'text' },
          'Crystal Material': { type: 'text' },
          'Price $': { type: 'float' }
        }
      }
    };
```

## Indexer des documents
```
app.post('/index/:indexName/document', async (req, res) => {
  try {
    const { indexName } = req.params;
    const { document } = req.body;

    const { body } = await client.index({
      index: indexName,
      body: document
    });

    res.json({ message: 'Document indexé avec succès', documentId: body._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'indexation du document' });
  }
});
```

## Indexer dans documents en lots (bulk)
```
app.post('/index/:indexName/bulk', async (req, res) => {
  try {
    const { indexName } = req.params;
    const { documents } = req.body;

    const body = documents.flatMap((document) => [
      { index: { _index: indexName } },
      document
    ]);

    await client.bulk({
      body
    });

    res.json({ message: 'Indexation en lots réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'indexation en lots' });
  }
});
```

## Rechercher dans les documents
```
app.get('/index/:indexName/search', async (req, res) => {
  try {
    const { indexName } = req.params;
    const { start = 0, length = 10, value = '', sortField = '_id', sortOrder = 'asc' } = req.query;

    const { body } = await client.search({
      index: indexName,
      body: {
        from: parseInt(start),
        size: parseInt(length),
        query: {
          multi_match: {
            query: value,
            fields: ['_id', 'brand', 'Model', 'Crystal Material', 'Price $']
          }
        },
        sort: [
          {
            [sortField]: sortOrder
          }
        ]
      }
    });

    if (body.hits) {
      const totalCount = body.hits.total.value;
      const data = body.hits.hits.map((hit) => hit._source);

      res.json({
        totalCount,
        data
      });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des données : body.hits est undefined' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});
```
## Exercices sur le mapping :
### Comment Elasticsearch procède t il au mapping ?
Elasticsearch utilise le mapping pour définir comment un document doit être mappé. Par défaut, il utilise le mappage dynamique, où le moteur de recherche décide du type de données en se basant sur les données indexées. Cependant, vous pouvez définir des mappings personnalisés si vous le souhaitez, en spécifiant le type de données pour chaque champ.

### Modifier un index pour affecter un mapping explicite.
Pour modifier un index pour affecter un mapping explicite, vous pouvez utiliser l'API PUT mapping. Par exemple:
```
PUT /my_index/_mapping
{
  "properties": {
    "name": {
      "type": "text"
    },
    "age": {
      "type": "integer"
    }
  }
}
```
Dans cet exemple, nous avons défini un mapping pour les champs name et age dans l'index my_index.

### Peut-on modifier le mapping sans recréer l’index?
Non, une fois un mapping défini, il n'est pas possible de le modifier sans réindexer les données. Cela signifie que si vous souhaitez changer le mapping, vous devrez supprimer l'index, le recréer avec le nouveau mapping, puis réindexer vos données.

## Exercices sur l'analyseur :
### Tokenisation : 
> La tokenisation est le processus par lequel le texte en entrée est divisé en unités plus petites, appelées "tokens". En général, les tokens sont des mots, mais ils peuvent également être des phrases ou d'autres unités en fonction du contexte. Par exemple, dans la phrase "Le chat est sur le tapis", la tokenisation produit la liste de tokens suivante : ["Le", "chat", "est", "sur", "le", "tapis"].

### Normalisation : 
> La normalisation est le processus par lequel le texte est transformé en une forme standard avant de le traiter davantage. Il existe de nombreuses étapes possibles de normalisation, notamment la mise en minuscules (pour éviter que "Chat" et "chat" soient traités comme des mots différents), l'élimination de la ponctuation (pour que "chat." et "chat" soient considérés comme le même mot), et la lemmatisation ou la racinisation (pour que "chats" et "chat" soient traités comme le même mot).

## Les API's : 
-API RESTful (mon projet)


# TP-2 
Créé un index avec un mapping via l'api
```
app.post('/create-index', async (req, res) => {
  const { index, body } = req.body;
  const response = await client.indices.create({ index, body });
  res.json(response);
});
```
Configuration des recherches
```
app.post('/configure-search', async (req, res) => {
  const { index, type, body } = req.body;
  const response = await client.indices.putMapping({ index, type, body });
  res.json(response);
});
```
Sauvegarde des clusters Elasticsearch
Pour sauvegarder mon cluster Elasticsearch, j'ai utilisé la fonctionnalité "Snapshot and Restore". J'ai d'abord configuré un référentiel de snapshots en utilisant une requête PUT. Ensuite, j'ai créé un snapshot de mon cluster avec une autre requête PUT. Si nécessaire, je peux restaurer mon cluster à partir d'un snapshot en utilisant une requête POST.

# TP-3
J'ai fait un schéma global pour comprendre : sharding, réplica, index, alias d'index, document, nœud et cluster. J'ai également testé la Scroll API et utilisé Kibana pour créer une data view , explorer les données.

Pour tester la Scroll API, j'ai utilisé la route suivante dans mon API Express :
```
app.get('/scroll', async (req, res) => {
  const { scrollId } = req.query;
  const response = await client.scroll({ scrollId });
  res.json(response.hits.hits);
});
```

J'ai également créé un alias pour un index en utilisant la route suivante :
```
app.post('/create-alias', async (req, res) => {
  const { index, name } = req.body;
  const response = await client.indices.putAlias({ index, name });
  res.json(response);
});
```
