from django.urls import path
from . import views

urlpatterns = [
    path('', views.add_rework, name='add_rework'),
    # Literally root\board=boardnumber
    path('board=<str:board_number>/', views.board_detail, name='board_detail'),
    # Support for query parameter root?board=boardnumber
    path('board/', views.board_detail, name='board_detail_query'),
]
