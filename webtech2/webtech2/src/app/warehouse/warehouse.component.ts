import { Component, OnInit } from '@angular/core';
import { WarehouseItem } from '../../../models/warehouse-item';
import { WarehouseService } from '../services/warehouse.service';
import { ToastrService } from 'ngx-toastr';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {
  warehouseItems: WarehouseItem[] = [];
  filteredWarehouseItems: WarehouseItem[] = [];
  searchTerm: string = '';
  chartData!: ChartData<'bar'>; // Non-null assertion operator
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  constructor(private warehouseService: WarehouseService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.loadWarehouseItems();
  }

  loadWarehouseItems(): void {
    this.warehouseService.getWarehouseItems().subscribe(items => {
      this.warehouseItems = items.filter(item => item.quantity > 0);
      this.filteredWarehouseItems = [...this.warehouseItems]; // Initialize filtered items
      this.updateChartData();

      const deleteItems = items.filter(item => item.quantity === 0);
      deleteItems.forEach(item => {
        this.warehouseService.deleteWarehouseItem(item.id).subscribe(() => {
          console.log('0-ás darabszám miatt a(z) ' + item.name + ' raktári egység törölve lett');
        }, error => {
          console.error('Hiba történt az elem törlésekor:', error);
        });
      });
    });
  }

  updateChartData(): void {
    const labels = this.filteredWarehouseItems.map(item => item.name);
    const quantities = this.filteredWarehouseItems.map(item => item.quantity);

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
  }

  addWarehouseItem(newItem: WarehouseItem): void {
    this.warehouseService.create(newItem).subscribe(() => {
      this.loadWarehouseItems();
    }, error => {
      console.error('Hiba történt a raktári elem hozzáadásakor:', error);
    });
  }

  deleteWarehouseItem(itemId: number): void {
    this.warehouseService.deleteWarehouseItem(itemId).subscribe(() => {
      this.loadWarehouseItems();
      this.toastrService.success('Raktári egység sikeresen törölve!', 'Siker');
    }, error => {
      console.error('Hiba történt a raktári elem törlésekor:', error);
    });
  }

  searchWarehouseItems(): void {
    if (this.searchTerm.trim()) {
      this.filteredWarehouseItems = this.warehouseItems.filter(item => 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredWarehouseItems = [...this.warehouseItems];
    }
    this.updateChartData();
  }
}
