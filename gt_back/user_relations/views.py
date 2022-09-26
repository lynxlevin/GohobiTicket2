from django.shortcuts import render


def detail(request, pk: int):
    context = {"user_relation_id": pk}
    return render(request, "user_relations/detail.html", context)
