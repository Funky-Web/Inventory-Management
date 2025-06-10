import { Component } from '@angular/core';
import {Chart, ChartConfiguration, ChartData, ChartEvent, registerables} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

//Register the chart, else it won't show
Chart.register(...registerables)

@Component({
  selector: 'app-sales-line-chart',
  templateUrl: './sales-line-chart.html',
  styleUrl: './sales-line-chart.css',
  imports: [
    BaseChartDirective
  ],
  standalone: true
})
export class SalesLineChartComponent {


  public lineChartType: 'line' = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [120, 150, 180, 90, 100, 250],
        label: 'Actual Sales',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#3b82f6',
        pointRadius: 4
      },
      {
        data: [100, 130, 160, 80, 120, 260],
        label: 'Forecasted Sales',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointRadius: 4
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      // title: {
      //   display: true,
      //   text: 'Monthly Sales Forecast',
      //   font: {
      //     size: 16,
      //     weight: 'bold'
      //   },
      //   padding: 20
      // },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
        displayColors: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Sales ($)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  // Optional: Chart event handlers
  public chartClicked({ event, active }: { event?: ChartEvent; active?: object[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event?: ChartEvent; active?: object[] }): void {
    console.log(event, active);
  }

  constructor() {
    console.log('Chart component initialized with ng2-charts v8.0.0');
  }

}
