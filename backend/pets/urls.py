from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetViewSet, BreedViewSet, PetReportViewSet

router = DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'breeds', BreedViewSet)
router.register(r'reports', PetReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]