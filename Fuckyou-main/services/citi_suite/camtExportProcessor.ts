import * as XLSX from 'xlsx';

/**
 * Interface representing a single field definition extracted from the CAMT.053.001.02 Export User Guide Excel file.
 */
export interface CamtFieldDefinition {
  id: string;
  xmlPath: string;
  tag: string;
  fieldName: string;
  description: string;
  multiplicity: string;
  dataType: string;
  maxLength?: number;
  pattern?: string;
  exampleValue?: string;
  businessRules?: string;
  isMandatory: boolean;
  category: 'GroupHeader' | 'Statement' | 'Entry' | 'TransactionDetails' | 'Balance' | 'Other';
}

/**
 * Comprehensive dataset parsed from the CAMT.053 User Guide specification spreadsheet.
 */
export interface CamtExportGuideData {
  title: string;
  version: string;
  isoStandard: string;
  generatedAt: string;
  totalFieldsCount: number;
  sheetsProcessed: string[];
  fields: CamtFieldDefinition[];
  categoriesSummary: Record<string, number>;
  hierarchicalTree?: CamtTreeNode[];
}

/**
 * Hierarchical representation of the CAMT structure for AI navigation and context building.
 */
export interface CamtTreeNode {
  tag: string;
  name: string;
  xmlPath: string;
  dataType: string;
  multiplicity: string;
  description: string;
  children: CamtTreeNode[];
}

/**
 * Options for parsing the CAMT User Guide Excel file.
 */
export interface CamtParseOptions {
  sheetName?: string;
  headerRowIndex?: number;
  maxRows?: number;
  includeRawRows?: boolean;
}

/**
 * Summary structure optimized for Gemini AI context injection.
 */
export interface CamtAIContextSummary {
  systemContext: string;
  isoStandard: string;
  keyFields: Array<{ xmlPath: string; fieldName: string; description: string; tag: string }>;
  jsonSchema: Record<string, any>;
  promptInstructions: string;
}

/**
 * Dedicated service to parse, extract, and format structured data from 
 * CAMT.053.001.02 Export User Guide Excel spreadsheets for AI / Gemini usage.
 */
export class CamtExportProcessor {
  /**
   * Parse an Excel file (as Buffer, ArrayBuffer, or Uint8Array) containing the CAMT.053 Export User Guide.
   */
  public parseUserGuideExcel(
    fileBuffer: Buffer | ArrayBuffer | Uint8Array,
    options: CamtParseOptions = {}
  ): CamtExportGuideData {
    let readType: 'buffer' | 'array' = 'buffer';
    if (fileBuffer instanceof ArrayBuffer || ArrayBuffer.isView(fileBuffer)) {
      readType = 'array';
    }

    const workbook = XLSX.read(fileBuffer, { type: readType, cellDates: true, cellFormula: false });
    
    const targetSheetName = options.sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];

    if (!worksheet) {
      throw new Error(`Sheet '${targetSheetName}' not found in Excel file. Available sheets: ${workbook.SheetNames.join(', ')}`);
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    
    const fields: CamtFieldDefinition[] = [];
    const categoriesSummary: Record<string, number> = {
      GroupHeader: 0,
      Statement: 0,
      Entry: 0,
      TransactionDetails: 0,
      Balance: 0,
      Other: 0,
    };

    let idCounter = 1;

    for (const row of rawRows) {
      const fieldDef = this.mapRowToFieldDefinition(row, idCounter++);
      if (fieldDef && (fieldDef.xmlPath || fieldDef.fieldName)) {
        fields.push(fieldDef);
        categoriesSummary[fieldDef.category] = (categoriesSummary[fieldDef.category] || 0) + 1;
      }
    }

    const hierarchicalTree = this.buildHierarchicalTree(fields);

    return {
      title: 'CAMT.053.001.02 Bank To Customer Statement Export Specification',
      version: '053.001.02',
      isoStandard: 'ISO 20022',
      generatedAt: new Date().toISOString(),
      totalFieldsCount: fields.length,
      sheetsProcessed: workbook.SheetNames,
      fields,
      categoriesSummary,
      hierarchicalTree,
    };
  }

