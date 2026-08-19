

// --- CONSOLIDATED FROM: ./services/citi_suite/apiSimulator.ts ---

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as url from 'url';

/**
 * Interface representing a simulated API endpoint parsed from the CSV.
 */
export interface SimulatedEndpoint {
  method: string;
  path: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

export class ApiSimulator {
  private csvPath: string;
  private endpoints: SimulatedEndpoint[] = [];
  private server: http.Server | null = null;

  constructor(csvPath?: string) {
    this.csvPath = csvPath || path.join(process.cwd(), 'api', 'account-summary.csv');
  }

  /**
   * Initializes the simulator by ensuring the CSV exists (creating a default one if not)
   * and parsing its contents.
   */
  public async initialize(): Promise<void> {
    this.ensureCsvDirectoryAndFile();
    this.loadEndpointsFromCsv();
  }

  /**
   * Ensures that the target CSV file and its directory exist.
   * If not, it populates it with realistic default mock data.
   */
  private ensureCsvDirectoryAndFile(): void {
    const dir = path.dirname(this.csvPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.csvPath)) {
      const defaultCsvContent = [
        'Method,Path,Request Headers,Request Body,Response Status,Response Headers,Response Body',
        'GET,/gcbap/api/v1/accounts,{},,200,"{""Content-Type"": ""application/json""}","{""accounts"": [{""id"": ""12345"", ""type"": ""Savings"", ""balance"": 5432.10, ""currency"": ""USD"", ""status"": ""active""}, {""id"": ""67890"", ""type"": ""Checking"", ""balance"": 1200.50, ""currency"": ""USD"", ""status"": ""active""}]}"',
        'GET,/gcbap/api/v1/accounts/12345,{},,200,"{""Content-Type"": ""application/json""}","{""id"": ""12345"", ""type"": ""Savings"", ""balance"": 5432.10, ""currency"": ""USD"", ""transactions"": [{""id"": ""t1"", ""amount"": -50.00, ""description"": ""Grocery Store"", ""date"": ""2023-10-27""}]}"',
        'POST,/gcbap/api/v1/accounts/transfer,{},"{""from"": ""12345"", ""to"": ""67890"", ""amount"": 100.00}",200,"{""Content-Type"": ""application/json""}","{""status"": ""success"", ""transactionId"": ""tx999888"", ""message"": ""Transfer completed successfully""}"',
        'GET,/gcbap/api/v1/profile,{},,200,"{""Content-Type"": ""application/json""}","{""name"": ""John Doe"", ""email"": ""john.doe@example.com"", ""tier"": ""Platinum""}"'
      ].join('\n');

      fs.writeFileSync(this.csvPath, defaultCsvContent, 'utf8');
      console.log(`Created default API simulation CSV at: ${this.csvPath}`);
    }
  }

  /**
   * Parses the CSV file and populates the internal endpoints array.
   */
  private loadEndpointsFromCsv(): void {
    try {
      const content = fs.readFileSync(this.csvPath, 'utf8');
      const records = this.parseCSV(content);
      
      this.endpoints = records.map((record) => {
        const method = (this.findValueByKeys(record, ['method']) || 'GET').toUpperCase();
        const rawPath = this.findValueByKeys(record, ['path', 'url', 'uri']) || '/';
        const normalizedPath = rawPath.split('?')[0]; // Strip query params for matching
        
        const reqHeadersRaw = this.findValueByKeys(record, ['request headers', 'req headers', 'headers']) || '{}';
        const requestHeaders = this.safeParseJson(reqHeadersRaw, {});

        const requestBody = this.findValueByKeys(record, ['request body', 'req body', 'body', 'payload']) || '';
        
        const statusRaw = this.findValueByKeys(record, ['response status', 'status', 'code', 'statuscode']) || '200';
        const responseStatus = parseInt(statusRaw, 10) || 200;

        const resHeadersRaw = this.findValueByKeys(record, ['response headers', 'res headers']) || '{"Content-Type": "application/json"}';
        const responseHeaders = this.safeParseJson(resHeadersRaw, { 'Content-Type': 'application/json' });

        const responseBody = this.findValueByKeys(record, ['response body', 'res body', 'response']) || '';

        return {
          method,
          path: normalizedPath,
          requestHeaders,
          requestBody,
          responseStatus,
          responseHeaders,
          responseBody
        };
      });

      console.log(`Successfully loaded ${this.endpoints.length} simulated endpoints from CSV.`);
    } catch (error) {
      console.error('Failed to load or parse CSV file:', error);
      this.endpoints = [];
    }
  }

