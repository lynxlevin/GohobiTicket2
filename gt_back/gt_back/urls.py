from diaries import views as diary_views
from django.urls import include, path
from rest_framework import routers
from tickets import views as ticket_views
from user_relations import views as user_relation_views

router = routers.DefaultRouter()
router.register(r"tickets", ticket_views.TicketViewSet)
router.register(r"user_relations", user_relation_views.UserRelationViewSet)
router.register(r"diaries", diary_views.DiaryViewSet)
router.register(r"diary_tags", diary_views.DiaryTagViewSet)


urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
]