  /**
   * Maps a raw Excel sheet row object to a normalized CamtFieldDefinition.
   */
  private mapRowToFieldDefinition(row: Record<string, any>, index: number): CamtFieldDefinition | null {
    // Standardize column key lookup (case-insensitive & trimmed)
    const normalizedRow: Record<string, string> = {};
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      normalizedRow[cleanKey] = (val !== null && val !== undefined) ? String(val).trim() : '';
    }

    const xmlPath = normalizedRow['xmlpath'] || normalizedRow['path'] || normalizedRow['elementpath'] || normalizedRow['tagpath'] || '';
    const tag = normalizedRow['tag'] || normalizedRow['xmltag'] || normalizedRow['element'] || this.extractTagFromPath(xmlPath);
    const fieldName = normalizedRow['fieldname'] || normalizedRow['name'] || normalizedRow['elementname'] || normalizedRow['description'] || `Field_${index}`;
    const description = normalizedRow['description'] || normalizedRow['definition'] || normalizedRow['businessdescription'] || normalizedRow['usage'] || '';
    const multiplicity = normalizedRow['multiplicity'] || normalizedRow['cardinality'] || normalizedRow['occurrence'] || '0..1';
    const dataType = normalizedRow['datatype'] || normalizedRow['type'] || normalizedRow['format'] || 'String';
    const exampleValue = normalizedRow['example'] || normalizedRow['sample'] || normalizedRow['examplevalue'] || '';
    const businessRules = normalizedRow['businessrules'] || normalizedRow['rules'] || normalizedRow['notes'] || normalizedRow['condition'] || '';

    // Ignore header rows or empty rows
    if (!xmlPath && !tag && !fieldName) return null;
    if (fieldName.toLowerCase().includes('field name') || xmlPath.toLowerCase().includes('xml path')) return null;

    const category = this.determineCategory(xmlPath, tag, fieldName);
    const isMandatory = typeof multiplicity === 'string' && multiplicity.startsWith('1');

