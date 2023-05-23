I. Installation de Elasticsearch
	1. Installation de docker Destop
		- Fichier d'installation https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module
2. Update du WSL 2
	$wsl –update

3. Téléchargement image elasticsearch
	$docker pull docker.elastic.co/elasticsearch/elasticsearch:8.7.1

4. Créeation d'un nouveau réseau Docker nommé "elastic" 
	$docker network create elastic

5. Création et démarage d'un container nommé es01
	$docker run --name es01 --net elastic -e discovery.type=single-node -p 9200:9200 -it docker.elastic.co/elasticsearch/elasticsearch:8.7.1

	a) Récupération des information des configuration 

	✅ Elasticsearch security features have been automatically configured!
	✅ Authentication is enabled and cluster connections are encrypted.

	ℹ️  Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
	  RbnHzY51ZeuD1BNa*VaG

	ℹ️  HTTP CA certificate SHA-256 fingerprint:
	  ca8bded5754c783acb70992afdc4047f3ba3c73fb2d03d595da46e1e7e410dea

	ℹ️  Configure Kibana to use this cluster:
	• Run Kibana and click the configuration link in the terminal when Kibana starts.
	• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
	eyJ2ZXIiOiI4LjcuMSIsImFkciI6WyIxNzIuMTguMC4yOjkyMDAiXSwiZmdyIjoiY2E4YmRlZDU3NTRjNzgzYWNiNzA5OTJhZmRjNDA0N2YzYmEzYzczZmIyZDAzZDU5NWRhNDZlMWU3ZTQxMGRlYSIsImtleSI6IldDUGdRNGdCbHlrWVBKY3ltWFNMOmhIRWdtLUlPVFpPRDZkUDdndTk3amcifQ==

	ℹ️ Configure other nodes to join this cluster:
	• Copy the following enrollment token and start new Elasticsearch nodes with `bin/elasticsearch --enrollment-token <token>` (valid for the next 30 minutes):
		eyJ2ZXIiOiI4LjcuMSIsImFkciI6WyIxNzIuMTguMC4yOjkyMDAiXSwiZmdyIjoiY2E4YmRlZDU3NTRjNzgzYWNiNzA5OTJhZmRjNDA0N2YzYmEzYzczZmIyZDAzZDU5NWRhNDZlMWU3ZTQxMGRlYSIsImtleSI6ImFLZWhSNGdCMFdSZjhOSnhUZXVOOnJRelNOckhHVHRpemFTeTJPZU5PaGcifQ==
		
	  If you're running in Docker, copy the enrollment token and run:
	  `docker run -e "ENROLLMENT_TOKEN=<token>" docker.elastic.co/elasticsearch/elasticsearch:8.7.1`


6. Copie du certificat du container
	$docker cp es01:/usr/share/elasticsearch/config/certs/http_ca.crt

7. Vérification que l'on peut se connecter au container
	

$curl --cacert http_ca.crt -u elastic https://localhost:9200
	user : elastic
	mdp  : RbnHzY51ZeuD1BNa*VaG

II. Installation de Kibana
	1. Téléchargement de l'image Kibana 
		$docker pull docker.elastic.co/kibana/kibana:8.7.1

2. Création et démarage d'un nouveau container nommé kib-01
	$docker run --name kib-01 --net elastic -p 5601:5601 docker.elastic.co/kibana/kibana:8.7.1

2.1 Commande si la key est expiré 
	$docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana
