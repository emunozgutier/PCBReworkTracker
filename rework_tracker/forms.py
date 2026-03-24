from django import forms
from .models import PCB, Rework, Owner, ProductNameAndRev

class PCBForm(forms.ModelForm):
    new_product_name = forms.CharField(max_length=255, required=False, label="New Product Name")
    new_product_rev = forms.CharField(max_length=50, required=False, label="New Product Revision")
    new_owner = forms.CharField(max_length=255, required=False, label="New Owner")

    class Meta:
        model = PCB
        fields = ['pcb_number', 'product_name_and_rev', 'bom_number', 'last_owner', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['product_name_and_rev'].required = False
        self.fields['last_owner'].required = False

class ReworkForm(forms.ModelForm):
    new_owner = forms.CharField(max_length=255, required=False, label="New Rework Owner")

    class Meta:
        model = Rework
        fields = ['rework_number', 'rework_description', 'rework_owner', 'rework_status', 'rework_picture']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['rework_owner'].required = False
