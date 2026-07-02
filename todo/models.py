from django.db import models
from django.utils import timezone


class Person(models.Model):
    name = models.CharField(max_length=50, unique=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Task(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    deadline = models.DateField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["deadline", "created_at"]

    def __str__(self):
        return self.title
