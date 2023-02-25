## How to run commands
- `poetry shell`
- then `python manage.py runserver`

## How to build frontend
```
cd gt_front
npm run build
rm -rf ../gt_back/static/dist
mv dist ../gt_back/static/dist
```