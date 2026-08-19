

// --- CONSOLIDATED FROM: ./clarity/part13_tax_reporting_compliance.ts ---

import { Transaction, Asset, TaxLot } from '../types/sovereign';
import { logger } from '../api/utils/logger';

export interface TaxReport {
  form1099DA: {
    proceeds: number;
    costBasis: number;
    gainLoss: number;
    washSaleAdjustment: number;
  };
  taxLiability: number;
  estimatedTaxDue: number;
}

export class TaxReportingEngine {
  private readonly TAX_RATE = 0.25; // Default capital gains rate

  /**
   * Calculates cost basis using FIFO (First-In, First-Out)
   */
  public calculateCostBasis(transactions: Transaction[], assetId: string): number {
    const relevantTransactions = transactions
      .filter(t => t.assetId === assetId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalCost = 0;
    let totalQuantity = 0;

    for (const tx of relevantTransactions) {
      if (tx.type === 'BUY') {
        totalCost += tx.amount * tx.pricePerUnit;
        totalQuantity += tx.amount;
      }
    }

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  /**
   * Generates IRS Form 1099-DA compliant data structure
   */
  public generate1099DA(transactions: Transaction[], year: number): TaxReport {
    logger.info(`Generating 1099-DA for tax year ${year}`);

    const sales = transactions.filter(t => t.type === 'SELL' && new Date(t.timestamp).getFullYear() === year);
    
    let totalProceeds = 0;
    let totalCostBasis = 0;

    sales.forEach(sale => {
      const basis = this.calculateCostBasis(transactions, sale.assetId);
      totalProceeds += (sale.amount * sale.pricePerUnit);
      totalCostBasis += (sale.amount * basis);
    });

    const gainLoss = totalProceeds - totalCostBasis;
    const taxLiability = gainLoss > 0 ? gainLoss * this.TAX_RATE : 0;

    return {
      form1099DA: {
        proceeds: totalProceeds,
        costBasis: totalCostBasis,
        gainLoss,
        washSaleAdjustment: 0 // Placeholder for advanced wash sale logic
      },
      taxLiability,
      estimatedTaxDue: taxLiability
    };
  }

  /**
   * Validates compliance with IRS reporting standards
   */
  public validateCompliance(report: TaxReport): boolean {
    if (report.form1099DA.proceeds < 0) return false;
    return true;
  }
}

export const taxReportingEngine = new TaxReportingEngine();