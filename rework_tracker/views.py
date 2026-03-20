from django.shortcuts import render, redirect, get_object_or_404
from .models import PCB, Rework, Owner, ProductNameAndRev
from .forms import PCBForm, ReworkForm

def add_rework(request):
    if request.method == 'POST':
        pcb_form = PCBForm(request.POST)
        rework_form = ReworkForm(request.POST, request.FILES)

        if pcb_form.is_valid() and rework_form.is_valid():
            # Handle PCB
            pcb_number = pcb_form.cleaned_data['pcb_number']
            pcb, created = PCB.objects.get_or_create(pcb_number=pcb_number)
            
            # Update PCB fields if provided
            if pcb_form.cleaned_data['bom_number']:
                pcb.bom_number = pcb_form.cleaned_data['bom_number']
            if pcb_form.cleaned_data['status']:
                pcb.status = pcb_form.cleaned_data['status']

            # Handle Product Name and Rev
            product = pcb_form.cleaned_data['product_name_and_rev']
            new_prod_name = pcb_form.cleaned_data['new_product_name']
            new_prod_rev = pcb_form.cleaned_data['new_product_rev']
            
            if new_prod_name and new_prod_rev:
                product, _ = ProductNameAndRev.objects.get_or_create(name=new_prod_name, rev=new_prod_rev)
            
            if product:
                pcb.product_name_and_rev = product

            # Handle Last Owner
            last_owner = pcb_form.cleaned_data['last_owner']
            new_owner_name = pcb_form.cleaned_data['new_owner']
            
            if new_owner_name:
                last_owner, _ = Owner.objects.get_or_create(name=new_owner_name)
            
            if last_owner:
                pcb.last_owner = last_owner
            
            pcb.save()

            # Handle Rework
            rework = rework_form.save(commit=False)
            rework.pcb = pcb
            
            # Handle Rework Owner
            rework_owner = rework_form.cleaned_data['rework_owner']
            new_rework_owner_name = rework_form.cleaned_data['new_owner']
            
            if new_rework_owner_name:
                rework_owner, _ = Owner.objects.get_or_create(name=new_rework_owner_name)
            
            if rework_owner:
                rework.rework_owner = rework_owner
            
            rework.save()
            
            return redirect('board_detail', board_number=pcb.pcb_number)
    else:
        pcb_form = PCBForm()
        rework_form = ReworkForm()

    return render(request, 'rework_tracker/add_rework.html', {
        'pcb_form': pcb_form,
        'rework_form': rework_form,
    })

def board_detail(request, board_number=None):
    # Support both /board=123 (query param) and /board/123/ (path param)
    if board_number is None:
        board_number = request.GET.get('board')
    
    if board_number:
        pcb = get_object_or_404(PCB, pcb_number=board_number)
        return render(request, 'rework_tracker/board_detail.html', {'pcb': pcb})
    
    return render(request, 'rework_tracker/board_not_found.html')
