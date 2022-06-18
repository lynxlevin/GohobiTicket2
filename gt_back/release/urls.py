from django.urls import path

from . import views

app_name = 'release'
urlpatterns = [
    path('', views.index, name='index'),
]
