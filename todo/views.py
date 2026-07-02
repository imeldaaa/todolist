import json
from datetime import datetime

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Person, Task

DEFAULT_PERSONS = ["Mas Arif", "Mbak Arum", "Kak Azka", "Kak Dea", "Mas Nabil", "Others"]


def ensure_default_persons():
    if Person.objects.count() == 0:
        for i, name in enumerate(DEFAULT_PERSONS):
            Person.objects.create(name=name, order=i)


@ensure_csrf_cookie
def dashboard(request):
    ensure_default_persons()
    persons = Person.objects.prefetch_related("tasks").all()
    cards = []
    for person in persons:
        # push tasks with no deadline to the end, otherwise sort ascending by deadline
        todo_tasks = sorted(
            person.tasks.filter(is_done=False),
            key=lambda t: (t.deadline is None, t.deadline, t.created_at),
        )
        done_tasks = person.tasks.filter(is_done=True).order_by("-completed_at")
        cards.append({"person": person, "todo": todo_tasks, "done": done_tasks})
    return render(request, "todo/dashboard.html", {"cards": cards, "today": timezone.localdate()})


@require_POST
def add_task(request):
    person_id = request.POST.get("person_id")
    title = (request.POST.get("title") or "").strip()
    deadline = (request.POST.get("deadline") or "").strip()

    if not title:
        return JsonResponse({"ok": False, "error": "Judul tugas tidak boleh kosong"}, status=400)

    person = get_object_or_404(Person, id=person_id)
    deadline_val = None
    if deadline:
        try:
            deadline_val = datetime.strptime(deadline, "%Y-%m-%d").date()
        except ValueError:
            deadline_val = None

    task = Task.objects.create(person=person, title=title, deadline=deadline_val)
    return JsonResponse({
        "ok": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "deadline": task.deadline.strftime("%Y-%m-%d") if task.deadline else None,
            "deadline_display": task.deadline.strftime("%d %b %Y") if task.deadline else None,
        },
    })


@require_POST
def toggle_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.is_done = not task.is_done
    task.completed_at = timezone.now() if task.is_done else None
    task.save()
    return JsonResponse({
        "ok": True,
        "is_done": task.is_done,
        "completed_at_display": task.completed_at.strftime("%d %b %Y") if task.completed_at else None,
    })


@require_POST
def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return JsonResponse({"ok": True})
