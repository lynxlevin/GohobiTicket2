from django.urls import path

from . import views

app_name = "user_relations"
urlpatterns = [
    path("<int:pk>/", views.detail, name="detail"),
]
