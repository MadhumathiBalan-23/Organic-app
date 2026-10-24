import { prisma } from '../config/db';

export class LogService {
  public static async getUserLogs() {
    return prisma.userLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
  }

  public static async getAIAlerts() {
    return prisma.aIAlert.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async createUserLog(data: any) {
    return prisma.userLog.create({
      data: {
        user: data.user || 'Admin',
        role: data.role || 'Admin',
        action: data.action,
        module: data.module || 'System',
        ip: data.ip || '127.0.0.1',
        type: data.type || 'create'
      }
    });
  }
}
