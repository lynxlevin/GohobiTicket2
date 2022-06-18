from django.shortcuts import render
from urllib3 import HTTPResponse

# Create your views here.


def index(request):
    return render(request, 'release/index.html')
