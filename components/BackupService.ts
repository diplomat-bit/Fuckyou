

// --- CONSOLIDATED FROM: ./Google/BackupService.ts ---

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
import { monitor } from './MonitoringService';
import { secretVault } from './SecretVault';

const execAsync = promisify(exec);

interface BackupManifest {
  timestamp: number;
  files: Record<string, string>;
  version: string;
  signature?: string;
}

export class BackupService {
  private backupDir: string;
  private sourceDir: string;

  constructor(sourceDir: string = process.cwd(), backupDir: string = './local_backups') {
    this.sourceDir = sourceDir;
    this.backupDir = path.join(process.cwd(), backupDir);
  }

  public async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      monitor.log('info', 'BackupService', `Initialized backup directory at ${this.backupDir}`);
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to initialize backup directory: ${error.message}`);
      throw error;
    }
  }

  private async calculateHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  public async createSnapshot(): Promise<string> {
    const snapshotId = `snapshot_${Date.now()}`;
    const snapshotPath = path.join(this.backupDir, snapshotId);
    
    try {
      await fs.mkdir(snapshotPath);
      monitor.log('info', 'BackupService', `Starting snapshot creation: ${snapshotId}`);

      const manifest: BackupManifest = {
        timestamp: Date.now(),
        files: {},
        version: '1.0.0'
      };

      const files = await this.getAllFiles(this.sourceDir);

      for (const file of files) {
        if (file.includes('node_modules') || file.includes('.git') || file.includes(this.backupDir)) continue;

        const relativePath = path.relative(this.sourceDir, file);
        const hash = await this.calculateHash(file);
        
        const destPath = path.join(snapshotPath, relativePath);
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(file, destPath);
        
        manifest.files[relativePath] = hash;
      }

      try {
        let vaultKey = process.env.OKO_VAULT_MASTER_KEY || 'sovereign-salt';
        try {
          if (secretVault && typeof (secretVault as any).getSecret === 'function') {
            const secret = await (secretVault as any).getSecret('OKO_VAULT_MASTER_KEY');
            vaultKey = secret || vaultKey;
          }
        } catch (e) {}

        const signature = createHash('sha256')
          .update(JSON.stringify(manifest.files) + vaultKey)
          .digest('hex');
        manifest.signature = signature;
      } catch (e) {}

      await fs.writeFile(path.join(snapshotPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
      monitor.log('info', 'BackupService', `Snapshot ${snapshotId} created successfully with ${Object.keys(manifest.files).length} files.`);
      return snapshotId;
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to create snapshot ${snapshotId}: ${error.message}`);
      throw error;
    }
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map((res) => {
      const resPath = path.resolve(dir, res.name);
      return res.isDirectory() ? this.getAllFiles(resPath) : Promise.resolve([resPath]);
    }));
    return files.flat();
  }

  public async restore(snapshotId: string): Promise<void> {
    const snapshotPath = path.join(this.backupDir, snapshotId);
    const manifestPath = path.join(snapshotPath, 'manifest.json');
    
    try {
      monitor.log('info', 'BackupService', `Initiating restore from snapshot: ${snapshotId}`);
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: BackupManifest = JSON.parse(manifestContent);

      if (manifest.signature) {
        let vaultKey = process.env.OKO_VAULT_MASTER_KEY || 'sovereign-salt';
        try {
          if (secretVault && typeof (secretVault as any).getSecret === 'function') {
            const secret = await (secretVault as any).getSecret('OKO_VAULT_MASTER_KEY');
            vaultKey = secret || vaultKey;
          }
        } catch (e) {}

        const expectedSignature = createHash('sha256')
          .update(JSON.stringify(manifest.files) + vaultKey)
          .digest('hex');
        
        if (expectedSignature !== manifest.signature) {
          monitor.log('warn', 'BackupService', `Manifest signature mismatch for snapshot ${snapshotId}. Proceeding with caution.`);
        }
      }

      for (const [relativePath, originalHash] of Object.entries(manifest.files)) {
        const sourceFile = path.join(snapshotPath, relativePath);
        const targetFile = path.join(this.sourceDir, relativePath);
        
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.copyFile(sourceFile, targetFile);
      }
      
      monitor.log('info', 'BackupService', `Restore from snapshot ${snapshotId} completed successfully.`);
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to restore snapshot ${snapshotId}: ${error.message}`);
      throw error;
    }
  }

  public async verifyBackup(snapshotId: string): Promise<boolean> {
    const snapshotPath = path.join(this.backupDir, snapshotId);
    const manifestPath = path.join(snapshotPath, 'manifest.json');
    
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: BackupManifest = JSON.parse(manifestContent);

      let vaultKey = process.env.OKO_VAULT_MASTER_KEY || 'sovereign-salt';
      try {
        if (secretVault && typeof (secretVault as any).getSecret === 'function') {
          const secret = await (secretVault as any).getSecret('OKO_VAULT_MASTER_KEY');
          vaultKey = secret || vaultKey;
        }
      } catch (e) {}

      if (manifest.signature) {
        const expectedSignature = createHash('sha256')
          .update(JSON.stringify(manifest.files) + vaultKey)
          .digest('hex');
        
        if (expectedSignature !== manifest.signature) {
          monitor.log('error', 'BackupService', `Signature verification failed for snapshot ${snapshotId}`);
          return false;
        }
      }

      for (const [relativePath, originalHash] of Object.entries(manifest.files)) {
        const filePath = path.join(snapshotPath, relativePath);
        try {
          const currentHash = await this.calculateHash(filePath);
          if (currentHash !== originalHash) {
            monitor.log('error', 'BackupService', `File integrity check failed for ${relativePath} in snapshot ${snapshotId}`);
            return false;
          }
        } catch (err) {
          monitor.log('error', 'BackupService', `Missing or unreadable file ${relativePath} in snapshot ${snapshotId}`);
          return false;
        }
      }

      monitor.log('info', 'BackupService', `Snapshot ${snapshotId} verified successfully.`);
      return true;
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to verify snapshot ${snapshotId}: ${error.message}`);
      return false;
    }
  }

  public async listBackups(): Promise<{ id: string; timestamp: number; version: string; fileCount: number }[]> {
    try {
      const entries = await fs.readdir(this.backupDir, { withFileTypes: true });
      const snapshots = entries.filter(e => e.isDirectory() && e.name.startsWith('snapshot_'));
      
      const list = [];
      for (const snapshot of snapshots) {
        const manifestPath = path.join(this.backupDir, snapshot.name, 'manifest.json');
        try {
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest: BackupManifest = JSON.parse(manifestContent);
          list.push({
            id: snapshot.name,
            timestamp: manifest.timestamp,
            version: manifest.version,
            fileCount: Object.keys(manifest.files).length
          });
        } catch (e) {}
      }
      return list.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to list backups: ${error.message}`);
      return [];
    }
  }

  public async exportBackup(snapshotId: string, exportPath: string): Promise<void> {
    const snapshotPath = path.join(this.backupDir, snapshotId);
    try {
      await fs.access(snapshotPath);
      const targetTar = path.resolve(exportPath);
      await fs.mkdir(path.dirname(targetTar), { recursive: true });
      
      const cmd = process.platform === 'win32'
        ? `powershell Compress-Archive -Path "${snapshotPath}\\*" -DestinationPath "${targetTar}" -Force`
        : `tar -czf "${targetTar}" -C "${this.backupDir}" "${snapshotId}"`;
      
      await execAsync(cmd);
      monitor.log('info', 'BackupService', `Exported snapshot ${snapshotId} to ${targetTar}`);
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to export snapshot ${snapshotId}: ${error.message}`);
      throw error;
    }
  }

  public async importBackup(importPath: string): Promise<string> {
    const snapshotId = `snapshot_imported_${Date.now()}`;
    const snapshotPath = path.join(this.backupDir, snapshotId);
    try {
      await fs.mkdir(snapshotPath, { recursive: true });
      const sourceTar = path.resolve(importPath);
      
      const cmd = process.platform === 'win32'
        ? `powershell Expand-Archive -Path "${sourceTar}" -DestinationPath "${snapshotPath}" -Force`
        : `tar -xzf "${sourceTar}" -C "${snapshotPath}" --strip-components=1`;
      
      await execAsync(cmd);
      
      const manifestPath = path.join(snapshotPath, 'manifest.json');
      await fs.access(manifestPath);
      
      monitor.log('info', 'BackupService', `Imported snapshot successfully as ${snapshotId}`);
      return snapshotId;
    } catch (error: any) {
      try {
        await fs.rm(snapshotPath, { recursive: true, force: true });
      } catch (e) {}
      monitor.log('error', 'BackupService', `Failed to import backup from ${importPath}: ${error.message}`);
      throw error;
    }
  }

  public async pruneOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const backups = (await fs.readdir(this.backupDir)).sort().reverse();
      if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        for (const dir of toDelete) {
          await fs.rm(path.join(this.backupDir, dir), { recursive: true, force: true });
          monitor.log('info', 'BackupService', `Pruned old backup directory: ${dir}`);
        }
      }
    } catch (error: any) {
      monitor.log('error', 'BackupService', `Failed to prune old backups: ${error.message}`);
    }
  }
}

export const backupService = new BackupService();