  /**
   * Helper to find a value in a record using multiple potential key names (case-insensitive).
   */
  private findValueByKeys(record: Record<string, string>, keys: string[]): string | undefined {
    const recordKeys = Object.keys(record);
    for (const key of keys) {
      const foundKey = recordKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
      if (foundKey) {
        return record[foundKey];
      }
    }
    return undefined;
  }

  /**
   * Safe JSON parser that returns a fallback value on failure.
   */
  private safeParseJson(jsonStr: string, fallback: any): any {
    if (!jsonStr || jsonStr.trim() === '') return fallback;
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // Attempt to clean up common CSV JSON escaping issues
      try {
        const cleaned = jsonStr.replace(/""/g, '"');
        return JSON.parse(cleaned);
      } catch (innerError) {
        return fallback;
      }
    }
  }

  /**
   * Custom robust CSV parser handling quotes, escaped quotes, and newlines.
   */
  private parseCSV(text: string): Record<string, string>[] {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let current = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && next === '\n') {
          i++;
        }
        row.push(current);
        lines.push(row);
        row = [];
        current = '';
      } else {
        current += char;
      }
    }

    if (current || row.length > 0) {
      row.push(current);
      lines.push(row);
    }

    if (lines.length === 0) return [];

    const headers = lines[0].map(h => h.trim().toLowerCase());
    const records: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i];
      if (values.length === 1 && values[0] === '') continue; // Skip empty lines
      
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index] !== undefined ? values[index].trim() : '';
      });
      records.push(record);
    }

    return records;
  }

  /**
   * Matches an incoming request to the loaded simulated endpoints.
   */
  public matchRequest(method: string, reqPath: string, body: string): SimulatedEndpoint | null {
    const normalizedReqPath = reqPath.split('?')[0];
    const upperMethod = method.toUpperCase();

    // Try exact match first (method + path)
    const matches = this.endpoints.filter(
      ep => ep.method === upperMethod && ep.path === normalizedReqPath
    );

    if (matches.length === 0) {
      return null;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    // If multiple matches exist (e.g., different request bodies for POST), try to match body content
    if (body) {
      for (const match of matches) {
        if (match.requestBody && body.includes(match.requestBody)) {
          return match;
        }
      }
    }

    // Fallback to the first match if no body match is found
    return matches[0];
  }

  /**
   * Starts the HTTP server to dynamically serve the simulated endpoints.
   */
  public start(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const parsedUrl = url.parse(req.url || '', true);
        const reqPath = parsedUrl.pathname || '/';
        let bodyAccumulator = '';

        req.on('data', (chunk) => {
          bodyAccumulator += chunk.toString();
        });

        req.on('end', () => {
          const matched = this.matchRequest(req.method || 'GET', reqPath, bodyAccumulator);

          if (matched) {
            // Set custom response headers
            Object.entries(matched.responseHeaders).forEach(([key, val]) => {
              res.setHeader(key, val);
            });

            res.writeHead(matched.responseStatus);
            res.end(matched.responseBody);
          } else {
            // Return 404 with list of available endpoints for easy debugging/Gemini discovery
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(404);
            res.end(JSON.stringify({
              error: 'Endpoint not found in simulator',
              requested: {
                method: req.method,
                path: reqPath
              },
              availableEndpoints: this.endpoints.map(ep => ({
                method: ep.method,
                path: ep.path
              }))
            }, null, 2));
          }
        });
      });

      this.server.listen(port, () => {
        console.log(`API Simulator is running at http://localhost:${port}`);
        console.log(`Simulating endpoints from: ${this.csvPath}`);
        resolve();
      });
    });
  }

  /**
   * Stops the running HTTP server.
   */
  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('API Simulator stopped.');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Returns the currently loaded endpoints.
   */
  public getEndpoints(): SimulatedEndpoint[] {
    return this.endpoints;
  }
}

// Auto-start the simulator if run directly
if (typeof require !== 'undefined' && require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const simulator = new ApiSimulator();
  simulator.initialize().then(() => {
    simulator.start(port);
  });
}