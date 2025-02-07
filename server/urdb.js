// server/urdb.js
import axios from 'axios';

/**
 * Fetch URDB data from the OpenEI API.
 */
export async function fetchURDBData() {
  const params = {
    version: '3',
    format: 'json',
    limit: 500,
    detail: 'full',
    api_key: process.env.URDB_API_KEY,
  };

  try {
    const response = await axios.get('https://api.openei.org/utility_rates', { params });
    if (response.data && response.data.items) {
      console.log(`Fetched ${response.data.items.length} records from URDB.`);
      return response.data.items;
    } else {
      console.error("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching URDB data:", error.message);
    return [];
  }
}

/**
 * Transform raw URDB records into Documents.
 * This version extracts additional fields that may be useful.
 */
export function transformToDocuments(data) {
  return data.map((record) => {
    // Basic fields.
    const utility = record.utility || "Unknown Utility";
    const name = record.name || "No Name Provided";
    const sector = record.sector || "N/A";
    const description = record.description || "No Description available.";
    const basicInfo = record.basicinformationcomments || "";
    const uri = record.uri || "No URI provided";
    
    // Additional financial and capacity fields.
    const peakKwMin = (record.peakkwcapacitymin !== undefined) ? `Peak kW Min: ${record.peakkwcapacitymin}` : "";
    const peakKwMax = (record.peakkwcapacitymax !== undefined) ? `Peak kW Max: ${record.peakkwcapacitymax}` : "";
    const fixedMonthlyCharge = (record.fixedmonthlycharge !== undefined) ? `Fixed Monthly Charge: ${record.fixedmonthlycharge}` : "";
    const minMonthlyCharge = (record.minmonthlycharge !== undefined) ? `Min Monthly Charge: ${record.minmonthlycharge}` : "";
    const annualMinCharge = (record.annualmincharge !== undefined) ? `Annual Min Charge: ${record.annualmincharge}` : "";
    
    // Electrical parameters.
    const voltageMin = (record.voltageminimum !== undefined) ? `Voltage Minimum: ${record.voltageminimum}` : "";
    const voltageMax = (record.voltagemaximum !== undefined) ? `Voltage Maximum: ${record.voltagemaximum}` : "";
    const flatDemandUnit = record.flatdemandunit ? `Flat Demand Unit: ${record.flatdemandunit}` : "";
    
    // For flatdemandstructure, we include a simple summary (e.g., first element).
    let flatDemandStructureSummary = "";
    if (record.flatdemandstructure && Array.isArray(record.flatdemandstructure) && record.flatdemandstructure.length > 0) {
      flatDemandStructureSummary = `Flat Demand Structure (first period): ${JSON.stringify(record.flatdemandstructure[0])}`;
    }
    
    // Compose the content string.
    const content = [
      `Utility: ${utility}`,
      `Name: ${name}`,
      `Sector: ${sector}`,
      `Description: ${description}`,
      basicInfo && `Basic Info: ${basicInfo}`,
      peakKwMin,
      peakKwMax,
      fixedMonthlyCharge,
      minMonthlyCharge,
      annualMinCharge,
      voltageMin,
      voltageMax,
      flatDemandUnit,
      flatDemandStructureSummary,
      `URI: ${uri}`
    ]
      .filter(Boolean)
      .join("\n");

    return {
      pageContent: content,
      metadata: {
        source: "URDB",
        id: record.label || "unknown_id",
      },
    };
  });
}