    return {
      id: `CAMT053-FLD-${String(index).padStart(4, '0')}`,
      xmlPath: xmlPath || tag,
      tag: tag || 'N/A',
      fieldName,
      description,
      multiplicity,
      dataType,
      exampleValue,
      businessRules,
      isMandatory,
      category,
    };
  }

  /**
   * Helper to extract XML tag from path string (e.g. "BkToCstmrStmt/Stmt/Ntry/Amt" -> "Amt").
   */
  private extractTagFromPath(path: string): string {
    if (!path) return '';
    const parts = path.split(/[\/\.]/);
    return parts[parts.length - 1] || '';
  }

  /**
   * Categorize the XML field path into standard CAMT sections.
   */
  private determineCategory(xmlPath: string, tag: string, fieldName: string): CamtFieldDefinition['category'] {
    const combined = `${xmlPath} ${tag} ${fieldName}`.toLowerCase();
    if (combined.includes('grphdr') || combined.includes('groupheader')) return 'GroupHeader';
    if (combined.includes('bal') || combined.includes('balance')) return 'Balance';
    if (combined.includes('ntrydtls') || combined.includes('txdtls') || combined.includes('transaction')) return 'TransactionDetails';
    if (combined.includes('ntry') || combined.includes('entry')) return 'Entry';
    if (combined.includes('stmt') || combined.includes('statement')) return 'Statement';
    return 'Other';
  }

  /**
   * Builds a nested tree structure from linear XML path field definitions.
   */
  public buildHierarchicalTree(fields: CamtFieldDefinition[]): CamtTreeNode[] {
    const rootNodes: CamtTreeNode[] = [];
    const nodeMap = new Map<string, CamtTreeNode>();

    for (const field of fields) {
      const parts = field.xmlPath.split('/').filter(Boolean);
      let currentPath = '';

      parts.forEach((part, idx) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const isLeaf = idx === parts.length - 1;
          const node: CamtTreeNode = {
            tag: part,
            name: isLeaf ? field.fieldName : part,
            xmlPath: currentPath,
            dataType: isLeaf ? field.dataType : 'ComplexType',
            multiplicity: isLeaf ? field.multiplicity : '1..1',
            description: isLeaf ? field.description : `Group node for ${part}`,
            children: [],
          };

          nodeMap.set(currentPath, node);

          if (parentPath && nodeMap.has(parentPath)) {
            const parentNode = nodeMap.get(parentPath)!;
            parentNode.children.push(node);
            if (parentNode.dataType !== 'ComplexType') {
              parentNode.dataType = 'ComplexType';
            }
          } else if (idx === 0) {
            rootNodes.push(node);
          }
        }
      });
    }

    return rootNodes;
  }

  /**
   * Generates a context payload optimized for direct feeding into Google Gemini model prompts.
   */
  public extractAIContext(guideData: CamtExportGuideData): CamtAIContextSummary {
    const keyFields = guideData.fields
      .filter((f) => f.isMandatory || ['Balance', 'Entry', 'TransactionDetails'].includes(f.category))
      .map((f) => ({
        xmlPath: f.xmlPath,
        fieldName: f.fieldName,
        description: f.description,
        tag: f.tag,
      }));

    return {
      systemContext: `You are an expert financial system parser specialized in ISO 20022 CAMT.053.001.02 (Bank to Customer Statement) specification formats. The following metadata details ${guideData.totalFieldsCount} XML element fields exported from the official user guide.`,
      isoStandard: guideData.isoStandard,
      keyFields,
      jsonSchema: this.toGeminiSchema(guideData),
      promptInstructions: `When analyzing CAMT.053 XML payloads or financial transactions:
1. Map XML elements directly to the provided XML paths.
2. Verify element multiplicities (mandatory vs optional).
3. Validate amounts, currency codes (ISO 4217), credit/debit indicators (CRDT/DBIT), and dates (ISO 8601).
4. Use the extracted business rules to flag anomalies or non-compliant statement data.`,
    };
  }

  /**
   * Converts the parsed guide structure into standard JSON Schema suitable for Gemini Function Calling or Structured Outputs.
   */
  public toGeminiSchema(guideData: CamtExportGuideData): Record<string, any> {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'CAMT053StatementData',
      type: 'object',
      properties: {
        groupHeader: {
          type: 'object',
          description: 'Group header information for the CAMT statement',
          properties: this.getPropertiesForCategory(guideData.fields, 'GroupHeader'),
        },
        statements: {
          type: 'array',
          description: 'List of bank to customer statements',
          items: {
            type: 'object',
            properties: {
              statementId: { type: 'string', description: 'Unique statement reference' },
              creationDateTime: { type: 'string', format: 'date-time' },
              balances: {
                type: 'array',
                description: 'Opening and closing balances',
                items: {
                  type: 'object',
                  properties: this.getPropertiesForCategory(guideData.fields, 'Balance'),
                },
              },
              entries: {
                type: 'array',
                description: 'Statement transaction entries',
                items: {
                  type: 'object',
                  properties: {
                    ...this.getPropertiesForCategory(guideData.fields, 'Entry'),
                    details: {
                      type: 'array',
                      description: 'Transaction details for the entry',
                      items: {
                        type: 'object',
                        properties: this.getPropertiesForCategory(guideData.fields, 'TransactionDetails'),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      required: ['groupHeader', 'statements'],
    };
  }

  /**
   * Filters and formats schema properties by category.
   */
  private getPropertiesForCategory(fields: CamtFieldDefinition[], category: CamtFieldDefinition['category']): Record<string, any> {
    const categoryFields = fields.filter((f) => f.category === category);
    const properties: Record<string, any> = {};

    for (const field of categoryFields) {
      const rawKey = (field.tag && field.tag !== 'N/A') ? field.tag : field.fieldName;
      const key = rawKey.replace(/[^a-zA-Z0-9_]/g, '_');
      properties[key] = {
        type: this.mapDataTypeToJsonSchema(field.dataType),
        description: `${field.fieldName}: ${field.description} (Path: ${field.xmlPath})`,
      };
      if (field.exampleValue) {
        properties[key].examples = [field.exampleValue];
      }
    }

    return properties;
  }

  /**
   * Maps CAMT XML data types to JSON Schema data types.
   */
  private mapDataTypeToJsonSchema(dataType: string): string {
    const dt = dataType.toLowerCase();
    if (dt.includes('number') || dt.includes('decimal') || dt.includes('amount') || dt.includes('rate')) return 'number';
    if (dt.includes('bool')) return 'boolean';
    if (dt.includes('int') || dt.includes('integer')) return 'integer';
    return 'string';
  }

  /**
   * Search within the parsed user guide fields by query string (XML path, field name, description, or tag).
   */
  public searchFields(guideData: CamtExportGuideData, query: string): CamtFieldDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return guideData.fields;

    return guideData.fields.filter(
      (field) =>
        field.xmlPath.toLowerCase().includes(q) ||
        field.fieldName.toLowerCase().includes(q) ||
        field.tag.toLowerCase().includes(q) ||
        field.description.toLowerCase().includes(q) ||
        (field.businessRules && field.businessRules.toLowerCase().includes(q))
    );
  }

  /**
   * Extracts formatted text string of the CAMT guide optimized for Gemini RAG (Retrieval-Augmented Generation).
   */
  public toFormattedMarkdownPrompt(guideData: CamtExportGuideData): string {
    const markdownLines: string[] = [
      `# ${guideData.title}`,
      `**ISO Standard:** ${guideData.isoStandard} (${guideData.version})`,
      `**Total Documented Fields:** ${guideData.totalFieldsCount}`,
      `**Extraction Date:** ${guideData.generatedAt}`,
      '',
      '## Field Definitions & Rules',
      '',
      '| Tag | Field Name | Path | Type | Mult. | Mandatory | Description |',
      '| --- | --- | --- | --- | --- | --- | --- |',
    ];

    for (const field of guideData.fields) {
      const sanitizedDesc = field.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      markdownLines.push(
        `| \`${field.tag}\` | ${field.fieldName} | \`${field.xmlPath}\` | ${field.dataType} | ${field.multiplicity} | ${field.isMandatory ? 'Yes' : 'No'} | ${sanitizedDesc} |`
      );
    }

    return markdownLines.join('\n');
  }

  /**
   * Generates a mock JSON payload representing a complete CAMT statement with all mandatory fields
   * populated with their example values or sensible defaults.
   */
  public generateTemplatePayload(guideData: CamtExportGuideData): Record<string, any> {
    const payload: Record<string, any> = {};
    
    const getDefaultsForCategory = (category: CamtFieldDefinition['category']) => {
      const obj: Record<string, any> = {};
      const categoryFields = guideData.fields.filter(f => f.category === category);
      for (const field of categoryFields) {
        if (field.isMandatory) {
          const rawKey = (field.tag && field.tag !== 'N/A') ? field.tag : field.fieldName;
          const key = rawKey.replace(/[^a-zA-Z0-9_]/g, '_');
          let val: any = field.exampleValue || '';
          if (!val) {
            const dt = field.dataType.toLowerCase();
            if (dt.includes('number') || dt.includes('decimal') || dt.includes('amount')) {
              val = 0.0;
            } else if (dt.includes('bool')) {
              val = false;
            } else if (dt.includes('date')) {
              val = new Date().toISOString();
            } else {
              val = 'PLACEHOLDER';
            }
          }
          obj[key] = val;
        }
      }
      return obj;
    };

    payload.groupHeader = getDefaultsForCategory('GroupHeader');
    payload.statement = {
      ...getDefaultsForCategory('Statement'),
      balances: [
        { ...getDefaultsForCategory('Balance'), tp: 'OPBD' },
        { ...getDefaultsForCategory('Balance'), tp: 'CLBD' }
      ],
      entries: [
        {
          ...getDefaultsForCategory('Entry'),
          details: [
            getDefaultsForCategory('TransactionDetails')
          ]
        }
      ]
    };

    return payload;
  }
}

export default CamtExportProcessor;