from django.contrib import admin
from .models import (
    Person, Allergy, PersonAllergy,
    Ingredient, AllergyIngredient,
    Fridge, Recipe, RecipeIngredient,
    Like, Shopping
)

admin.site.register(Person)
admin.site.register(Allergy)
admin.site.register(PersonAllergy)
admin.site.register(Ingredient)
admin.site.register(AllergyIngredient)
admin.site.register(Fridge)
admin.site.register(Recipe)
admin.site.register(RecipeIngredient)
admin.site.register(Like)
admin.site.register(Shopping)
