# diginamic-ionic-tasksmanager

A ionic React tasks manager with a json server

## Installation

### paramétré json serveur

* Lancez dans un terminal bash a la racine du projet `./json-server/start-json-server.sh`.

* Copiez l'adresse ip présent dans le points de sortis.

**Si vous utilisez WSL**, vous devez faire un lien entre votre IP WSL et votre IP Windows pour cela :

 Dans un PowerShell Admin, exécutez la commande suivante en remplaçant `WSL_IP` par l'IP copiée précédemment :

```powershell
netsh interface portproxy add v4tov4 `
listenport=8300 `
listenaddress=0.0.0.0 `
connectport=3000 connectaddress=WSL_IP
```

**Fin si**
