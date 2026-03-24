from django.contrib import admin
from .models import Person

# Register your models here.

class PersonAdmin(admin.ModelAdmin):
    list_display = "_all_"
