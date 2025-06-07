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
              <div className="mt-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
                <strong>Note:</strong> Using estimated solar radiation data for your region. For more accurate results, please try again later.
              </div>
            )}
          </div>

          {solarComponents.solarPanels.totalWattage > 12600 && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-6 text-center">
              <strong>System too large:</strong> We currently support a maximum
              system size of <strong>12.6 kWp</strong>. Please reduce your
              energy load or contact our support for custom solutions.
            </div>
          )}

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
