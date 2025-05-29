import * as fs from "fs/promises";
import * as path from "path";
import { db } from "../config/database";

export interface StorageInfo {
  totalSpace: number;
  usedSpace: number;
  freeSpace: number;
  mediaFiles: {
    totalCount: number;
    totalSize: number;
    imageCount: number;
    imageSize: number;
    videoCount: number;
    videoSize: number;
  };
  originals: {
    totalSize: number;
    path: string;
  };
  thumbnails: {
    totalSize: number;
    path: string;
  };
}

export class StorageService {
  private originalsPath =
    process.env.MEDIA_ORIGINALS_PATH || "./data/originals";
  private thumbsPath = process.env.MEDIA_THUMBS_PATH || "./data/thumbs";

  async getStorageInfo(): Promise<StorageInfo> {
    // Get disk space information for the main storage path
    const diskSpace = await this.getDiskSpace(this.originalsPath);

    // Get media file statistics from database
    const mediaStats = await this.getMediaFileStats();

    // Calculate directory sizes
    const originalsSize = await this.getDirectorySize(this.originalsPath);
    const thumbnailsSize = await this.getDirectorySize(this.thumbsPath);

    return {
      totalSpace: diskSpace.total,
      usedSpace: diskSpace.used,
      freeSpace: diskSpace.free,
      mediaFiles: mediaStats,
      originals: {
        totalSize: originalsSize,
        path: this.originalsPath,
      },
      thumbnails: {
        totalSize: thumbnailsSize,
        path: this.thumbsPath,
      },
    };
  }

  private async getDiskSpace(dirPath: string): Promise<{
    total: number;
    used: number;
    free: number;
  }> {
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      // Try different commands based on platform
      let command: string;

      if (process.platform === "win32") {
        // Windows - use PowerShell
        const drive = path.parse(dirPath).root;
        command = `powershell "Get-WmiObject -Class Win32_LogicalDisk -Filter \\"DeviceID='${drive.replace(
          "\\",
          ""
        )}'\\" | Select-Object Size,FreeSpace | ConvertTo-Json"`;
      } else {
        // Unix-like systems (macOS, Linux) - use df
        command = `df -k "${dirPath}" | tail -1`;
      }

      const { stdout } = await execAsync(command);

      if (process.platform === "win32") {
        // Parse Windows PowerShell JSON output
        const diskInfo = JSON.parse(stdout);
        return {
          total: parseInt(diskInfo.Size),
          used: parseInt(diskInfo.Size) - parseInt(diskInfo.FreeSpace),
          free: parseInt(diskInfo.FreeSpace),
        };
      } else {
        // Parse Unix df output
        const parts = stdout.trim().split(/\s+/);

        if (parts.length >= 6) {
          const totalBlocks = parseInt(parts[1]);
          const usedBlocks = parseInt(parts[2]);
          const freeBlocks = parseInt(parts[3]);

          // Convert from KB to bytes
          return {
            total: totalBlocks * 1024,
            used: usedBlocks * 1024,
            free: freeBlocks * 1024,
          };
        }
      }
    } catch (error) {
      console.warn("Could not get disk space info via system commands:", error);
    }

    // Fallback: use Node.js fs.statfs if available (Node 19+)
    try {
      if (fs.statfs) {
        const stats = await fs.statfs(dirPath);
        return {
          total: stats.bavail * stats.bsize,
          used: (stats.blocks - stats.bavail) * stats.bsize,
          free: stats.bavail * stats.bsize,
        };
      }
    } catch (error) {
      console.warn("Could not get disk space info via fs.statfs:", error);
    }

    // Final fallback: estimate based on directory size
    try {
      const dirSize = await this.getDirectorySize(dirPath);

      // This is a rough estimate - assume the directory uses 10% of available space
      const estimatedTotal = dirSize * 10;
      return {
        total: estimatedTotal,
        used: dirSize,
        free: estimatedTotal - dirSize,
      };
    } catch (error) {
      console.error("Error getting disk space (all methods failed):", error);
      return {
        total: 0,
        used: 0,
        free: 0,
      };
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      await fs.access(dirPath);
      const files = await this.getAllFiles(dirPath);

      for (const file of files) {
        try {
          const stats = await fs.stat(file);
          if (stats.isFile()) {
            totalSize += stats.size;
          }
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }
    } catch (error) {
      console.warn(`Could not access directory ${dirPath}:`, error);
    }

    return totalSize;
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);

        try {
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            const subFiles = await this.getAllFiles(fullPath);
            files.push(...subFiles);
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip entries that can't be accessed
          continue;
        }
      }
    } catch (error) {
      console.warn(`Error reading directory ${dirPath}:`, error);
    }

    return files;
  }

  private async getMediaFileStats(): Promise<{
    totalCount: number;
    totalSize: number;
    imageCount: number;
    imageSize: number;
    videoCount: number;
    videoSize: number;
  }> {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_count,
          COALESCE(SUM(file_size), 0) as total_size,
          COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as image_count,
          COALESCE(SUM(CASE WHEN mime_type LIKE 'image/%' THEN file_size ELSE 0 END), 0) as image_size,
          COUNT(CASE WHEN mime_type LIKE 'video/%' THEN 1 END) as video_count,
          COALESCE(SUM(CASE WHEN mime_type LIKE 'video/%' THEN file_size ELSE 0 END), 0) as video_size
        FROM media_files
      `);

      const row = result.rows[0];

      return {
        totalCount: parseInt(row.total_count),
        totalSize: parseInt(row.total_size),
        imageCount: parseInt(row.image_count),
        imageSize: parseInt(row.image_size),
        videoCount: parseInt(row.video_count),
        videoSize: parseInt(row.video_size),
      };
    } catch (error) {
      console.error("Error getting media file stats:", error);
      return {
        totalCount: 0,
        totalSize: 0,
        imageCount: 0,
        imageSize: 0,
        videoCount: 0,
        videoSize: 0,
      };
    }
  }
}
