"""gt_back URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from diaries import views as diary_views
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.shortcuts import render
from django.urls import include, path
from rest_framework import routers
from tickets import views as ticket_views
from user_relations import views as user_relation_views


def index_view(request, pk=0):
    return render(request, "dist/index.html")


router = routers.DefaultRouter()
router.register(r"tickets", ticket_views.TicketViewSet)
router.register(r"user_relations", user_relation_views.UserRelationViewSet)
router.register(r"diaries", diary_views.DiaryViewSet)
router.register(r"diary_tags", diary_views.DiaryTagViewSet)


urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    path("admin/", admin.site.urls),
    path("", index_view, name="index"),
    path("release/", index_view, name="index"),
    path("login", index_view, name="index"),
    path("user_relations/<int:pk>", index_view, name="index"),
]
urlpatterns += staticfiles_urlpatterns()
