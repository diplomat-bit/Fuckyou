

// --- CONSOLIDATED FROM: ./services/dbService.ts ---

import { db } from "../lib/astra";
import {
  InternalAccountDoc,
  RealEstateAssetDoc,
  PaperBibliographyEntry,
  AgenticActionDoc,
} from "../../tables/accounts";

export class SovereignDataService {
  private internalAccounts = db.collection<InternalAccountDoc>("internal_accounts");
  private realEstate = db.collection<RealEstateAssetDoc>("real_estate_assets");
  private researchPapers = db.collection<PaperBibliographyEntry>("research_papers");
  private agenticTx = db.collection<AgenticActionDoc>("agentic_transactions");

  // Fetch Account
  async getAccount(accountNumber: string) {
    return await this.internalAccounts.findOne({ account_number: accountNumber });
  }

  // Vector Similarity Search on Real Estate
  async searchRealEstate(vectorEmbedding: number[], limit = 3) {
    return await this.realEstate
      .find({ status: "AVAILABLE" }, { sort: { $vector: vectorEmbedding }, limit })
      .toArray();
  }

  // Vector Similarity Search on Papers
  async searchPapers(vectorEmbedding: number[], limit = 2) {
    return await this.researchPapers
      .find({}, { sort: { $vector: vectorEmbedding }, limit })
      .toArray();
  }

  // Insert Action Log
  async logAction(action: AgenticActionDoc) {
    const res = await this.agenticTx.insertOne(action);
    return res.insertedId;
  }
}
