import React from "react";
import Charts from "./Charts";
import ComponentTable from "./ComponentTable";
import PdfReportSection from "./PdfReportSection";
import { Appliance, PvgisData, SolarComponents } from "../../types";
import {
  calculateCriticalLoad,
  calculateNightLoad,
} from "../../utils/calculations";
import { Moon, Zap } from "lucide-react";

interface OutputSectionProps {
  visible: boolean;
  appliances: Appliance[];
  dailyEnergyDemand: number;
  pvgisData: PvgisData | null;
  worstMonthPvout: number;
  solarComponents: SolarComponents;
  backupHours: number;
  isFallbackData: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({
  visible,
  appliances,
  dailyEnergyDemand,
  pvgisData,
  worstMonthPvout,
  solarComponents,
  backupHours,
  isFallbackData,
}) => {
  if (!visible) return null;

  const criticalLoadDemand = calculateCriticalLoad(appliances);
  const nightLoadDemand = calculateNightLoad(appliances);

  return (
    <section className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Your Recommended Solar System
            </h2>
            <p className="mt-2 text-gray-600">
              Based on your location and energy needs, here's your optimized
              solar system
            </p>
            {isFallbackData && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Using Estimated Solar Data
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        We're using estimated solar radiation data for your region. 
                        For more accurate results, please try again later or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <p className="text-green-100">Total Daily Energy</p>
                  <p className="text-2xl font-bold">
                    {dailyEnergyDemand.toFixed(2)} kWh
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-400">
                  <div>
                    <div className="flex items-center text-green-100">
                      <Zap className="h-4 w-4 mr-1" />
                      <span>Critical Load</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {criticalLoadDemand.toFixed(2)} kWh
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-green-100">
                      <Moon className="h-4 w-4 mr-1" />
                      <span>Night Load</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {nightLoadDemand.toFixed(2)} kWh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100">Solar Capacity</p>
                  <p className="text-2xl font-bold">
                    {solarComponents.solarPanels.totalWattage / 1000}kW
                    <sub>p</sub>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                  <div>
                    <p className="text-blue-100">Battery Storage</p>
                    <p className="text-xl font-semibold">
                      {(
                        ((solarComponents.batteryConfiguration.capacityAh *
                          solarComponents.systemVoltage) /
                          1000) *
                        solarComponents.batteryConfiguration.parallel
                      ).toFixed(1)}{" "}
                      kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100">Desired Backup</p>
                    <p className="text-xl font-semibold">{backupHours}h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <Charts
            pvgisData={pvgisData}
            dailyEnergyDemand={dailyEnergyDemand}
            worstMonthPvout={worstMonthPvout}
            solarComponents={solarComponents}
            backupHours={backupHours}
            isFallbackData={isFallbackData}
          />

          {/* Component Table */}
          <ComponentTable
            components={solarComponents}
            dailyEnergyDemand={dailyEnergyDemand}
          />

          {/* PDF Report Section */}
          <PdfReportSection />
        </div>
      </div>
    </section>
  );
};

export default OutputSection;
