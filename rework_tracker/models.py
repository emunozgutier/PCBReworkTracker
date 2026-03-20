from django.db import models

class ProductNameAndRev(models.Model):
    name = models.CharField(max_length=255)
    rev = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} Rev {self.rev}"

class Owner(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class PCB(models.Model):
    pcb_number = models.CharField(max_length=100, unique=True)
    product_name_and_rev = models.ForeignKey(ProductNameAndRev, on_delete=models.CASCADE, related_name='pcbs')
    bom_number = models.CharField(max_length=100)
    last_owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, related_name='last_owned_pcbs')
    status = models.CharField(max_length=100)

    def __str__(self):
        return self.pcb_number

class Rework(models.Model):
    pcb = models.ForeignKey(PCB, on_delete=models.CASCADE, related_name='reworks')
    rework_number = models.CharField(max_length=100, unique=True)
    rework_description = models.TextField()
    rework_owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, related_name='reworks')
    rework_status = models.CharField(max_length=100)
    rework_date = models.DateTimeField(auto_now_add=True)
    rework_picture = models.ImageField(upload_to='rework_pictures/', null=True, blank=True)

    def __str__(self):
        return self.rework_number
