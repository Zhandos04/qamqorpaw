from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShelterViewSet, CityViewSet

router = DefaultRouter()
router.register(r'shelters', ShelterViewSet)
router.register(r'cities', CityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]