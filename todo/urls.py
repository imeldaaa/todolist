from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("task/add/", views.add_task, name="add_task"),
    path("task/<int:task_id>/toggle/", views.toggle_task, name="toggle_task"),
    path("task/<int:task_id>/delete/", views.delete_task, name="delete_task"),
]
