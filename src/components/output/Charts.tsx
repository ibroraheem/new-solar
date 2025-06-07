import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartData as ChartJsData } from 'chart.js';
import { PvgisData, SolarComponents } from '../../types';

Chart.register(...registerables);

interface ChartsProps {
  pvgisData: PvgisData | null;
  dailyEnergyDemand: number;
  worstMonthPvout: number;
  solarComponents: SolarComponents;
  backupHours: number;
}

const Charts: React.FC<ChartsProps> = ({
  pvgisData,
  dailyEnergyDemand,
  worstMonthPvout,
  solarComponents,
  backupHours,
}) => {
  const monthlyChartRef = useRef<HTMLCanvasElement>(null);
  const generationChartRef = useRef<HTMLCanvasElement>(null);
  const batteryChartRef = useRef<HTMLCanvasElement>(null);
  const utilizationChartRef = useRef<HTMLCanvasElement>(null);

  // Store chart instances for cleanup
  const chartInstances = useRef<Chart[]>([]);
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Cleanup function to destroy existing charts
  const destroyCharts = () => {
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];
  };

  useEffect(() => {
    if (!pvgisData || !pvgisData.monthly) return;

    // Clean up existing charts
    destroyCharts();
    
    // Create monthly PVOUT chart
    if (monthlyChartRef.current) {
      const ctx = monthlyChartRef.current.getContext('2d');
      if (ctx) {
        const monthlyData: ChartJsData = {
          labels: monthNames,
          datasets: [{
            label: 'Solar Radiation (kWh/m²/day)',
            data: pvgisData.monthly.map(month => month.pvout / 30), // Convert back to daily values
            backgroundColor: pvgisData.monthly.map(month => 
              month.pvout / 30 === worstMonthPvout ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)'
            ),
            borderColor: pvgisData.monthly.map(month => 
              month.pvout / 30 === worstMonthPvout ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'
            ),
            borderWidth: 1
          }]
        };

        const chart = new Chart(ctx, {
          type: 'bar',
          data: monthlyData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  title: (items) => monthNames[items[0].dataIndex],
                  label: (item) => `Solar Radiation: ${(item.raw as number).toFixed(2)} kWh/m²/day`,
                  footer: (items) => {
                    const index = items[0].dataIndex;
                    const isWorstMonth = pvgisData.monthly[index].pvout / 30 === worstMonthPvout;
                    return isWorstMonth ? 'Worst Month (Used for Sizing)' : '';
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'kWh/m²/day'
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Create generation vs demand chart
    if (generationChartRef.current) {
      const ctx = generationChartRef.current.getContext('2d');
      if (ctx) {
        const dailyGeneration = pvgisData.monthly.map(month => 
          (solarComponents.solarPanels.totalWattage * (month.pvout / 30) * 0.75) / 1000
        );

        const generationData: ChartJsData = {
          labels: monthNames,
          datasets: [
            {
              label: 'Estimated Generation (kWh/day)',
              data: dailyGeneration,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 1
            },
            {
              label: 'Energy Demand (kWh/day)',
              data: Array(12).fill(dailyEnergyDemand),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1
            }
          ]
        };

        const chart = new Chart(ctx, {
          type: 'bar',
          data: generationData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (item) => `${item.dataset.label}: ${(item.raw as number).toFixed(2)} kWh/day`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'kWh/day'
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Create battery autonomy chart
    if (batteryChartRef.current) {
      const ctx = batteryChartRef.current.getContext('2d');
      if (ctx) {
        const batteryCapacityKwh = 
          (solarComponents.batteryConfiguration.capacityAh * solarComponents.systemVoltage) / 1000;
        
        const dod = solarComponents.batteryType === 'Lithium' ? 0.9 : 0.5;
        const actualAutonomyHours = (batteryCapacityKwh * dod * 24) / dailyEnergyDemand;

        const batteryData: ChartJsData = {
          labels: ['Designed', 'Actual'],
          datasets: [{
            label: 'Hours of Autonomy',
            data: [backupHours, actualAutonomyHours],
            backgroundColor: ['rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)'],
            borderColor: ['rgb(245, 158, 11)', 'rgb(16, 185, 129)'],
            borderWidth: 1
          }]
        };

        const chart = new Chart(ctx, {
          type: 'bar',
          data: batteryData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (item) => `${item.dataset.label}: ${(item.raw as number).toFixed(1)} hours`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Hours'
                }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    // Create system utilization chart
    if (utilizationChartRef.current) {
      const ctx = utilizationChartRef.current.getContext('2d');
      if (ctx) {
        const annualGeneration = pvgisData.monthly.reduce((sum, month) => 
          sum + (solarComponents.solarPanels.totalWattage * (month.pvout / 30) * 0.75 * 30) / 1000, 0
        );
        
        const annualDemand = dailyEnergyDemand * 365;
        const excessEnergy = Math.max(0, annualGeneration - annualDemand);

        const utilizationData: ChartJsData = {
          labels: ['Annual Energy'],
          datasets: [
            {
              label: 'Used Energy (kWh)',
              data: [annualDemand],
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 1
            },
            {
              label: 'Excess Energy (kWh)',
              data: [excessEnergy],
              backgroundColor: 'rgba(245, 158, 11, 0.7)',
              borderColor: 'rgb(245, 158, 11)',
              borderWidth: 1
            }
          ]
        };

        const chart = new Chart(ctx, {
          type: 'bar',
          data: utilizationData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (item) => `${item.dataset.label}: ${Math.round(item.raw as number)} kWh`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                stacked: true,
                title: {
                  display: true,
                  text: 'kWh/year'
                }
              },
              x: {
                stacked: true
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }

    return () => {
      destroyCharts();
    };
  }, [pvgisData, dailyEnergyDemand, worstMonthPvout, solarComponents, backupHours]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Solar Radiation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows solar radiation throughout the year. The red bar indicates the worst month used for calculations.
        </p>
        <div style={{ height: '300px' }}>
          <canvas ref={monthlyChartRef}></canvas>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Solar Generation vs Energy Demand</h3>
        <p className="text-sm text-gray-600 mb-4">
          Compares estimated solar generation with your daily energy needs throughout the year.
        </p>
        <div style={{ height: '300px' }}>
          <canvas ref={generationChartRef}></canvas>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Battery Autonomy</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows the designed backup hours compared to the actual hours of autonomy with the recommended battery.
        </p>
        <div style={{ height: '300px' }}>
          <canvas ref={batteryChartRef}></canvas>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">System Utilization</h3>
        <p className="text-sm text-gray-600 mb-4">
          Displays the annual energy used vs excess energy produced by your system.
        </p>
        <div style={{ height: '300px' }}>
          <canvas ref={utilizationChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Charts;