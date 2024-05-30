import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WarehouseItem } from '../../../models/warehouse-item';
import { ToastrService } from 'ngx-toastr';
import { WarehouseService } from '../services/warehouse.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-product-form',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css']
})
export class WarehouseListComponent implements OnInit {
  warehouseForm = this.formBuilder.group({
    id: this.formBuilder.control(0),
    name: this.formBuilder.control('', Validators.required),
    stockNumber: this.formBuilder.control(1),
    dateAdded: this.formBuilder.control(new Date()),
    quantity: this.formBuilder.control(1, [Validators.required, Validators.min(1)])
  });

  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  constructor(
    private warehouseService: WarehouseService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params['id'];

    if (id) {
      this.warehouseService.getOne(id).subscribe({
        next: (item) => {
          this.warehouseForm.setValue(item);
        },
        error: (err) => {
          console.error(err);
          this.toastrService.error('Hiba a termékadatok betöltésekor.', 'Hiba');
        }
      });
    }

    this.loadWarehouseItems();
  }

  loadWarehouseItems(): void {
    this.warehouseService.getWarehouseItems().subscribe(items => {
      const labels = items.map(item => item.name);
      const quantities = items.map(item => item.quantity);

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Raktári egységek száma',
            data: quantities,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
    });
  }

  saveWarehouseItem() {
    const warehouseItem = this.warehouseForm.value as WarehouseItem;

    if (this.warehouseForm.valid) {
      const itemName = warehouseItem.name;

      this.warehouseService.getWarehouseItems().subscribe(items => {
        const existingItem = items.find(item => item.name === itemName);

        if (existingItem) {
          existingItem.quantity += warehouseItem.quantity;

          this.warehouseService.update(existingItem).subscribe({
            next: () => {
              this.toastrService.info('Már megtalálható a(z) ' + itemName + ' egység, ezért csak a darabszám frissült.', 'Figyelem');
              this.loadWarehouseItems();
            },
            error: (error) => {
              console.error(error);
              this.toastrService.error('Hiba történt a darabszám frissítésekor.', 'Hiba');
            }
          });
        } else {
          this.warehouseService.create(warehouseItem).subscribe({
            next: () => {
              this.toastrService.success('Új ' + itemName + ' egység sikeresen létrehozva!', 'Siker');
              this.loadWarehouseItems();
            },
            error: (error) => {
              console.error(error);
              this.toastrService.error('Hiba történt a létrehozás során.', 'Hiba');
            }
          });
        }
      });
    } else {
      this.toastrService.info('Kérlek ne hagyj üresen mezőt, mert így nem kerül felvételre raktári egység.');
    }
  }
}
