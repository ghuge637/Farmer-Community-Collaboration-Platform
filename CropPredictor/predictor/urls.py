from django.urls import path
from . import views

urlpatterns = [
    path('api/predict/', views.predict_crop_api, name='predict_crop_api'),
    path('', views.predict_crop, name='predict_crop'),
]
