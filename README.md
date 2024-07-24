# diginamic-ionic-tasksmanager

A ionic React tasks manager with a json server

## Installation

### paramétré json serveur

* Lancez dans un terminal bash a la racine du projet les commandes suivantes 
  * `cd ./json-server`
  * `npm install`
  * `./start-json-server.sh`.

* Copiez l'adresse ip présent dans le points de sortis.

**Si vous utilisez WSL**, vous devez faire un lien entre votre IP WSL et votre IP Windows pour cela :

 Dans un PowerShell Admin, exécutez la commande suivante en remplaçant `WSL_IP` par l'IP copiée précédemment :

```powershell
netsh interface portproxy add v4tov4 `
listenport=8300 `
listenaddress=0.0.0.0 `
connectport=3000 connectaddress=WSL_IP
```

puis retrouvé l'ip réel de windows en utilisant la commande
`ipconfig`

**Fin si**

### paramétré ionic

copié l'ip trouvé dans un fichier dans `./IonicTaskManager/.env`
votre fichier .env devrais ressembler à:

```.env
VITE_REACT_APP_BDD_API_URL=http://192.168.0.24:8300

```

* Lancez dans un terminal bash a la racine du projet les commandes suivantes 
  * `cd ./IonicTaskManager`
  * `npm install`
  * `ionic cap sync android`

## Lancer l'application

### En local

Dans un terminal bash dans le dossier `./IonicTaskManager` lancé la commande,
`ionic serve`

## Sur un téléphone portable

Ouvrer android studio dans le dossier `./IonicTaskManager/android`,

* soit en lancent la commande bash : `ionic capacitor open android` depuis `./IonicTaskManager`.
* soit manuellement en ouvrant Android studio et en sélectionnant ouvrir un projet.

Et après avoir sélectionné votre appareil clicker sur le bouton en forme de triangle vert nommé "run app".
