## How to build django

1. install poetry
2. `poetry install`
3. build postgres database
4. set db information in .env (and others like slack_api_url too)
5. build fixture data
<!-- MYMEMO: details on fixtures -->

## How to run locally (retrieving static files from backend)

1. build frontend

```
cd gt_front
npm run build
rm -rf ../gt_back/static/dist
mv dist ../gt_back/static/dist
```

2. run server

```
poetry shell
cd gt_back
python manage.py runserver
```

3. access `http://127.0.0.1:8000/`


## How to run locally (retrieving static files from backend)

1. run server

```
poetry shell
cd gt_back
python manage.py runserver
```

2. run frontend server

```
cd gt_front
npm start
```

3. access `http://localhost:8080`

