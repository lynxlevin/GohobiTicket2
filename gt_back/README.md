## How to build django

1. install poetry
2. `poetry install`
3. build postgres database
4. set db information in .env (and others like slack_api_url too)
5. generate SECRET_KEY and set into .env
```
poetry shell
python manage.py shell
from django.core.management.utils import get_random_secret_key as gr
print(gr())
```
6. build fixture data
<!-- MYMEMO: details on fixtures -->

## How to run locally

1. run server

```
poetry shell
cd gt_back
poetry install
python manage.py migrate
python manage.py runserver
```

2. build frontend

```
cd gt_front2
npm start
```
